# SmartRoad Frontend

SmartRoad is a Next.js frontend foundation for road construction and contractor management. It is prepared to communicate with the separate Spring Boot REST API.

## Tech Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS v4
- ESLint and npm

## Prerequisites

- Node.js 18.18 or newer
- npm

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment Variables

`NEXT_PUBLIC_API_BASE_URL` is the Spring Boot API base URL. Its local default is `http://localhost:8080/api/v1`.

`NEXT_PUBLIC_BACKEND_URL` is the backend origin used for OAuth redirects. Its local default is `http://localhost:8080`.

## Development Commands

```bash
npm run dev
npm run lint
npm run build
npm start
```

## Project Structure

- `src/app`: App Router pages, route groups, and layouts
- `src/components`: reusable UI, layout, navigation, and common components
- `src/lib/api`: typed native-fetch API client
- `src/lib/auth`: JWT token and authentication helpers
- `src/types`: shared API types

## Backend API Configuration

The API client reads the backend URL only from `NEXT_PUBLIC_API_BASE_URL`; components do not hardcode backend endpoints. It supports `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` and expects the standard `{ success, message, data }` response envelope.

## Authentication flow

The frontend integrates signup, login, OTP verification/resend, password reset, password change, refresh-token retry, current-user lookup, logout, and logout-all using the backend API. Access tokens are kept in memory; the JSON refresh token returned by the current backend is scoped to the browser session. For a stronger production model, move the refresh token to an HttpOnly secure cookie in the backend.

Google sign-in starts at `${NEXT_PUBLIC_BACKEND_URL}/oauth2/authorize/google`. Apple is intentionally not shown because the backend has no Apple authorization endpoint.
