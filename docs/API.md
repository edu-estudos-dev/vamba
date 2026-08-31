# API

Base do backend. Endpoints implementados até a Milestone 2.

## Health

`GET /health`

Resposta:

```json
{
  "status": "ok",
  "service": "vamba-server",
  "cost": {
    "day": "2026-08-31",
    "spentUsd": 0,
    "limitUsd": 3,
    "remainingUsd": 3
  }
}
```

## Recommendation

`POST /recommendations`

Implementado na Milestone 1, com providers fake por padrão.

Request:

```json
{
  "location": {
    "latitude": 38.7223,
    "longitude": -9.1393
  },
  "intent": {
    "category": "Conhecer",
    "prompt": "Tenho duas horas livres. O que vale a pena fazer agora?"
  },
  "travelMode": "walking",
  "locale": "pt-BR"
}
```

Response:

```json
{
  "recommendationId": "uuid",
  "generatedAt": "2026-08-08T00:00:00.000Z",
  "primaryRecommendation": {
    "place": {
      "id": "mock-lisbon-lookout",
      "name": "Miradouro de Santa Catarina",
      "source": "mock"
    },
    "rank": 1,
    "explanation": "Recomendo ir agora porque está próximo..."
  },
  "recommendations": [],
  "usageEvents": [],
  "cost": {
    "day": "2026-08-31",
    "spentUsd": 0,
    "limitUsd": 3,
    "remainingUsd": 3
  }
}
```

A IA só pode ranquear candidatos retornados por `PlacesProvider`. O backend rejeita
qualquer `placeId` desconhecido ou repetido retornado por `AIProvider`, e também
descarta rankings com `explanation` vazia ou curta demais. Um item descartado não
derruba a recomendação inteira; sem nenhum item válido, a resposta vira `NO_CANDIDATES`.

Erros:

- `400 LOCATION_REQUIRED`
- `400 INTENT_REQUIRED`
- `404 NO_CANDIDATES`
- `429 COST_LIMIT_REACHED`
- `502 PROVIDER_FAILED`

## Translation

`POST /translations`

Implementado na Milestone 2. Traduz texto entre idioma nativo e idioma local;
áudio, voz e câmera ficam para milestones futuras.

Request:

```json
{
  "text": "Bom dia",
  "sourceLanguage": "pt",
  "targetLanguage": "en"
}
```

Response:

```json
{
  "translatedText": "good morning",
  "sourceLanguage": "pt",
  "targetLanguage": "en",
  "isMock": true,
  "provider": "fake-translation",
  "estimatedCost": 0
}
```

Erros:

- `400 TRANSLATION_INPUT_REQUIRED`
- `429 COST_LIMIT_REACHED`
- `502 PROVIDER_FAILED`

## Affiliates

Implementado na Milestone 2. `FakeAffiliateProvider` por padrão: toda oferta vem
com `isMock: true` e `trackedUrl` para `example.com`, porque não há parceria real.

`GET /affiliates?placeId=&category=&city=`

Response:

```json
{
  "offers": [
    {
      "id": "mock-offer-city-pass",
      "partner": "Parceiro exemplo",
      "title": "Passe da cidade",
      "priceFrom": "EUR 25",
      "trackedUrl": "https://example.com/ofertas/city-pass?ref=vamba-mock",
      "isMock": true
    }
  ]
}
```

`POST /affiliates/clicks`

Request:

```json
{
  "offerId": "mock-offer-city-pass",
  "placeId": "mock-lisbon-square"
}
```

Response: `202 { "recorded": true }`

Erros:

- `400 OFFER_REQUIRED`

Rota pública, sem rate limit (`server/src/routes/affiliates.routes.ts`) — o log de
cliques do provider fake guarda no máximo os 1000 mais recentes.
