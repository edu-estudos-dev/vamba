# Vamba

Vamba é um aplicativo mobile de viagem para brasileiros no exterior. A proposta central é ajudar o turista a decidir o que vale a pena fazer agora, usando localização, contexto, lugares reais e explicações simples.

Status atual: Milestone 0 - bootstrap do repositório.

## Stack

- Mobile: React Native + Expo + TypeScript
- Backend: Node.js + TypeScript + Express + ES Modules
- Banco previsto: PostgreSQL
- Cache: nenhum Redis no bootstrap
- Integrações externas: apenas interfaces e mocks nesta fase

## Estrutura

```text
.
├── docs/
├── mobile/
└── server/
```

## Requisitos

- Node.js 24.19.0 LTS recomendado para desenvolvimento local.
- Expo SDK 57 exige Node.js 22.13.x ou superior compatível.
- npm 10+

No Windows, prefira instalar pelo `nvm-windows`, selecionar a versão do arquivo `.nvmrc` e manter os arquivos do projeto no mesmo sistema de arquivos em que o Node está instalado.

## Instalação

```bash
npm install
npm run install:all
```

## Execução

Backend:

```bash
npm run dev:server
```

Mobile:

```bash
npm run dev:mobile
```

Verificações:

```bash
npm run typecheck
npm test
```

## Variáveis de ambiente

Copie os arquivos `.env.example` para `.env` apenas no ambiente local. Não versionar `.env`.

- `server/.env.example`
- `mobile/.env.example`

Nenhuma API key é necessária na Milestone 0.

## Documentação

- [Contexto do projeto](docs/PROJECT_CONTEXT.md)
- [Produto](docs/PRODUCT.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [MVP](docs/MVP.md)
- [Roadmap](docs/ROADMAP.md)
- [API](docs/API.md)
- [Afiliados](docs/AFFILIATES.md)
- [Legal e negócio](docs/LEGAL_AND_BUSINESS.md)

## Milestones

1. Milestone 0: bootstrap limpo e executável.
2. Milestone 1: GPS -> lugares reais -> IA -> recomendação -> detalhes -> rota externa.
3. Milestone 2: MVP com onboarding, favoritos, tradutor, analytics e afiliado inicial.
4. Milestone 3: validação com usuários reais.
5. Milestone 4: validação de negócio.
6. Milestone 5: formalização somente com autorização explícita.
