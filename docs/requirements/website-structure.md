# Scorr Studio Website Design & Layout

This document outlines the design philosophy, structure, and user journey for the public-facing Scorr Studio website. The goal is to create an inviting, professional, and confidence-inspiring presence for school administrators, coaches, and league organizers.

## 1. Design Philosophy

*   **Target Audience:** School Administrators (Athletic Directors), Coaches, League Managers, and Parents.
*   **Vibe:** Professional, Trustworthy, Modern, Energetic (but not chaotic), Accessible.
*   **Key Message:** "Professional broadcasting and league management made simple for schools and communities."
*   **Visual Style:**
    *   **Colors:** Deep blues/navy (trust), energetic accents (orange/gold) for sports feel. High contrast for readability.
    *   **Typography:** Clean sans-serif (Inter/SF Pro) for UI, strong headers (Oswald/Barlow) for impact.
    *   **Imagery:** High-quality shots of *students* and *community athletes* using the software, not just pro players.
    *   **Motion:** Subtle interactions (hover states, smooth scrolling) to show polish, but no distracting animations that hinder information gathering.

---

## 2. Navigation Architecture

The navigation bar is the primary anchor for the user. It is simplified to focus on key actions and information.

### Global Navbar (Sticky)

| Element | Action/Destination | Notes |
| :--- | :--- | :--- |
| **Logo** | `/` (Home) | Scorr Studio brand mark. |
| **Docs** | `/docs` | **Crucial:** Direct access to documentation. |
| **Pricing** | `/pricing` | Overview of plans and features. |
| **Support** | `/support` | FAQ and Contact. |
| **Language** | Dropdown | 🌐 Icon + Current Language Code (e.g., EN). |
| **Login / Sign Up** | `/login` | Context-aware: "Login" or "Sign Up". |
| **Get Started** | `/docs/getting-started` | Primary CTA, points to documentation. |
| **User Avatar** | Dropdown | Visible *only* if logged in. |

#### User Avatar Dropdown (Logged In)
*   **Dashboard:** Link to `/app` (The main application).
*   **Account Settings:** Link to `/settings`.
*   **Sign Out:** Action.

---

## 3. Home Page Layout (`/`)

The storefront. Must instantly answer: "What is this?", "Who is it for?", and "Can I trust it?".

### 3.1 Hero Section
*   **Headline:** "Elevate Your School's Sports to Professional Standards."
*   **Subheadline:** "The all-in-one platform for live streaming, league management, and real-time scoring. Built for Athletic Directors, Coaches, and Organizers."
*   **Primary CTA:** "Start Free Trial" (Links to `/signup`).
*   **Secondary CTA:** "Watch Demo" (Scrolls to video section).
*   **Visual:** A **Hero Carousel** or **Grid** showing *real* Scorr Studio live streams.
    *   *Requirement:* Show actual overlays, scoreboards, and quality of the broadcast.
    *   *Caption:* "Live broadcast powered by Scorr Studio - [School Name] vs [School Name]"

### 3.2 "Why Scorr?" (The problem/solution)
*   **For Leagues:** "Automate schedules, standings, and registrations. Let manual spreadsheets be a thing of the past."
*   **For Schools:** "Broadcast every game. Engage parents and alumni. Monetize your streams."
*   **For Coaches:** "Simple tools. No technical degree required. Focus on the game."

### 3.3 Social Proof & Trust
*   **Logos:** "Trusted by..." (Use generic school/league styles if actual logos aren't ready, but clearly labeled).
*   **Testimonials:** Quotes from an Athletic Director and a League Manager.
*   **Metric:** "Over 1,000 matches streamed this month."

### 3.4 Feature Highlights (Live Samples)
*   Interactive section where users can toggle between different sports (Basketball, Soccer, Volleyball).
*   Showcase the **Scoreboard Editor** output for each sport.
*   *Key Takeaway:* "Looks professional, sets up in seconds."

### 3.5 Supported Sports (`/sports`)
*   **Search Interface:** "Find your sport..." search bar with instant filtering.
*   **Display:** Grid of icons for supported sports (Basketball, Soccer, Volleyball, Table Tennis, etc.).
*   **Action:** Clicking a sport card links directly to its specific documentation page (e.g., `/docs/sports/basketball`).
*   **Fallback:** "Show All" button to browse the full list.

---

## 4. Feature Pages

While not in the main navbar, these landing pages can serve as destinations for marketing campaigns.

### `/leagues` (League Management)
*   **Focus:** Organizers handling bulk games, registration, and payments.
*   **Sections:**
    *   Season Management & Scheduling.
    *   Automated Standings & Playoffs.
    *   Stripe Integration for payments.
    *   Communication tools (Chat/Email).

### `/schools` (Broadcasting & Education)
*   **Focus:** ADs and Student Broadcasting Clubs.
*   **Sections:**
    *   "Turn Students into Broadcasters" (Educational angle).
    *   Hardware requirements (Keep it simple: iPad/Phone/Webcam).
    *   Monetization (Ticketed streams/Donations).

### `/app` (The Application)
*   **Status:** Accessible via "Launch App" or "Dashboard" buttons.
*   **Auth Guard:** Requires login. Redirects to `/login` if guest.
*   **Layout:** Sidebar navigation, dense data views, dark mode default (often preferred for tools).

### `/pricing`
*   **Tiers:** Free, Pro, Enterprise (School/League specific).
*   **Comparison Table:** Detailed feature breakdown.
*   **FAQ:** Pricing-specific questions.

---

## 5. Roadmap

A transparent view of upcoming features to build trust and show momentum.

### Planned Features
*   **AI Highlights:** Automatic clip generation from live streams.
*   **Tournament Mobile App:** Dedicated app for players and fans to track brackets.
*   **Hardware Partnerships:** Pre-configured kits for schools.
*   **More Sports:** Expanding support to Baseball, Softball, and Cricket.
*   **Stat Integration:** Deep integration with external stat providers.

---

## 6. Support & Resources

### `/docs` (Documentation)
*   **Layout:** Sidebar navigation (Categories), Search bar (Algolia/Similar), Main content area.
*   **Content:**
    *   Quick Start Guides.
    *   Hardware Setup.
    *   Troubleshooting.
    *   API Reference (for advanced users).

### `/support` (FAQ & Contact)
*   **FAQ Section (Collapsible):**
    *   "What hardware do I need?"
    *   "Is it free for small schools?"
    *   "Can I stream to YouTube?"
*   **Contact Form:** Categories for Sales, Support, and Partnership.

---

## 7. Footer Layout

*   **Logo & Tagline.**
*   **Product:** Features, Pricing, Roadmap, Changelog.
*   **Resources:** Docs, Blog, Community, Help Center.
*   **Company:** About Us, Careers, Contact, Legal (Privacy/Terms).
*   **Socials:** Twitter, LinkedIn, Instagram, Discord.

## 8. Technology Stack & Deployment

The platform is built on modern, scalable technologies designed for both cloud and local execution.

*   **Framework:** [TanStack Start](https://tanstack.com/start) (Full-stack React)
*   **Backend & Database:** [Convex](https://convex.dev/)
*   **Deployment:**
    *   **Cloud (Default):** Accessible via standard web browsers.
    *   **Local (Hybrid):** Packaged as an [Electron](https://www.electronjs.org/) application for offline/low-latency production use (see `docs/hybrid-deployment.md`).

---

## 9. Implementation Checklist

- [ ] Update `app/routes/__root.tsx` to include the conditional User Avatar/Login logic in the Navbar.
- [ ] Create/Update `app/routes/index.tsx` with the new Hero, Social Proof, and Features sections.
- [ ] Create `app/routes/leagues/index.tsx` (Landing Page).
- [ ] Create `app/routes/schools/index.tsx` (Landing Page).
- [ ] Create `app/routes/pricing/index.tsx`.
- [ ] Update `app/routes/sports/index.tsx` with search functionality.
- [ ] Ensure `content/docs` is correctly routed to `/docs`.
- [ ] Add `app/routes/support/index.tsx` with FAQ component.
