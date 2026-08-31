# API

Base inicial do backend. Endpoints reais serão adicionados por milestone.

## Health

`GET /health`

Resposta:

```json
{
  "status": "ok",
  "service": "vamba-server"
}
```

## Recommendation - futuro

`POST /recommendations`

Implementado na Milestone 1 com providers fake por padrão.

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
  "usageEvents": []
}
```

A IA só pode ranquear candidatos retornados por `PlacesProvider`. O backend rejeita qualquer `placeId` desconhecido retornado por `AIProvider`.

Erros:

- `400 LOCATION_REQUIRED`
- `400 INTENT_REQUIRED`
- `502 RECOMMENDATION_FAILED`

## Translation - futuro

`POST /translations`

Planejado para o MVP. Deve traduzir texto entre idioma nativo e idioma local, com possibilidade futura de áudio, voz e câmera.
