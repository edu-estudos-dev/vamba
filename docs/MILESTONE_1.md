# Milestone 1 - Vertical Slice

## Objetivo

Provar tecnicamente o coração do Vamba com a menor complexidade possível:

```text
GPS -> lugares reais/mockados -> IA/fake ranking -> recomendação -> detalhes -> rota externa
```

## Etapa 1 - Fluxo mockado

Implementado:

- Permissão de localização no mobile com `expo-location`.
- Obtenção de latitude/longitude quando a permissão é concedida.
- Tratamento de permissão negada com opção de testar Lisboa.
- Comunicação mobile -> backend via `POST /recommendations`.
- `FakePlacesProvider`.
- `RecommendationService`.
- `FakeAIProvider`.
- Tela de recomendação.
- Detalhes do lugar.
- Botão "Ir agora" abrindo Apple Maps no iOS e Google Maps nas demais plataformas.
- Testes para endpoint, validação, regra anti-alucinação e URL externa.

## Etapa 2 - Google Places preparado

Adapter criado: `server/src/integrations/places/GooglePlacesProvider.ts`.

Serviços/APIs previstos:

- Places API (New).
- Nearby Search (New): buscar candidatos próximos a latitude/longitude.
- Place Details (New): futuro refinamento para detalhes sob demanda, caso a lista não traga campos suficientes.

Variáveis:

```env
PLACES_PROVIDER=google
GOOGLE_MAPS_API_KEY=
```

Chamadas que podem gerar cobrança:

- Nearby Search (New), por request bem-sucedido.
- Place Details (New), quando usado futuramente para enriquecer detalhes.
- Campos retornados via FieldMask podem alterar SKU/cobrança.

## Etapa 3 - OpenAI preparado

Adapter criado: `server/src/integrations/ai/OpenAIProvider.ts`.

Variáveis:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

Entrada estruturada enviada à IA:

- Pedido do usuário.
- Lista de candidatos reais, contendo apenas IDs e atributos úteis.
- Nenhuma instrução permite criar lugar novo.

Saída estruturada exigida:

```json
{
  "rankings": [
    {
      "placeId": "candidate-id",
      "rank": 1,
      "explanation": "Motivo contextual"
    }
  ]
}
```

Proteção anti-alucinação:

- `OpenAIProvider` valida IDs retornados contra a lista fornecida.
- `RecommendationService` também rejeita qualquer ID desconhecido.

## Estimativa de chamadas por recomendação

Com providers fake:

- 0 chamadas externas pagas.
- 2 eventos de uso registrados: `fake-places/search` e `fake-ai/rankPlaces`.

Com providers reais previstos:

- 1 chamada Google Places Nearby Search.
- 1 chamada OpenAI Responses API.
- 0 chamadas de rota própria; o app abre mapa externo.

Futuro opcional:

- 1 chamada Google Place Details por lugar aberto, se os detalhes do search não forem suficientes.
