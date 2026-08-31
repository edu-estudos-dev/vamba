# Milestone 2 - MVP

## Objetivo

Transformar o vertical slice da Milestone 1 em um app que um turista consegue usar
de ponta a ponta, ainda sem depender de credenciais pagas.

## Onboarding

Três telas curtas em `mobile/src/features/onboarding/`, exibidas uma única vez.
A conclusão fica em `vamba_onboarding_done` no AsyncStorage; o botão "Pular" tem o
mesmo efeito de concluir, porque prender o usuário na introdução não ajuda ninguém.

## Categorias

Cinco categorias no `RecommendationFlow`: Comer, Conhecer, Passear, Compras e
Surpreenda-me. A categoria escolhida vai no `intent` do pedido e chega ao
`PlacesProvider` como filtro de busca.

## Favoritos

Salvos apenas no dispositivo, via AsyncStorage. Ver a seção de persistência local
em `ARCHITECTURE.md`.

## Tradutor

`POST /translations`, com `TranslationProvider` desacoplado:

- `FakeTranslationProvider` (padrão): guia de expressões com tradução real e, para
  qualquer outro texto, devolve o original marcado como mock. **Não inventa tradução** —
  apresentar uma tradução falsa a quem está num país estrangeiro é pior que não traduzir.
- `GoogleTranslationProvider`: Cloud Translation v2, ativado por `TRANSLATION_PROVIDER=google`.

O mobile exibe um aviso sempre que `isMock` vier `true`.

Limites: `TRANSLATION_MAX_CHARS` (padrão 500) corta textos longos antes de enviar,
porque a tradução cobra por caractere.

## Analytics

Eventos rastreados no app: `onboarding_completed`, `recommendation_requested`,
`place_viewed`, `favorite_saved`, `favorite_removed`, `map_opened`,
`translation_requested`, `offer_clicked`.

Ficam no dispositivo, limitados aos 500 mais recentes, e são inspecionados na aba 📊.
Enviar para um backend de analytics é decisão da Milestone 3.

## Controle de custo

Duas peças:

- `server/src/config/pricing.ts` — preço estimado por operação de cada provider pago.
  Providers fake custam zero. Provider ou operação sem preço conhecido devolve zero,
  porque um número inventado seria pior que a ausência de estimativa.
- `server/src/services/CostGuard.ts` — soma o gasto do dia e recusa novas chamadas
  pagas com `429 COST_LIMIT_REACHED` quando `DAILY_COST_LIMIT_USD` (padrão 5) é atingido.
  O guard existe uma vez por processo; os services são montados por request.

O consumo do dia aparece em `GET /health` e na resposta de `POST /recommendations`.

Limitação conhecida: o contador é em memória, zera no restart e não soma entre
instâncias. Migrar para a tabela `api_usage` no PostgreSQL quando houver mais de uma.

## Afiliado inicial

`GET /affiliates` devolve ofertas por categoria e `POST /affiliates/clicks` registra
o clique. O `FakeAffiliateProvider` devolve ofertas de exemplo, todas com `isMock: true`
e `trackedUrl` para `example.com` — nenhuma parceria foi fechada, então mandar o turista
a um link real seria mentira. Trocar por um parceiro de verdade quando a Milestone 4
confirmar que há conversão.

Cliques ficam em memória; persistir na Milestone 3.

## Tratamento de erros

`server/src/errors.ts` define `AppError` com códigos estáveis e o status HTTP de cada um:

| Código | HTTP | Quando |
|---|---|---|
| `LOCATION_REQUIRED` | 400 | Pedido sem latitude/longitude válidas |
| `INTENT_REQUIRED` | 400 | Sem categoria e sem texto |
| `TRANSLATION_INPUT_REQUIRED` | 400 | Texto vazio, sem idioma alvo ou acima do limite |
| `OFFER_REQUIRED` | 400 | Clique de afiliado sem `offerId` |
| `NO_CANDIDATES` | 404 | Nenhum lugar encontrado por perto |
| `COST_LIMIT_REACHED` | 429 | Teto diário de custo atingido |
| `PROVIDER_FAILED` | 502 | Falha de provider externo |

No mobile, `src/lib/apiClient.ts` traduz cada código em uma frase para o usuário.
O JSON cru do provider nunca aparece na tela — antes disso, um erro do Google Places
vazava a resposta inteira da API para o turista.

## Segurança das rotas novas

`CORS_ORIGIN` aceita uma lista separada por vírgula e é aplicada de verdade em
`app.ts`. Sem isso, qualquer site poderia chamar `/translations` do navegador de um
visitante e queimar a cota diária — com provider real, isso é dinheiro.

`/affiliates/clicks` é público e sem rate limit; o log de cliques do provider fake
guarda no máximo os 1000 mais recentes para que um POST em loop não esgote a heap.

## Como rodar

```bash
cd server && npm run dev
cd mobile && npx expo start --web
```

Com `PLACES_PROVIDER=fake`, `AI_PROVIDER=fake` e `TRANSLATION_PROVIDER=fake`,
o fluxo inteiro roda sem nenhuma credencial e sem custo.
