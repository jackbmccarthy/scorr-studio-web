/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiHighlights from "../aiHighlights.js";
import type * as analytics from "../analytics.js";
import type * as brackets from "../brackets.js";
import type * as branding from "../branding.js";
import type * as competitions from "../competitions.js";
import type * as displays from "../displays.js";
import type * as emailTemplates from "../emailTemplates.js";
import type * as exports from "../exports.js";
import type * as integrations from "../integrations.js";
import type * as leagues from "../leagues.js";
import type * as matchTimeline from "../matchTimeline.js";
import type * as matches from "../matches.js";
import type * as members from "../members.js";
import type * as notificationPreferences from "../notificationPreferences.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as players from "../players.js";
import type * as publicLinks from "../publicLinks.js";
import type * as registrations from "../registrations.js";
import type * as results from "../results.js";
import type * as scheduling from "../scheduling.js";
import type * as settings from "../settings.js";
import type * as socialPosts from "../socialPosts.js";
import type * as sponsors from "../sponsors.js";
import type * as streams from "../streams.js";
import type * as teams from "../teams.js";
import type * as tenants from "../tenants.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiHighlights: typeof aiHighlights;
  analytics: typeof analytics;
  brackets: typeof brackets;
  branding: typeof branding;
  competitions: typeof competitions;
  displays: typeof displays;
  emailTemplates: typeof emailTemplates;
  exports: typeof exports;
  integrations: typeof integrations;
  leagues: typeof leagues;
  matchTimeline: typeof matchTimeline;
  matches: typeof matches;
  members: typeof members;
  notificationPreferences: typeof notificationPreferences;
  notifications: typeof notifications;
  payments: typeof payments;
  players: typeof players;
  publicLinks: typeof publicLinks;
  registrations: typeof registrations;
  results: typeof results;
  scheduling: typeof scheduling;
  settings: typeof settings;
  socialPosts: typeof socialPosts;
  sponsors: typeof sponsors;
  streams: typeof streams;
  teams: typeof teams;
  tenants: typeof tenants;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
