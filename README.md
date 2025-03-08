# Auth Apps

A monorepo with authentication applications: API, Web, and Dashboard.

## Applications

- **API**: Backend API built with Elysia.js
- **Web**: Frontend web application built with Next.js
- **Dashboard**: Admin dashboard built with Next.js

## Packages

- **UI**: Shared UI components
- **DB**: Database schema and utilities

## Getting Started

### Prerequisites

- Node.js 18+
- Bun 1.0+
- PostgreSQL
- Redis

### Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```bash
# Create .env.local files in each app directory
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
```

4. Generate and run database migrations:

```bash
# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate
```

5. Start the development servers:

```bash
bun run dev
```

## Development

### API (Elysia.js)

The API server runs on port 3000 by default.

### Web (Next.js)

The web application runs on port 3001 by default.

### Dashboard (Next.js)

The dashboard application runs on port 3002 by default.

## Database

The project uses PostgreSQL with Drizzle ORM for database management.

To view and manage your database with a UI:

```bash
bun run db:studio
```

## Authentication

Authentication is handled using sessions stored in Redis and cookies.

## License

This project is licensed under the MIT License.
