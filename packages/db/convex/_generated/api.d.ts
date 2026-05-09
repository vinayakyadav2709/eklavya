/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as http from "../http.js";
import type * as investmentHoldings from "../investmentHoldings.js";
import type * as kiteAuth from "../kiteAuth.js";
import type * as kiteHelpers from "../kiteHelpers.js";
import type * as kiteSync from "../kiteSync.js";
import type * as kotakAuth from "../kotakAuth.js";
import type * as kotakHelpers from "../kotakHelpers.js";
import type * as kotakSync from "../kotakSync.js";
import type * as pillars from "../pillars.js";
import type * as powerTasks from "../powerTasks.js";
import type * as providers from "../providers.js";
import type * as transactions from "../transactions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  http: typeof http;
  investmentHoldings: typeof investmentHoldings;
  kiteAuth: typeof kiteAuth;
  kiteHelpers: typeof kiteHelpers;
  kiteSync: typeof kiteSync;
  kotakAuth: typeof kotakAuth;
  kotakHelpers: typeof kotakHelpers;
  kotakSync: typeof kotakSync;
  pillars: typeof pillars;
  powerTasks: typeof powerTasks;
  providers: typeof providers;
  transactions: typeof transactions;
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
