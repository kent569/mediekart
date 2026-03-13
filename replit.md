# Nordic Business Map

## Overview

An interactive map application visualizing Nordic business networks and company relationships. The app displays company offices across Norway, Sweden, Denmark, and Finland with filtering capabilities by industry and country. Users can explore company details, office locations, and inter-company relationships (ownership, partnerships, joint ventures) through an interactive Leaflet-based map interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and data fetching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Nordic-inspired color palette (cool greys, deep blues)
- **Map Integration**: Leaflet with react-leaflet bindings for interactive mapping
- **Animations**: Framer Motion for smooth sidebar transitions
- **Build Tool**: Vite with path aliases (`@/` for client/src, `@shared/` for shared code)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Development**: Hot module replacement via Vite middleware in development mode

### Data Layer
- **Database**: PostgreSQL (connection via `DATABASE_URL` environment variable)
- **Schema Location**: `shared/schema.ts` defines all tables using Drizzle's pgTable
- **Core Entities**:
  - `countries` - Nordic countries with coordinates
  - `companies` - Business entities with industry/description
  - `offices` - Physical locations (HQ or Branch) linked to companies and countries
  - `relationships` - Inter-company connections (ownership percentages, partnership types)
- **Migrations**: Managed via drizzle-kit with `db:push` command

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Database table definitions and Zod insert schemas
- `routes.ts` - API route definitions with Zod response schemas for type-safe data fetching

### Build System
- **Development**: `tsx` runs TypeScript directly
- **Production Build**: 
  - Vite builds client to `dist/public`
  - esbuild bundles server to `dist/index.cjs` with selective dependency bundling for faster cold starts

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, requires `DATABASE_URL` environment variable

### Third-Party APIs
- **GeoJSON Countries Dataset**: Fetches Nordic country boundaries from `datasets/geo-countries` GitHub repository for map rendering

### Key npm Packages
- **Mapping**: `leaflet`, `react-leaflet` for interactive maps
- **UI Framework**: Full shadcn/ui component set via `@radix-ui/*` primitives
- **Data Fetching**: `@tanstack/react-query` for caching and synchronization
- **Form Handling**: `react-hook-form` with `@hookform/resolvers` for Zod integration
- **Animation**: `framer-motion` for UI transitions