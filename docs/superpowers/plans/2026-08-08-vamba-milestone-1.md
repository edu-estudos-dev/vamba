# Vamba Milestone 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development to implement this plan task-by-task. The user authorized inline execution and requested no subagent delegation.

**Goal:** Build the Milestone 1 vertical slice with mocked data first: GPS -> backend -> fake places -> fake AI ranking -> recommendation -> details -> external map route.

**Architecture:** Mobile collects foreground location permission and coordinates, then calls the backend. The backend controller delegates to RecommendationService, which fetches candidates from PlacesProvider, ranks only those candidates through AIProvider, validates returned IDs, logs usage events, and returns display-ready recommendations.

**Tech Stack:** Expo SDK 57, React Native, TypeScript, Node.js 24.19.0 LTS, Express, Vitest.

## Global Constraints

- Do not implement Stripe, affiliates, translation, favorites, complex auth, Redis, microservices, or turn-by-turn navigation.
- Do not expose API keys in the mobile app.
- AI must never invent places; it can only rank real candidates returned by PlacesProvider.
- External calls must be tracked for cost visibility.
- Use fake providers until real Google/OpenAI credentials are explicitly supplied.

---

### Task 1: Backend Recommendation Contract

**Files:**
- Create: `server/tests/recommendations.test.ts`
- Create: `server/src/types/recommendation.ts`
- Create: `server/src/services/RecommendationService.ts`
- Create: `server/src/controllers/recommendations.controller.ts`
- Create: `server/src/routes/recommendations.routes.ts`
- Modify: `server/src/app.ts`

**Test-first checks:**
- `POST /recommendations` returns ranked mock places.
- RecommendationService rejects AI rankings with unknown place IDs.
- Validation rejects missing coordinates.

### Task 2: Provider Skeletons and Cost Logging

**Files:**
- Create: `server/src/services/ApiUsageLogger.ts`
- Create: `server/src/integrations/places/FakePlacesProvider.ts`
- Create: `server/src/integrations/places/GooglePlacesProvider.ts`
- Create: `server/src/integrations/ai/FakeAIProvider.ts`
- Create: `server/src/integrations/ai/OpenAIProvider.ts`
- Create: `server/src/config/providers.ts`
- Modify: `server/.env.example`

**Test-first checks:**
- Fake providers return deterministic candidates.
- Usage events are emitted for fake and prepared external operations.

### Task 3: Mobile Mocked Flow

**Files:**
- Modify: `mobile/App.tsx`
- Modify: `mobile/package.json`
- Modify: `mobile/app.json`
- Create: `mobile/src/features/location/locationService.ts`
- Create: `mobile/src/features/recommendations/types.ts`
- Create: `mobile/src/features/recommendations/recommendationsApi.ts`
- Create: `mobile/src/features/recommendations/mapLinks.ts`
- Create: `mobile/src/features/recommendations/RecommendationFlow.tsx`
- Create: `mobile/src/features/recommendations/mapLinks.test.ts`

**Test-first checks:**
- Map URL helper returns Google Maps URL on Android/default.
- Map URL helper returns Apple Maps URL on iOS.

### Task 4: Documentation and Verification

**Files:**
- Modify: `docs/API.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/ROADMAP.md`
- Create: `docs/MILESTONE_1.md`

**Verification:**
- `npm run typecheck`
- `npm test`
- `npm run build:server`
- `npx expo config --type public`
