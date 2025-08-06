# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev --turbopack` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

This is a Next.js 15.4.5 application using the App Router architecture with TypeScript and Tailwind CSS v4.

### Key Structure
- `app/` - Next.js App Router directory containing pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global styles
- TypeScript configured with path aliases (`@/*` → `./`)
- Uses React 19.1.0 and strict TypeScript settings

### Technology Stack
- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript 5+ with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **Build**: Turbopack for development (use `--turbopack` flag)

### Development Notes
- Project uses modern Next.js App Router pattern
- All components are in TypeScript with strict type checking
- Development server runs on http://localhost:3000
- Font variables are configured: `--font-geist-sans` and `--font-geist-mono`