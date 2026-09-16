import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3.23.8'

const InspectSchema = z.object({ action: z.literal('inspect'), token: z.string().min(20).max(200) })
const ActivateSchema = z.object({
  action: z.literal('activate'),
  token: z.string().min(20).max(200),
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  companyName: z.string().trim().min(2).max(120),
  cnpj: z.string().trim().max(18).optional().default(''),
  cpf: z.string().trim().max(14).optional().default(''),
  segment: z.string().trim().min(1).max(100),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().length(2),
  phone: z.string().trim().min(8).max(20),
  website: z.string().trim().max(200).optional().default(''),
  description: z.string().trim().min(10).max(1000),
  address: z.string().trim().min(3).max(200),
  neighborhood: z.string().trim().min(2).max(100),
  complement: z.string().trim().max(200).optional().default(''),
  referencePoint: z.string().trim().max(200).optional().default(''),
  zipCode: z.string().trim().min(8).max(10),
  contactName: z.string().trim().min(2).max(100),
  contactRole: z.string().trim().min(2).max(100),
  contactPhone: z.string().trim().min(8).max(20),
  logoBase64: z.string().min(100).max(3_000_000).optional(),
  logoType: z.enum(['image/jpeg', 'image/png', 'image/webp']).optional(),
})

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})

const hashToken = async (token: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const onlyDigits = (value: string) => value.replace(/\D/g, '')
const isValidCpf = (value: string) => {
  const digits = onlyDigits(value)
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false
  const digit = (length: number) => {
    const sum = digits.slice(0, length).split('').reduce((total, item, index) => total + Number(item) * (length + 1 - index), 0)
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }
  return digit(9) === Number(digits[9]) && digit(10) === Number(digits[10])
}
const isValidCnpj = (value: string) => {
  const digits = onlyDigits(value)
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false
  const digit = (base: string) => {
    let sum = 0
    let position = base.length - 7
    for (let index = base.length; index >= 1; index -= 1) {
      sum += Number(base.charAt(base.length - index)) * position--
      if (position < 2) position = 9
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11)
  }
  return digit(digits.slice(0, 12)) === Number(digits[12]) && digit(digits.slice(0, 13)) === Number(digits[13])
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405)

  let body: unknown
  try { body = await req.json() } catch { return json({ error: 'Dados inválidos' }, 400) }

  const base = z.object({ action: z.enum(['inspect', 'activate']), token: z.string() }).safeParse(body)
  if (!base.success) return json({ error: 'Convite inválido' }, 400)

  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) return json({ error: 'Serviço indisponível' }, 500)
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

  const tokenHash = await hashToken(base.data.token)
  const { data: invitation } = await admin
    .from('waitlist')
    .select('*')
    .eq('invitation_token_hash', tokenHash)
    .eq('decision_status', 'accepted')
    .is('activated_at', null)
    .gt('invitation_expires_at', new Date().toISOString())
    .maybeSingle()

  if (!invitation) return json({ error: 'Este convite é inválido, expirou ou já foi utilizado.' }, 404)

  if (base.data.action === 'inspect') {
    const parsed = InspectSchema.safeParse(body)
    if (!parsed.success) return json({ error: 'Convite inválido' }, 400)
    return json({ invitation: {
      companyName: invitation.company_name,
      contactName: invitation.contact_name,
      whatsapp: invitation.whatsapp,
      segment: invitation.segment,
      cnpj: invitation.cnpj,
      cpf: invitation.cpf,
      expiresAt: invitation.invitation_expires_at,
    } })
  }

  const parsed = ActivateSchema.safeParse(body)
  if (!parsed.success) return json({ error: 'Revise os dados obrigatórios do formulário.' }, 400)
  const value = parsed.data
  if (value.cnpj && !isValidCnpj(value.cnpj)) return json({ error: 'CNPJ inválido.' }, 400)
  if (value.cpf && !isValidCpf(value.cpf)) return json({ error: 'CPF inválido.' }, 400)

  if (value.cnpj) {
    const { data: existingProfile } = await admin.from('profiles').select('id').eq('cnpj', value.cnpj).maybeSingle()
    if (existingProfile) return json({ error: 'Este CNPJ já possui cadastro no portal.' }, 409)
  }
  if (value.cpf) {
    const { data: existingProfile } = await admin.from('profiles').select('id').eq('cpf', value.cpf).maybeSingle()
    if (existingProfile) return json({ error: 'Este CPF já possui cadastro no portal.' }, 409)
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: value.email,
    password: value.password,
    email_confirm: true,
  })
  if (createError || !created.user) {
    const duplicate = createError?.message.toLowerCase().includes('already')
    return json({ error: duplicate ? 'Este e-mail já possui uma conta. Entre com sua conta existente.' : 'Não foi possível criar sua conta.' }, 409)
  }

  const userId = created.user.id
  let logoUrl: string | null = null
  if (value.logoBase64 && value.logoType) {
    const extension = value.logoType === 'image/png' ? 'png' : value.logoType === 'image/webp' ? 'webp' : 'jpg'
    const logoPath = `${userId}/logo.${extension}`
    const logoBytes = Uint8Array.from(atob(value.logoBase64), (character) => character.charCodeAt(0))
    if (logoBytes.byteLength > 2 * 1024 * 1024) {
      await admin.auth.admin.deleteUser(userId)
      return json({ error: 'A logo deve ter no máximo 2 MB.' }, 400)
    }
    const { error: logoError } = await admin.storage.from('logos').upload(logoPath, logoBytes, { contentType: value.logoType, upsert: true })
    if (logoError) {
      await admin.auth.admin.deleteUser(userId)
      return json({ error: 'Não foi possível salvar a logo da empresa.' }, 500)
    }
    const { data: logoData } = admin.storage.from('logos').getPublicUrl(logoPath)
    logoUrl = logoData.publicUrl
  }
  const profileUpdates = {
    company_name: value.companyName,
    cnpj: value.cnpj || null,
    cpf: value.cpf || null,
    segment: value.segment,
    city: value.city,
    state: value.state.toUpperCase(),
    phone: value.phone,
    email: value.email,
    website: value.website || null,
    description: value.description,
    address: value.address,
    neighborhood: value.neighborhood,
    complement: value.complement || null,
    reference_point: value.referencePoint || null,
    zip_code: value.zipCode,
    contact_name: value.contactName,
    contact_role: value.contactRole,
    contact_email: value.email,
    contact_phone: value.contactPhone,
    approved: true,
    plan: 'basic',
    logo_url: logoUrl,
  }

  const { error: profileError } = await admin.from('profiles').update(profileUpdates).eq('user_id', userId)
  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    return json({ error: 'Não foi possível concluir o perfil da empresa.' }, 500)
  }

  const { data: activated, error: activationError } = await admin
    .from('waitlist')
    .update({
      decision_status: 'activated',
      activated_at: new Date().toISOString(),
      activated_user_id: userId,
      invitation_token_hash: null,
      invitation_expires_at: null,
    })
    .eq('id', invitation.id)
    .eq('invitation_token_hash', tokenHash)
    .eq('decision_status', 'accepted')
    .is('activated_at', null)
    .select('id')
    .maybeSingle()

  if (activationError || !activated) {
    await admin.auth.admin.deleteUser(userId)
    return json({ error: 'O convite já foi utilizado. Nenhuma nova conta foi criada.' }, 409)
  }

  return json({ success: true, email: value.email })
})
