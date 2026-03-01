# Sponsor Management System

This document outlines the architecture, data model, and workflows for managing sponsorships within Scorr Studio. The system enables multi-level sponsorship management (Tenant, Competition, League, Team) with automated entitlement delivery (stream overlays, social media) and approval workflows.

## 1. Overview

Sponsorships are a critical revenue stream for sports organizations. Scorr Studio provides a centralized platform to manage these relationships, track deliverables, and automate exposure.

### Key Capabilities
*   **Multi-Level Management:** Manage sponsors at the Organization (Tenant), Competition/League, and Team levels.
*   **Centralized Database:** All sponsors live in a master tenant list for easy reuse across seasons.
*   **Self-Service Application:** Sponsors can browse opportunities and apply directly.
*   **Approval Workflows:** Admins control who sponsors what.
*   **Automated Fulfillment:** Logos automatically appear on streams, social posts, and public pages based on the sponsorship level.

---

## 2. Sponsorship Hierarchy

Entities can have their own sponsors, but lower levels can also inherit sponsors from above if configured.

1.  **Tenant (Organization):** Highest level. Sponsors appear on all properties owned by the tenant.
2.  **Competition / League:** Sponsors appear on all matches and pages within that specific competition or league season.
3.  **Team:** Sponsors appear on the team's public page and on the team's side of the scoreboard during their matches.

---

## 3. Data Model

### 3.1 Sponsors Table (`sponsors`)
The master list of external companies/entities.

```typescript
{
    _id: Id<"sponsors">,
    tenantId: Id<"tenants">,
    name: string,
    logoUrl: string,             // High-res logo
    websiteUrl: string,
    industry?: string,
    contactName?: string,
    contactEmail?: string,
    contactPhone?: string,
    notes?: string,
    status: "active" | "inactive",
    createdAt: string,
    updatedAt: string,
}
// Indexes: by_tenant
```

### 3.2 Sponsorship Levels (`sponsorshipLevels`)
Defines the "packages" available for purchase (e.g., "Gold Partner", "Jersey Sponsor").

```typescript
{
    _id: Id<"sponsorshipLevels">,
    tenantId: Id<"tenants">,
    name: string,                // e.g., "Title Sponsor"
    scope: "tenant" | "league" | "competition" | "team",
    price: {
        amount: number,
        currency: string,
        period: "season" | "year" | "one-time"
    },
    benefits: string[],          // List of text benefits
    maxSponsors?: number,        // Optional limit (e.g., only 1 Title Sponsor)
    assets: {
        streamOverlay: boolean,  // Show on broadcast
        socialMedia: boolean,    // Show on automated posts
        websiteFooter: boolean,  // Show on footer
        teamJersey: boolean      // Show on team profile
    },
    // Image Requirements (Enforced on upload)
    imageRequirements?: {
        exactWidth?: number,     // e.g., 800px
        exactHeight?: number,    // e.g., 200px
        minWidth?: number,
        minHeight?: number,
        aspectRatio?: number,    // e.g., 4.0 for 4:1 width:height
        allowedFormats: string[] // ['png', 'svg', 'jpg']
    },
    createdAt: string
}
// Indexes: by_tenant
```

### 3.3 Sponsorships (`sponsorships`)
The link between a Sponsor and an Entity for a specific duration.

```typescript
{
    _id: Id<"sponsorships">,
    tenantId: Id<"tenants">,
    sponsorId: Id<"sponsors">,
    levelId: Id<"sponsorshipLevels">,
    
    // The entity being sponsored
    entityType: "tenant" | "league" | "competition" | "season" | "team",
    entityId: string,            // ID of the tenant, league, etc.
    
    startDate: string,
    endDate?: string,
    status: "pending" | "approved" | "rejected" | "active" | "expired",
    
    paymentStatus: "paid" | "unpaid" | "partial",
    contractUrl?: string,        // Link to PDF contract
    
    createdAt: string
}
// Indexes: by_entity [entityType, entityId], by_sponsor [sponsorId]
```

---

## 4. User Workflows

### 4.1 Admin/Owner Setup
1.  **Define Levels:** Admin goes to `Admin > Sponsorships > Levels` and creates packages (e.g., "Season Title Sponsor - $5000").
2.  **Configure Assets:** Admin defines where logos for each level will appear (Stream Corner, Social Media Footer, etc.).

### 4.2 Sponsor Application (Public Facing)
1.  **Browse:** Potential sponsor visits `/sponsorships` (or a specific league/team page).
2.  **Select:** Clicks "Become a Sponsor" and chooses a package.
3.  **Apply:** Fills out a form with company details and uploads a logo.
    *   **Validation:** The system checks the uploaded logo against the `imageRequirements` defined in the sponsorship level (pixel size, aspect ratio, format). If it doesn't match, the upload is rejected with a specific error message (e.g., "Image must be exactly 800x200px").
4.  **Submit:** Logic creates a `sponsor` record (if new) and a `sponsorship` record with status `pending`.

### 4.3 Management & Approval
1.  **Notification:**
    *   If a Team Manager or lower-level entity adds a sponsor manually, **Tenant Admins are immediately notified** via:
        *   **Email:** Sent to the configured admin email address.
        *   **In-App Alert:** Appears in the notification center on the dashboard.
    *   The notification includes details of the sponsor, the entity (Team X), and a link to review the request.
2.  **Review:** Admin reviews the company and logo.
3.  **Action:**
    *   **Approve:** Sets status to `active` (or `payment_pending`). Assets immediately go live if active.
    *   **Deny:** Sets status to `rejected`. automated email sent.
4.  **Drill Down:** Admin can view "Sponsors by Team" or "Sponsors by League" to see coverage and gaps.

### 4.4 Team Manager View
*   Team Managers can see their active sponsors.
*   Can request to add a sponsor manually (e.g., "Local Pizza Shop gave us $500").
*   This request routes to the Tenant Admin for final approval to ensure brand safety.

---

## 5. Automated Fulfillment & Display

### 5.1 Stream Overlays
The detailed score display engine (`KonvaScoreboard`) will inspect the `sponsorships` table for the current match context.

*   **Logic:** Fetch sponsorships for [Tenant, League, Season, Home Team, Away Team].
*   **Priority:** Title Sponsors > Gold > Silver.
*   **Rotation:** If multiple sponsors exist for a slot, rotate their logos every *n* seconds.

### 5.2 Social Media Automation
When generating social posts (see `social-media-automation.md`):
*   **Canvas Generation:** Include a "Partner Bar" at the bottom of the image.
*   **Injection:** Load active sponsor logos for the match entities.

### 5.3 Public Website
*   **League Header:** Title sponsor logo.
*   **Team Page:** "Supported by" section.
*   **Footer:** Tenant-level sponsors.

---

## 6. Roadmap

### Phase 1: Core Management
*   [ ] Database Schema Implementation (`sponsors`, `sponsorshipLevels`, `sponsorships`).
*   [ ] Admin UI for managing Sponsors and Levels.
*   [ ] Manual assignment of sponsors to entities.

### Phase 2: Visibility Integration
*   [ ] Update `KonvaScoreboard` to accept and render sponsor logo arrays.
*   [ ] Update `social-media-automation` to inject sponsor logos into graphics.
*   [ ] Add sponsor carousels to public League and Team pages.

### Phase 3: Self-Service & Payments
*   [ ] Public "Sponsorship Opportunities" page.
*   [ ] Stripe integration for automatic invoice payment.
*   [ ] "Sponsor Portal" for sponsors to update their own logo/links.

### Phase 4: Expansion
*   [ ] **Inventory Management:** Limit spaces available (e.g., "Only 1 Jersey Front spot left").
*   [ ] **Analytics:** Report impressions (stream views + page views) back to the sponsor.
