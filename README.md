# FixItNow Backend

Backend API for FixItNow, a home services marketplace connecting customers with technicians (plumbing, electrical, cleaning, painting, etc.).

## Tech Stack

- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Validation:** Zod
- **Payments:** Stripe (test mode) — SSLCommerz planned
- **Security/logging:** Helmet, CORS, Morgan

## Project Status

This is the **core structure**: project scaffolding, database schema, and the full authentication module. Remaining feature modules (technicians, services, bookings, payments, reviews, admin) are stubbed as empty folders under `src/modules/` and will be built out next, following the same pattern as `src/modules/auth`.

## Project Structure

```
fixitnow-backend/
├── prisma/
│   ├── schema.prisma        # All core models (Users, TechnicianProfiles, Categories,
│   │                         # Services, AvailabilitySlots, Bookings, Payments, Reviews)
│   └── seed.ts               # Creates admin user + base categories
├── src/
│   ├── config/
│   │   ├── env.ts             # Typed environment variable loader
│   │   └── db.ts              # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT authentication + role-based authorization
│   │   ├── validate.middleware.ts # Generic Zod request validator
│   │   └── error.middleware.ts    # 404 handler + global error handler
│   ├── utils/
│   │   ├── ApiError.ts        # Standard operational error class
│   │   ├── ApiResponse.ts     # Standard success response helper
│   │   ├── catchAsync.ts      # Wraps async controllers
│   │   ├── jwt.ts             # Sign/verify JWT
│   │   └── password.ts        # Hash/compare passwords
│   ├── modules/
│   │   └── auth/               # register, login, me
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       ├── auth.routes.ts
│   │       └── auth.validation.ts
│   ├── app.ts                 # Express app, middleware, route mounting
│   └── server.ts               # Entrypoint, graceful shutdown
├── .env.example
├── package.json
└── tsconfig.json
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `DATABASE_URL` with your PostgreSQL connection string, and set a strong `JWT_SECRET`. Add your Stripe **test mode** secret key to `STRIPE_SECRET_KEY`.

### 3. Run migrations and generate the Prisma client

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Seed the database (creates admin user + base categories)

```bash
npm run prisma:seed
```

### 5. Start the dev server

```bash
npm run dev
```

The API will be running at `http://localhost:5000`. Health check: `GET /health`.

## Admin Credentials

Created by the seed script (`npm run prisma:seed`):

| Field    | Value               |
|----------|----------------------|
| Email    | `admin@fixitnow.com` |
| Password | `Admin@12345`        |

> Change this password immediately in any non-local environment.

## API Conventions

**Every response** — success or error — follows a consistent JSON envelope:

Success:
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "user": { "...": "..." }, "token": "..." }
}
```

Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errorDetails": [{ "path": "email", "message": "Invalid email address" }]
}
```

## Auth Endpoints (implemented)

| Method | Endpoint            | Description                          | Auth required |
|--------|----------------------|---------------------------------------|----------------|
| POST   | `/api/auth/register`  | Register as customer or technician    | No             |
| POST   | `/api/auth/login`     | Login, returns JWT                    | No             |
| GET    | `/api/auth/me`        | Get current authenticated user        | Yes            |

Send the JWT as `Authorization: Bearer <token>` on authenticated routes.

## Next Steps

- Categories & Services (public browse + technician management)
- Bookings (create, status transitions, cancellation rules)
- Payments (Stripe integration, payment history)
- Reviews (post-completion, technician rating rollups)
- Admin (user management, category moderation, all-bookings view)
- Postman/Swagger API documentation
