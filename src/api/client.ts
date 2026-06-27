import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * Shared Axios instance for talking to the BookSee.Api backend.
 *
 * Base URL resolution:
 *   1. VITE_API_BASE_URL (set in .env.local or build environment) — used
 *      verbatim when present.
 *   2. Empty string → relative URLs ("/api/..."). In dev, Vite's proxy in
 *      vite.config.ts forwards those to the .NET API.
 */
const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Light error logging so failures aren't silent in the console. Components
// surface the error in the UI via the useAsync hook.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? '(unknown url)';
    const status = error.response?.status ?? 'NO_STATUS';
    // eslint-disable-next-line no-console
    console.error(`[API ${status}] ${url}`, error.message);
    return Promise.reject(error);
  }
);

/**
 * Currently signed-in user id. Until real auth is wired in, this comes
 * from VITE_CURRENT_USER_ID (defaults to 1 — matches Manoj Chatterjee
 * in the seed data).
 */
export const CURRENT_USER_ID: number = Number(
  (import.meta.env.VITE_CURRENT_USER_ID as string | undefined) ?? 1
);
