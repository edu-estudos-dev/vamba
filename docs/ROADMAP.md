# Roadmap

## Milestone 0 - Bootstrap

- Criar estrutura do repositório.
- Criar documentação permanente.
- Inicializar mobile Expo/TypeScript.
- Inicializar backend Express/TypeScript/ES Modules.
- Criar `.env.example`.
- Configurar scripts de desenvolvimento e verificação.
- Não exigir credenciais.

## Milestone 1 - Vertical Slice

- App abre.
- Solicita localização.
- Backend recebe contexto.
- Provider de Places encontra candidatos reais.
- RecommendationService organiza candidatos.
- Provider de IA escolhe ou ranqueia.
- App mostra recomendação.
- Usuário abre detalhes.
- Usuário toca em "Ir agora".
- Sistema abre mapa externo.

Status: implementada com providers fake/mock por padrão e adapters reais preparados para ativação futura com credenciais.

## Milestone 2 - MVP

- Onboarding curto.
- Categorias.
- Favoritos.
- Tradutor.
- Analytics.
- Controle de custo.
- Afiliado inicial.
- UX melhorada.
- Tratamento de erros.

Status: implementada. Detalhes em `MILESTONE_2.md`.

Tradutor e afiliado rodam com providers fake por padrão, marcados como mock na tela.
O teto diário de custo (`DAILY_COST_LIMIT_USD`) protege o momento em que os providers
reais forem ativados.

## Milestone 3 - Validação

Distribuir para usuários reais e medir uso, retenção, custos, cliques, conversões e feedback.

## Milestone 4 - Validação de negócio

Responder se usuários voltam, afiliados convertem, aquisição é possível, receita cobre APIs, existe margem e usuários pagariam pelo Vamba Plus.

## Milestone 5 - Formalização

Somente após autorização explícita do fundador. Avaliar LLC, EIN, conta empresarial, Stripe, compliance e documentação jurídica.
