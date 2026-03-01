# Logging & Telemetry Strategy

This document outlines the centralized logging architecture for Scorr Studio. The goal is to provide a unified interface for capturing application flow, errors, and user interactions, supporting multiple backends (PostHog, self-hosted, etc.) and enabling automated test generation via Playwright.

## 1. Core Architecture

All logging goes through a single, isomorphic **`Logger`** singleton. This ensures consistency and allows swapping backends without code changes.

### 1.1 The Logger Interface

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  tenantId?: string;
  timestamp: string;
}

class Logger {
  // Core methods
  debug(message: string, context?: object)
  info(message: string, context?: object)
  warn(message: string, context?: object)
  error(message: string, error?: Error, context?: object)
  
  // Specialized tracking
  trackAction(action: string, props?: object) // Business logic events
  trackInteraction(selector: string, action: 'click' | 'input', metadata?: object) // UI events
}
```

### 1.2 Service Adapters

The Logger uses the `Adapter` pattern to send data to configured services. Adapters are initialized only if their specific Environment Variables are present.

*   **ConsoleAdapter:** (Development default) Pretty-prints to stdout/stderr.
*   **PostHogAdapter:** (Production priority) Sends events to PostHog.
*   **HttpAdapter:** (Generic) Sends JSON payloads to any self-hosted endpoint.

**Configuration:**
```bash
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Generic / Self-Hosted
LOGGING_WEBHOOK_URL=https://logs.my-server.com/ingest
```

---

### 1.3 AI Agent Guidelines 🤖
**CRITICAL:** To ensure complete observability and testability, AI agents must adhere to these rules when writing code:
1.  **Mandatory Logging:** EVERY Server Action, API Route, and Database Mutation wrapper MUST include `Logger.info()` at the start and (optionally) `Logger.trackAction()` on success.
2.  **No Silent Failures:** All `try/catch` blocks must log the error via `Logger.error()` before re-throwing or handling.
3.  **Traceable UI:** When creating interactive UI elements (buttons, inputs), ALWAYS add a unique `data-testid` attribute to facilitate stable selector generation for Playwright.

---

## 2. Server-Side Logging

Server-side logging captures application logic, database mutations, and API errors.

### 2.1 Implementation
We will wrap critical Server Actions and API routes with a logging utility:

```typescript
// Example usage in an action
export const createTournament = withLogging(async (args) => {
  Logger.info('Creating tournament', { args });
  // ... business logic ...
  Logger.trackAction('tournament_created', { id: newId });
});
```

### 2.2 What to Log
*   **Database Mutations:** Create/Update/Delete operations (excluding sensitive PII).
*   **Auth Events:** Login, Logout, Failed attempts.
*   **Critical Errors:** Uncaught exceptions, API failures.
*   **Performance:** Execution time of complex actions.

---

## 3. Client-Side Logging & Browser Telemetry

Client-side logging focuses on UX, errors, and standardizing user behavior for replication.

### 3.1 Global Error Boundary
A React Error Boundary will catch unhandled UI exceptions and send them to `Logger.error()`, including component stack traces.

### 3.2 Automated Interaction Tracking (The "Playwright Recorder")
To enable the generation of Playwright scripts from user sessions, we implementation a global event listener system.

**Mechanism:**
A `TelemetryProvider` attaches listeners to the `window` object to capture:
1.  **Clicks:** Captures the optimal CSS selector for every clicked element.
2.  **Navigation:** Captures URL changes.
3.  **Inputs:** Captures 'change' events on form fields (debounced).

**Event Schema for Replication:**
```typescript
interface UserInteractionEvent {
  type: 'interaction';
  timestamp: number;
  url: string;           // Current page URL
  action: 'click' | 'input' | 'navigation';
  target: {
    selector: string;    // Unique CSS selector (e.g., "#submit-btn", ".card > button:nth-child(2)")
    tagName: string;
    innerText?: string;  // For text-based matching assertions
    value?: string;      // For input actions
  };
  metadata: {
    userId: string;
    sessionId: string;
    viewport: { width: number, height: number };
  };
}
```

**Selector Logic:**
The logger will attempt to generate the most resilient selector:
1.  `data-testid` (Highest priority)
2.  `id`
3.  Unique Class combinations
4.  Path (e.g., `body > div > button`)

---

## 4. Playwright Script Generation

A separate tool (outside the main app) will consume the log stream (e.g., from PostHog export or the generic webhook) to generate Playwright scripts.

**Workflow:**
1.  **Extract:** Query logs for a specific `sessionId`.
2.  **Parse:** Convert `UserInteractionEvent` items into a linear sequence.
3.  **Generate:** Map events to Playwright syntax.

**Example Output:**
```javascript
// Generated from Session ID: 12345
test('User Flow Replication', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Logged: click on "#create-tournament"
  await page.click('#create-tournament');
  
  // Logged: input "My Cup" into "input[name='name']"
  await page.fill("input[name='name']", "My Cup");
  
  // Logged: click on "button.submit"
  await page.click("button.submit");
  
  // Logged: navigation to "/tournaments/1"
  await page.waitForURL(/\/tournaments\/\d+/);
});
```

---

## 5. Implementation Roadmap

### Phase 1: The Logger
- [ ] Create `lib/logging/Logger.ts` (Singleton).
- [ ] Create `lib/logging/adapters/PostHogAdapter.ts`.
- [ ] Create `lib/logging/adapters/ConsoleAdapter.ts`.

### Phase 2: Browser Telemetry
- [ ] Create `components/TelemetryProvider.tsx`.
- [ ] Implement global click listener with intelligent selector generation.
- [ ] Bind `data-testid` attributes to key UI elements for stable logging.

### Phase 3: Server Integration
- [ ] Create `lib/logging/middleware.ts` helper for wrapping Server Actions.
- [ ] Add logging to `convex/` mutations via a wrapper function.

### Phase 4: Replication Tooling
- [ ] Build a script to fetch logs and compile them into `.spec.ts` files.
