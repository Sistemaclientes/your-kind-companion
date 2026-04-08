

## Plan: Fix Broken Buttons, Add Auth Timeout, and System-Wide Bug Sweep

### Problems Found

1. **Delete student broken**: `StudentsPage` passes `student.email` to `studentsService.deleteStudent()`, but that function queries by `.eq('id', userId)` — email ≠ UUID, so delete silently fails.

2. **Edit student button does nothing**: `editingStudent` state is set but no edit modal/form is rendered in the JSX. The edit button appears to work (pencil icon) but nothing happens visually.

3. **`dashboardService.getStudents()` missing fields**: Returns no `email`, `cpf`, or `telefone` — so the edit form can't pre-fill and delete can't identify students by email.

4. **`api.ts` missing routes**: PATCH routes (like `/admin/students/status/...`), PUT for categories, and several admin routes all silently return `[]` because `handleRoute` has no matching case.

5. **No auth timeout visual**: Both login pages lack a timeout mechanism when authentication takes too long.

6. **`StudentDetailsPage` uses `api.patch` for status update**: This route isn't handled, so "Confirmar Manualmente" button fails silently.

---

### Changes

#### File 1: `src/services/dashboard.service.ts`
**Add missing fields to `getStudents()` return**
- Include `email`, `cpf`, `telefone` from the `alunos` record so `StudentsPage` can use them for edit/delete operations.

#### File 2: `src/services/students.service.ts`
**Fix `deleteStudent` to work by email or ID, add `updateStudent` method**
- Add `deleteStudentByEmail`: query aluno by email first, then delete by ID
- Add `updateStudent(id, data)`: update nome/cpf/telefone fields
- Add `updateStatusByEmail(email, status)`: find student by email, update status

#### File 3: `src/lib/api.ts`
**Add missing route handlers**
- PUT `/categorias/:id` → `categoriesService.update()`
- PATCH `/admin/students/status/:email` → `studentsService.updateStatusByEmail()`
- Add fallback error for unmatched routes (throw instead of silently returning `[]`)

#### File 4: `src/pages/StudentsPage.tsx`
**Fix delete to use student ID, add edit modal**
- Change delete handler to use `student.id` instead of `student.email`
- Add an edit modal that appears when `editingStudent` is set, with save/cancel buttons
- Save calls `studentsService.updateStudent()` and updates local state

#### File 5: `src/pages/StudentDetailsPage.tsx`
**Fix "Confirmar Manualmente" button**
- Replace `api.patch(...)` with direct `studentsService.updateStatus(studentData.id, 'Cadastrado')` call

#### File 6: `src/pages/StudentLoginPage.tsx` & `src/pages/LoginPage.tsx`
**Add 10-second auth timeout visual**
- Add a `useEffect` that starts a timer when `isLoading` becomes true
- After 10s, show error message: "A autenticação está demorando mais que o esperado. Verifique sua conexão e tente novamente."
- Clear timer on success/failure

---

### Summary Table

| Bug | Root Cause | Fix |
|---|---|---|
| Delete student fails | Passing email to `.eq('id')` | Use student UUID |
| Edit button does nothing | No edit modal rendered | Add edit modal component |
| "Confirmar Manualmente" fails | PATCH route not in api.ts | Use direct service call |
| Category update fails | PUT `/categorias/:id` not routed | Add route to api.ts |
| No timeout feedback | Missing timeout mechanism | Add 10s timer with error message |
| Missing student data | getStudents omits email/cpf/phone | Add fields to return |

