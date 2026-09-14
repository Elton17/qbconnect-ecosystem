import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3.23.8'

const BodySchema = z.object({
  waitlistId: z.string().uuid(),
  decision: z.enum(['accepted', 'rejected']),
})

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})

const hashToken = async (token: string) => {
  const bytes = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405)

  try {
    const authorization = req.headers.get('Authorization')
    if (!authorization?.startsWith('Bearer ')) return json({ error: 'Autenticação necessária' }, 401)

    const url = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !anonKey || !serviceKey) return json({ error: 'Serviço indisponível' }, 500)

    const token = authorization.slice(7)
    const authClient = createClient(url, anonKey)
    const { data: userData, error: userError } = await authClient.auth.getUser(token)
    if (userError || !userData.user) return json({ error: 'Sessão inválida' }, 401)

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { data: role } = await admin
      .from('user_roles')
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .maybeSingle()
    if (!role) return json({ error: 'Acesso restrito a administradores' }, 403)

    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) return json({ error: 'Dados inválidos' }, 400)

    const { waitlistId, decision } = parsed.data
    const decisionAt = new Date().toISOString()
    let invitationToken: string | null = null
    let invitationExpiresAt: string | null = null
    let invitationTokenHash: string | null = null

    if (decision === 'accepted') {
      invitationToken = `${crypto.randomUUID()}${crypto.randomUUID().replaceAll('-', '')}`
      invitationTokenHash = await hashToken(invitationToken)
      invitationExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }

    const { data, error } = await admin
      .from('waitlist')
      .update({
        decision_status: decision,
        decision_at: decisionAt,
        invitation_token_hash: invitationTokenHash,
        invitation_expires_at: invitationExpiresAt,
      })
      .eq('id', waitlistId)
      .is('activated_at', null)
      .select('*')
      .maybeSingle()

    if (error) return json({ error: 'Não foi possível registrar a decisão' }, 500)
    if (!data) return json({ error: 'Pré-cadastro não encontrado ou já ativado' }, 409)

    return json({ entry: data, invitationToken })
  } catch {
    return json({ error: 'Não foi possível processar a solicitação' }, 500)
  }
})
