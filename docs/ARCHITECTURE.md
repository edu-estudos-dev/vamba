# Arquitetura

## Stack

- Mobile: React Native + Expo + TypeScript
- Backend: Node.js + TypeScript + Express + ES Modules
- Banco previsto: PostgreSQL
- Cache: não usar Redis até existir necessidade demonstrada

## Organização

O backend deve seguir:

```text
controller -> service -> providers
```

Evitar:

```text
controller -> Google -> OpenAI -> Viator
```

Preferir:

```text
RecommendationController
  -> RecommendationService
    -> PlacesProvider
    -> AIProvider
    -> RoutesProvider
```

## Providers previstos

- `PlacesProvider`
- `RoutesProvider`
- `AIProvider`
- `TranslationProvider`
- `AffiliateProvider`

Fornecedores possíveis futuros: Google Places API, Google Maps Platform, Google Routes API, OpenAI API, Google Cloud Translation e parceiros afiliados.

## Milestone 1 - Fluxo de recomendação

```text
Mobile
  -> expo-location
  -> POST /recommendations
  -> RecommendationController
  -> RecommendationService
    -> PlacesProvider
       - FakePlacesProvider por padrão
       - GooglePlacesProvider preparado
    -> AIProvider
       - FakeAIProvider por padrão
       - OpenAIProvider preparado
    -> ApiUsageLogger
  -> Mobile mostra recomendação e detalhes
  -> Mobile abre Google Maps ou Apple Maps externamente
```

Regras técnicas:

- O mobile nunca recebe ou armazena `GOOGLE_MAPS_API_KEY` ou `OPENAI_API_KEY`.
- `PLACES_PROVIDER=fake` e `AI_PROVIDER=fake` são o padrão local.
- `GooglePlacesProvider` usa Places API (New) via backend.
- `OpenAIProvider` usa saída estruturada e valida IDs contra a lista de candidatos.
- `ApiUsageLogger` registra provider, operação, unidades aproximadas e custo estimado.

## Segurança

- Nunca versionar `.env`.
- Nunca colocar API keys privadas no app mobile quando puderem ficar no backend.
- Validar entradas no backend.
- Não logar secrets.
- Preparar HTTPS para produção.
- Rate limiting é futuro, não Milestone 0.

## Custos

Preparar o conceito de `api_usage` com provider, operação, unidades de entrada/saída, custo estimado e data. Não é obrigatório criar tabela no bootstrap.

Na Milestone 1, o log é em memória por request. Banco persistente fica para uma milestone posterior.
