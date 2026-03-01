# Hybrid Deployment Strategy

This document outlines the architecture for deploying Scorr Studio as both a cloud-native SaaS and a locally installable application for offline/low-latency production use.

## 1. Core Technology Stack

*   **Frontend/App Framework:** [Next.js](https://nextjs.org/) (React)
    *   Server-Side Rendering (SSR) for Cloud.
    *   Static/Standalone export for Local.
*   **Backend/Database:** [Convex](https://convex.dev/)
    *   **Cloud:** Managed multi-tenant instance.
    *   **Local:** Self-hosted Convex instance running on the user's machine.
*   **Local Wrapper:** [Electron](https://www.electronjs.org/)
    *   Wraps the Next.js server and Convex process into a single installable binary (`.dmg`, `.exe`).

---

## 2. Cloud-First, Local-Capable

The application is designed to run primarily in the cloud, but specific use cases (poor internet venues, high-fidelity local mixing) require a local installation.

### 2.1 The "Local Production" Build
The local version is **not** a development environment. It is a production-grade application running entirely on the user's hardware.

**Local Architecture:**
```mermaid
flowchart TD
    User[User's Computer]
    
    subgraph Electron App
        Web[Next.js Server (Localhost:3000)]
        DB[Convex Instance (Localhost:3210)]
        Process[Process Manager]
    end
    
    Cloud[Scorr Cloud (Auth & Entitlements)]
    
    User -->|Browser/App Window| Web
    Web -->|Queries/Mutations| DB
    Web -.->|Heartbeat / License Check| Cloud
```

---

## 3. Security & Access Control

### 3.1 Restricted Admin Access
Users running the local version are effectively "admins" of their local database, but they **must not** access the application's global Admin Panel.

*   **Routing:** The `app/admin` routes are excluded from the local build or blocked via middleware detecting `process.env.NEXT_RUNTIME === 'electron'`.
*   **Middleware:** Checks if the requested route is `/admin/*` and strictly denies access in local mode.

### 3.2 Cloud Entitlement Sync
Even when running locally, the application verifies the user's tier and permissions against the Cloud source of truth.

1.  **Login:** User logs in via the Electron app (redirects to Cloud Auth).
2.  **Token Exchange:** The app receives a session token.
3.  **Feature Flag Sync:** On startup and periodically, the local instance queries the **Cloud API** to fetch the user's `Entitlements` and `FeatureFlags`.
    *   *Example:* If a user is on the "Free Tier", the "4K Streaming" feature flag in the local database is disabled, even if the local hardware supports it.
4.  **License Check:** The app sends a heartbeat to the cloud. If the subscription is inactive, the local app enters "Read Only" mode.

---

## 4. Implementation Details

### 4.1 Packaging with Electron
We use `electron-builder` to package the application.

**Startup Sequence:**
1.  **Electron Main Process** starts.
2.  **Spawns Convex:** Executes the bundled Convex binary (`npx convex dev` equivalent, but streamlined for prod).
    *   *Note:* Requires bundling the Convex backend code.
3.  **Spawns Next.js:** Starts the Next.js standalone server on a random open port.
4.  **Load Window:** Electron browser window loads `http://localhost:{port}`.

### 4.2 Handling Updates
*   **Cloud:** Continuous deployment via Vercel/Railway.
*   **Local:** Auto-update mechanism via Electron's `autoUpdater` (fetching artifacts from S3/GitHub Releases).
    *   Database migrations are applied automatically when the new version starts the local Convex instance.

---

## 5. Roadmap

### Phase 1: Proof of Concept
- [ ] Create basic Electron wrapper for the existing Next.js app.
- [ ] Script the bundling of the Convex local backend.
- [ ] Implement "Local vs Cloud" environment detection.

### Phase 2: Feature & Security Parity
- [ ] Implement Cloud Entitlement Sync (API Endpoint on Cloud, Consumer on Local).
- [ ] Add Middleware rules to block `/admin` on local.

### Phase 3: Production Packaging
- [ ] Configure `electron-builder` for macOS/Windows/Linux.
- [ ] Setup auto-update pipeline.
