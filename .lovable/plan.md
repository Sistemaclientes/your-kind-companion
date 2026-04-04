
## Plano de Reestruturação do SaaS

### Fase 1 — Limpeza de Arquitetura
- Remover pasta `/server` (Node.js/SQLite backend)
- Remover arquivos legados (`check_db.js`, `list_tables.js`, `extract_schema.*`, `generate_import.js`, `import_data.sql`, `database.sqlite`)
- Remover dependências Node backend (`better-sqlite3`, `bcryptjs`, `jsonwebtoken`, `express`, etc.)
- Garantir que `src/lib/api.ts` use apenas Supabase client

### Fase 2 — Reorganização de Código
- Criar estrutura: `/services`, `/hooks`, `/layouts`, `/store`
- Mover `AdminLayout` e `StudentLayout` para `/layouts`
- Extrair lógica de API para `/services` (separar de `api.ts` monolítico)
- Criar hooks reutilizáveis (`useExams`, `useStudents`, `useDashboard`)

### Fase 3 — Rotas e Autenticação
- Criar `/admin/login` separado
- Padronizar rotas: `/admin/*` e `/student/*`
- Refatorar `PrivateRoute` com suporte robusto a roles
- Implementar `PublicRoute` (redireciona se já logado)

### Fase 4 — UI/UX Premium
- Refinar design system (tokens, tipografia, espaçamento)
- Redesenhar Dashboard com cards menores e grid responsivo
- Sidebar moderna com microinterações
- Skeleton loaders e transições suaves
- Integrar Recharts para gráficos

### Fase 5 — Tema, Performance e Deploy
- Refinar dark/light mode (já existe, melhorar transições)
- Otimizar lazy loading e code splitting
- Remover arquivos de deploy desnecessários (`vercel.json`, `.htaccess`)
- Validação de formulários e mensagens de erro

**Abordagem**: Cada fase será implementada sequencialmente, testando antes de avançar.
