

## Plan: Create Company Registration Page

### New file: `src/pages/CompanyRegistrationPage.tsx`

A multi-section registration form with the following fields:

**Company Info**
- Company name (text)
- CNPJ (text with mask XX.XXX.XXX/XXXX-XX)
- Segment (select from predefined categories)
- City (select: Quatro Barras / Campina Grande do Sul)
- Website (optional URL)
- Phone (text)
- Email (text)

**Profile**
- Logo upload (file input with image preview)
- Description (textarea)
- Address (text)

**Plan Selection**
- Radio group: Basic vs Premium

**Responsible Person**
- Contact name
- Contact role
- Contact email
- Contact phone

Uses existing UI components (Input, Textarea, Select, Button, Card, Label) and follows the same visual patterns (motion animations, card-shadow, primary color scheme). Form validation with zod + react-hook-form. On submit shows a success toast.

### Update: `src/App.tsx`
- Add route `/cadastro` pointing to the new page.

### Update: `src/pages/LandingPage.tsx`
- Link the CTA button "Cadastre sua Empresa" to `/cadastro`.

### Update: `src/components/layout/Header.tsx`
- Change "Entrar" button to also have a nearby "Cadastrar" link/button pointing to `/cadastro`.

