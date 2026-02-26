

## Plan: CNPJ Auto-fill + Functional Modules

### 1. CNPJ Auto-fill via BrasilAPI (free, no key needed)

**New edge function**: `supabase/functions/cnpj-lookup/index.ts`
- Calls `https://brasilapi.com.br/api/cnpj/v1/{cnpj}` (free, no API key)
- Returns company name, address, segment, phone, email
- CORS headers for frontend access

**Update `src/pages/CompanyRegistrationPage.tsx`**:
- After CNPJ is fully typed (14 digits), call the edge function
- Auto-fill fields: companyName, address, phone, email, segment (best match)
- Show loading spinner on CNPJ field during lookup
- User can still edit auto-filled values

### 2. Add Cities

**Update `CompanyRegistrationPage.tsx` and `ProfilePage.tsx`**:
- Add "Colombo", "Pinhais", "Curitiba" to city select options

### 3. Database Tables for Real Data

**Migration** — Create 3 new tables:

```sql
-- Opportunities table
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL, -- fornecedor, parceiro, contratando, estoque
  value text DEFAULT '',
  urgent boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Courses table
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT '',
  duration text DEFAULT '',
  premium boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Benefits table
CREATE TABLE public.benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  offer text NOT NULL,
  category text DEFAULT '',
  exclusive boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

Plus RLS policies for each:
- Authenticated users can INSERT their own records
- Authenticated users can UPDATE/DELETE their own records
- Everyone can SELECT active records

Plus `updated_at` triggers for each table.

### 4. Marketplace — Real Data

**Update `src/pages/MarketplacePage.tsx`**:
- Query `profiles` table (approved companies) instead of mock data
- Show logo, company name, segment, city, description
- Keep existing filters and search working against real data

### 5. Opportunities — Full CRUD

**Update `src/pages/OpportunitiesPage.tsx`**:
- Fetch from `opportunities` table joined with `profiles` for company name
- Add "Publicar Oportunidade" dialog with form (title, type, value, description, urgent)
- Logged-in users can create/edit/delete their own opportunities
- Keep existing filter/search UI

### 6. Academy — Full CRUD

**Update `src/pages/AcademyPage.tsx`**:
- Fetch from `courses` table joined with `profiles` for company name
- Add "Criar Curso" dialog for logged-in users
- Form: title, category, duration, premium flag, description

### 7. Benefits — Full CRUD

**Update `src/pages/BenefitsPage.tsx`**:
- Fetch from `benefits` table joined with `profiles` for company name
- Add "Criar Benefício" dialog for logged-in users
- Form: offer, category, exclusive flag

### 8. Ranking — Real Data

**Update `src/pages/RankingPage.tsx`**:
- Query approved profiles and count their opportunities, courses, and benefits to compute a score
- Replace mock data with computed ranking

### Files Changed Summary

| File | Action |
|------|--------|
| `supabase/functions/cnpj-lookup/index.ts` | New — BrasilAPI proxy |
| `supabase/config.toml` | Auto-updated for edge function |
| Migration SQL | New — 3 tables + RLS + triggers |
| `src/pages/CompanyRegistrationPage.tsx` | CNPJ auto-fill + cities |
| `src/pages/ProfilePage.tsx` | Add cities |
| `src/pages/MarketplacePage.tsx` | Real data from profiles |
| `src/pages/OpportunitiesPage.tsx` | Real CRUD with DB |
| `src/pages/AcademyPage.tsx` | Real CRUD with DB |
| `src/pages/BenefitsPage.tsx` | Real CRUD with DB |
| `src/pages/RankingPage.tsx` | Real computed ranking |

