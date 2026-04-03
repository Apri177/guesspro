# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — run ESLint (flat config, eslint.config.mjs)

## Tech Stack

- **Next.js 16.2** (App Router) with React 19 and TypeScript (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin
- Path alias: `@/*` maps to `./src/*`
- Fonts: Geist and Geist Mono loaded via `next/font/google`

## Architecture

- `src/app/` — App Router pages and layouts (all source lives under `src/`)
- `src/app/layout.tsx` — root layout with font setup and global CSS
- `src/app/page.tsx` — home page (currently default template)
- `src/app/globals.css` — global styles / Tailwind imports
- `public/` — static assets

## Important: Next.js 16 Breaking Changes

This project uses **Next.js 16**, which has breaking changes from earlier versions. Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/` — especially `01-app/` for App Router documentation. Do not rely on training data for Next.js APIs.
