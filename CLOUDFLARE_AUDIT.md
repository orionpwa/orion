# Fase 12.19 — Cloudflare Readiness

## Decisão após auditoria da stack

O Orion **não é Vite, React, Vue, Next, Astro ou outro framework com preset**. A stack atual é:

- TypeScript 5.8.3, compilado diretamente por `tsc` para módulos ES2022 em `dist/`;
- HTML/CSS/JavaScript estático, sem bundler;
- PWA com `service-worker.js` na raiz e manifest relativo;
- IndexedDB local-first como persistência principal;
- sem SSR, sem Pages Functions e sem backend obrigatório no caminho de uso pessoal;
- `runtime-config.json` com gateway de mercado vazio nesta fase;
- gateway de market data existe no pacote-fonte, mas não faz parte do artefato estático publicado.

Portanto **não usar preset de framework e não usar `npm run build` no Cloudflare nesta migração**.

## Estratégia escolhida

Cloudflare Pages com Git integration e artefato pré-compilado dentro de `site/`:

- Framework preset: None
- Production branch: `main`
- Build command: `exit 0`
- Build output directory: `site`
- Root directory: vazio (raiz do repositório)
- Environment variables: nenhuma

Isso é deliberado. O código-fonte ainda não possui `package-lock.json`; logo, transferir o build TypeScript para a infraestrutura remota agora reduziria a reprodutibilidade. O artefato que chega ao Cloudflare é o mesmo runtime-only já submetido aos gates locais.

## Ajustes específicos de host/PWA

- `_headers` está no output publicado, compatível com Cloudflare Pages.
- `index.html`, `service-worker.js`, manifest e runtime config receberam regras explícitas de cache adequadas a atualização de PWA.
- Todas as URLs públicas do frontend permanecem relativas; não existe hostname GitHub/Cloudflare hardcoded.
- `start_url` e `scope` permanecem `./`, portáveis para `*.pages.dev` ou domínio futuro.
- O gerador do service worker passou a precachear **todos** os CSS e assets publicáveis; `appearance.css` não fica mais fora do precache.
- ícone PWA Rubi oficial incluído em 180, 192, 512, 1254 e variante maskable 512.

## Fora do escopo desta migração

- Supabase/autenticação/cloud sync;
- gateway de mercado em produção;
- domínio próprio;
- build remoto do pacote-fonte;
- qualquer alteração no Financial Core, schema ou IndexedDB.
