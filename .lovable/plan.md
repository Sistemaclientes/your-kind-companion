

# Plan: Fix Authentication Email System

## Current Problems

The entire auth system is **custom and insecure** — passwords are stored in plaintext in `admins` and `alunos` tables. There is no actual Supabase Auth integration. The "forgot password" flow just updates the DB directly without sending emails. The email confirmation page (`/confirmar-email`) calls a non-existent API route. No emails are actually sent.

## Approach

Migrate authentication to **Supabase Auth** (`supabase.auth.*`) so that email sending (password reset, signup confirmation) works natively via Supabase's built-in email system. This gives us secure password hashing, JWT sessions, and automatic email delivery.

## Steps

### 1. Update `auth.service.ts` to use Supabase Auth

- **Admin login**: Use `supabase.auth.signInWithPassword()` instead of querying plaintext passwords
- **Student login**: Use `supabase.auth.signInWithPassword()`
- **Student register**: Use `supabase.auth.signUp()` with metadata (nome, telefone, cpf)
- **Forgot password**: Use `supabase.auth.resetPasswordForEmail()` with `redirectTo`
- **Logout**: Use `supabase.auth.signOut()`

### 2. Update `authStore.ts` to use Supabase sessions

- Replace localStorage-based session with `supabase.auth.onAuthStateChange()` listener
- Get user role from `profiles` table (already exists with a `role` column)
- Remove manual localStorage token management

### 3. Create new pages

- **`/auth/callback`** — Handles Supabase auth redirects (email confirmation, password reset). Detects `type=recovery` to redirect to update-password page, otherwise redirects based on user role.
- **`/update-password`** — Form to set new password using `supabase.auth.updateUser({ password })`. Validates password match, min length, shows loading/success/error states.

### 4. Update existing pages

- **`LoginPage.tsx`** (admin) — Replace `api.login()` with `supabase.auth.signInWithPassword()`. Update forgot password to call `supabase.auth.resetPasswordForEmail()`. Remove the inline reset-password view (now handled by `/update-password`).
- **`StudentLoginPage.tsx`** — Replace `api.post('/student/login')` with `supabase.auth.signInWithPassword()`. Replace register with `supabase.auth.signUp()`. Update forgot password to use `supabase.auth.resetPasswordForEmail()`.
- **`ConfirmEmailPage.tsx`** — Remove (replaced by `/auth/callback`)

### 5. Update routes in `App.tsx`

- Add `/auth/callback` route
- Add `/update-password` route  
- Remove `/confirmar-email` route
- Add legacy redirect from `/confirmar-email` to `/auth/callback`

### 6. Update `api.ts` compatibility layer

- Update auth-related routes to use the new Supabase Auth methods

## Important Notes

- The `handle_new_user()` database trigger already creates profiles and links to `alunos`/`admins` tables on signup — no DB migration needed
- Supabase's built-in email templates handle password reset and signup confirmation emails automatically
- Existing admin accounts in the `admins` table will need to be registered in Supabase Auth (one-time migration concern — documented for the user)

