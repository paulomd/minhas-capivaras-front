# Minhas Capivaras — Frontend

Interface web do **Minhas Capivaras** (Juris Prime): monitoramento de comunicações processuais do PJe, com alertas, gestão de processos e histórico financeiro.

Stack: **Next.js 16**, **React 19**, **TypeScript** e **Tailwind CSS**.

## Requisitos

- Node.js **20.9+**
- npm (ou compatível)
- API backend em execução (padrão: `http://localhost:8090`)

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env.local` na raiz do frontend (opcional, se a API não estiver no host padrão):

```env
NEXT_PUBLIC_API_URL=http://localhost:8090
```

Sem essa variável, o frontend usa `http://localhost:8090` automaticamente.

## Desenvolvimento

```bash
npm run dev
```

- App: http://localhost:3000

Outros scripts:

| Comando | Descrição |
|---------|-----------|
| `npm run build` | Build de produção |
| `npm run start` | Servidor após o build |
| `npm run lint` | ESLint |

## Páginas principais

| Rota | Descrição |
|------|-----------|
| `/login` | Autenticação |
| `/cadastro` | Cadastro de usuário e plano |
| `/recuperar-senha` | Recuperação de senha |
| `/inicio` | Dashboard (área autenticada) |
| `/monitoramentos` | Cadastro e gestão de documentos monitorados |
| `/processos` | Listagem de processos com filtros |
| `/processos/{id}` | Detalhe do processo e comunicações |
| `/financeiro` | Histórico financeiro e PIX |

## Funcionalidades

- Autenticação JWT (token em `localStorage`)
- Tema claro/escuro
- Monitoramentos por OAB, CPF, CNPJ ou texto
- Processos com filtros (tribunal, período, texto, status: ativo/arquivado/excluído)
- Arquivar, reativar e remover processos
- Modais de confirmação e mensagens de feedback integrados ao layout

## Estrutura

```
src/
├── app/              # Rotas (App Router)
├── components/       # UI, layout, processo, tema
├── lib/              # API, formatação, sessão
└── types/            # Tipos TypeScript
```

## Backend

Este frontend consome a API do repositório [minhas-capivaras-back](https://github.com/paulomd/minhas-capivaras-back).

Para desenvolvimento local, suba o backend antes de usar o app.
