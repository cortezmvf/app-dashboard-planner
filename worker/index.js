/**
 * Cloudflare Worker — routes data-driven-ai.com/dashboard-planner/*
 * to the app-dashboard-planner.pages.dev deployment.
 *
 * Deploy this Worker and add a route:
 *   data-driven-ai.com/dashboard-planner*
 */

const PAGES_URL = 'https://app-dashboard-planner.pages.dev'

export default {
  async fetch(request) {
    const url = new URL(request.url)

    // Only handle /dashboard-planner paths
    if (!url.pathname.startsWith('/dashboard-planner')) {
      return fetch(request)
    }

    // Rewrite to Pages deployment (path stays the same — Vite base handles it)
    const targetUrl = PAGES_URL + url.pathname + url.search
    const proxied = new Request(targetUrl, request)

    return fetch(proxied)
  },
}
