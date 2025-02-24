# DevSpace

DevSpace is a project management application built with Bun, Hono, React, and PostgreSQL.

## Prerequisites

- [Bun](https://bun.sh) (v1.2.2 or higher)
- PostgreSQL (v15 or higher)
- Node.js (v18 or higher)

## Project Structure

```
.
├── frontend/     # React frontend application
├── server/       # Hono backend server
└── drizzle/      # Database migrations
```

## Local Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and update the values
3. Install dependencies:

```bash
cd /server bun install
```

```bash
cd /frontend bun install
```

4. Run database migrations:

```bash
bun migrate:dev
```

5. Seed the database (for predefined roles and permissions):

```bash
bun seed:dev
```

### Running the Application

#### Development Mode

1. Start the backend server:

```bash
cd server && bun dev
```

2. In a separate terminal, start the frontend development server:

```bash
cd frontend && bun dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

#### Production Mode

In production, the frontend is served through the Hono backend server:

```bash
cd frontend
bun run build
cd ..
bun start
```

The application will be available at http://localhost:3000 with the API accessible at http://localhost:3000/api

## API Routes

All API routes are prefixed with `/api`:

- Authentication: `/api/auth/*`
- Users: `/api/user/*`
- Projects: `/api/project/*`
- Tasks: `/api/task/*`
- Search: `/api/search/*`

## Deployment

The application is configured for deployment on Fly.io. The frontend is built and served through the Hono backend server.

Key files for deployment:

- `Dockerfile`: Container configuration
- `fly.toml`: Fly.io deployment configuration

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `RESEND_API_KEY`: API key for email service
- `APP_ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

For development, the default allowed origins are:

- http://localhost:5173 (Frontend dev server)
- http://localhost:3000 (Backend server)
