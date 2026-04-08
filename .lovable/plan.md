

## Diagnosis

After analyzing the codebase, I identified these root causes for the reported issues:

### 1. Missing Loading States (Infinite Loading)
`StudentLoginPage.tsx` has **no loading state variable** for login or register. The `handleLogin` and `handleRegister` functions don't disable the submit button or show spinners, so:
- Users can click multiple times, creating duplicate requests
- If an error occurs silently, the UI appears frozen

### 2. Registration Doesn't Save Email
`registerStudent()` inserts only `{ id, nome }` into `alunos`, but the `email` column is never populated. This causes the student profile to be incomplete, and any email-based lookup will fail.

### 3. Forgot Password Redirects to Wrong Page
`forgotPassword()` uses `redirectTo: window.location.origin + '/redefinir-senha'`, which renders `LoginPage` (the admin login). Students clicking the reset link land on the admin page, not the student panel. Additionally, neither login page properly handles the recovery flow from the URL hash in a way that works with the Supabase PKCE flow.

### 4. Stale Refresh Tokens Not Handled
Console logs show `AuthApiError: Invalid Refresh Token: Refresh Token Not Found`. The auth store doesn't gracefully handle this — it can leave `isLoading: true` indefinitely if the token refresh fails during `INITIAL_SESSION`.

---

## Plan

### File 1: `src/pages/StudentLoginPage.tsx`
**Add loading states to login and register handlers (no layout changes)**

- Add `const [isLoading, setIsLoading] = React.useState(false)` state
- In `handleLogin`: wrap with `setIsLoading(true)` before try, `setIsLoading(false)` in finally
- In `handleRegister`: wrap with `setIsLoading(true)` before try, `setIsLoading(false)` in finally
- Disable submit buttons when `isLoading` is true
- Add `disabled:opacity-50` to both submit buttons (styling already exists in the class pattern)

### File 2: `src/services/auth.service.ts`
**Fix registration and password reset**

- `registerStudent`: Add `email: data.email.trim().toLowerCase()` to the `alunos` insert payload
- `forgotPassword`: Change `redirectTo` to use the current page origin without a fixed path, so it works for both admin and student contexts. Use `window.location.origin + window.location.pathname` so the reset link returns to the same login page the user was on.
- Add better error messages: map common Supabase error codes to user-friendly Portuguese messages

### File 3: `src/lib/authStore.ts`
**Handle stale refresh token errors gracefully**

- In the `INITIAL_SESSION` handler inside `onAuthStateChange`: if session exists but `resolveUser` fails, clear localStorage auth data and set `isLoading: false` (prevent infinite loading)
- Add error handling in `resolveUser` to catch the `refresh_token_not_found` scenario: call `supabase.auth.signOut()` to clear the corrupted session, then set user to null

### File 4: `vercel.json`
**No changes needed** — the SPA rewrite and cache headers are already configured correctly.

---

### Summary of Fixes
| Problem | Root Cause | Fix |
|---|---|---|
| Infinite loading on register/login | No loading state in StudentLoginPage | Add isLoading state with try/catch/finally |
| Login fails after registration | Email not saved to alunos table | Add email field to insert |
| "Erro ao processar" on password reset | Reset link goes to admin page | Use context-aware redirect URL |
| Stale token causes blank screen | No error handling for invalid refresh token | Gracefully sign out and clear state |

