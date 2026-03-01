# Internationalization (i18n) Strategy

This document outlines the strategy, technical implementation, and supported languages for Scorr Studio's global expansion.

## 1. Technical Strategy

We utilize **[next-intl](https://next-intl-docs.vercel.app/)** for managing internationalization in our Next.js application.

### Key Principles
*   **Routing:** **No locale prefixes in URLs** (e.g., `/dashboard`, not `/en/dashboard`).
    *   Implementation: Set `localePrefix: 'never'` in `next-intl` configuration.
*   **SEO Strategy:**
    *   **Default:** The root URL serves English content by default, which will be the primary version indexed by search engines.
    *   **Alternate:** Non-English versions are served dynamically based on user selection but share the same URL. *Note: This means search engines will primarily rank the English version.*
*   **Detection:**
    1.  Check for `NEXT_LOCALE` cookie.
    2.  If missing, check `Accept-Language` header (optional, or default to English).
*   **Persistence:** A cookie (`NEXT_LOCALE`) is set immediately when a user switches languages.
*   **Fallback:** English (`en`) is the hard fallback.

### AI Agent Guidelines 🤖
**CRITICAL:** When adding new features or modifying UI text, AI agents must follow these rules:
1.  **Never hardcode strings.** All text must be extracted to message keys.
2.  **Add keys to ALL languages.** When creating a new key in `messages/en.json`, you **MUST** immediately add the same key to all other language files (e.g., `es.json`, `zh.json`) with a machine-translated value or a placeholder.
3.  **Group keys logically.** Use nested objects for pages/components (e.g., `HomePage.hero.title`, `Settings.profile.label`).

---

## 2. User Experience

### Language Switcher
*   **Location:** Global Navbar (Top Right).
*   **UI:** Dropdown menu displaying a globe icon 🌐 and the current language name/flag.
*   **Behavior:** Selecting a new language sets the `NEXT_LOCALE` cookie and reloads the current page (without changing the URL) to apply translations.

### Date & Number Formatting
*   Dates, times, and currencies are automatically formatted according to the selected locale using `Intl.DateTimeFormat` and `Intl.NumberFormat`.

---

## 3. Supported Languages

We support the top 15 languages worldwide to maximize accessibility for sports organizations globally.

| Rank | Language | Native Name | Code | Speakers (Approx) | Why Include? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **English** (Default) | English | `en` | 1.5 Billion | Global business & tech standard. |
| **2** | **Mandarin Chinese** | 中文 (简体) | `zh` | 1.1 Billion | Huge market; dominant in Table Tennis/Badminton. |
| **3** | **Hindi** | हिन्दी | `hi` | 609 Million | Massive emerging market; Cricket powerhouse. |
| **4** | **Spanish** | Español | `es` | 559 Million | Critical for Latin America, Spain, and US markets. |
| **5** | **French** | Français | `fr` | 309 Million | Key for Europe, Canada, and West Africa. |
| **6** | **Arabic** | العربية | `ar` | 274 Million | High growth in Middle East sports investment. |
| **7** | **Bengali** | বাংলা | `bn` | 272 Million | High population density; strong Cricket interest. |
| **8** | **Portuguese** | Português | `pt` | 263 Million | Essential for Brazil (Football/Volleyball) & Portugal. |
| **9** | **Russian** | Русский | `ru` | 255 Million | Wide reach across Eastern Europe & Central Asia. |
| **10** | **Urdu** | اردو | `ur` | 231 Million | Critical for Pakistan market (Cricket). |
| **11** | **Indonesian** | Bahasa Indonesia | `id` | 199 Million | Largest economy in SE Asia; Badminton stronghold. |
| **12** | **German** | Deutsch | `de` | 133 Million | Major European sports market (Football/Handball). |
| **13** | **Japanese** | 日本語 | `ja` | 123 Million | High-value market; diverse sports culture (Baseball/Judo). |
| **14** | **Turkish** | Türkçe | `tr` | 88 Million | Strategic bridge between Europe and Asia. |
| **15** | **Korean** | 한국어 | `ko` | 82 Million | Leader in Esports, Archery, and Taekwondo. |

---

## 4. Implementation Checklist

- [ ] Install `next-intl`.
- [ ] Configure `i18n.ts` request configuration.
- [ ] Set up `middleware.ts` for locale routing and detection.
- [ ] Create `messages/` directory and populate `en.json`.
- [ ] Generate standard `[locale].json` files for all 15 supported languages.
- [ ] Implement `LanguageSwitcher` component in the Navbar.
- [ ] Refactor `app/layout.tsx` to wrap children in `NextIntlClientProvider`.
