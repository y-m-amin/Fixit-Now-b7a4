# FixItNow Backend

Backend API for FixItNow, a home services marketplace connecting customers with technicians (plumbing, electrical, cleaning, painting, etc.).

## Tech Stack

- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Validation:** Zod
- **Payments:** Stripe (test mode)
- **Security/logging:** Helmet, CORS, Morgan

## Project Status

All core modules are implemented: **auth, categories, technicians, services, bookings, payments (Stripe), reviews, and admin.** A Postman collection covering every endpoint is also included.

## Project Structure

```
fixitnow-backend/
├── prisma/
│   ├── schema.prisma        # All core models (Users, TechnicianProfiles, Categories,
│   │                         # Services, AvailabilitySlots, Bookings, Payments, Reviews)
│   └── seed.ts               # Creates admin user + base categories
├── docs/
│   ├── postman_collection.json    # Importable Postman collection
│   └── postman_environment.json   # Companion Postman environment
├── src/
│   ├── config/
│   │   ├── env.ts             # Typed environment variable loader
│   │   ├── db.ts              # Prisma client singleton
│   │   └── stripe.ts          # Stripe client singleton
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
│   │   ├── auth/               # register, login, me
│   │   ├── categories/         # public listing, admin creation
│   │   ├── technicians/        # public browsing, profile & availability self-management
│   │   ├── services/           # public listing, technician CRUD for own listings
│   │   ├── bookings/           # create, list, detail, cancel, technician status transitions
│   │   ├── payments/           # Stripe payment intents + webhook confirmation, history
│   │   ├── reviews/            # post-completion reviews, technician rating rollups
│   │   └── admin/               # user management, all-bookings view, categories
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

## API Endpoints

### Auth
| Method | Endpoint            | Description                          | Auth required |
|--------|----------------------|---------------------------------------|----------------|
| POST   | `/api/auth/register`  | Register as customer or technician    | No             |
| POST   | `/api/auth/login`     | Login, returns JWT                    | No             |
| GET    | `/api/auth/me`        | Get current authenticated user        | Yes            |

### Public browsing
| Method | Endpoint               | Description                              |
|--------|-------------------------|--------------------------------------------|
| GET    | `/api/categories`        | List service categories                    |
| GET    | `/api/technicians`       | List technicians (filter: category, location, minRating) |
| GET    | `/api/technicians/:id`   | Technician profile with services & reviews |
| GET    | `/api/services`          | List services (filter: category, location, minRating, maxPrice) |

### Technician self-management (role: TECHNICIAN)
| Method | Endpoint                        | Description                        |
|--------|-----------------------------------|--------------------------------------|
| PUT    | `/api/technician/profile`         | Update bio, experience, rate, skills |
| PUT    | `/api/technician/availability`    | Replace weekly availability slots    |
| POST   | `/api/technician/services`        | Create a service listing             |
| PUT    | `/api/technician/services/:id`    | Update own service listing           |
| DELETE | `/api/technician/services/:id`    | Delete own service listing           |
| GET    | `/api/technician/bookings`        | List incoming bookings               |
| PATCH  | `/api/technician/bookings/:id`    | Accept / decline / start / complete a booking |

### Bookings (authenticated)
| Method | Endpoint                    | Description                                  |
|--------|-------------------------------|-------------------------------------------------|
| POST   | `/api/bookings`                | Create booking (role: CUSTOMER)                 |
| GET    | `/api/bookings`                | List your own bookings (customer or technician) |
| GET    | `/api/bookings/:id`            | Booking detail (owner or admin)                 |
| PATCH  | `/api/bookings/:id/cancel`     | Cancel booking (role: CUSTOMER, before IN_PROGRESS) |

### Payments — Stripe test mode (authenticated)
| Method | Endpoint                | Description                                    |
|--------|---------------------------|---------------------------------------------------|
| POST   | `/api/payments/create`     | Create a Stripe PaymentIntent for an ACCEPTED booking |
| POST   | `/api/payments/confirm`    | Stripe webhook — marks payment COMPLETED, booking PAID |
| GET    | `/api/payments`            | Your payment history                              |
| GET    | `/api/payments/:id`        | Payment detail (owner or admin)                   |

### Reviews (role: CUSTOMER)
| Method | Endpoint          | Description                                  |
|--------|---------------------|--------------------------------------------------|
| POST   | `/api/reviews`       | Review a COMPLETED booking; rolls up technician rating |

### Admin (role: ADMIN)
| Method | Endpoint                       | Description                       |
|--------|----------------------------------|--------------------------------------|
| GET    | `/api/admin/users`               | List all users (filter: role, status) |
| PATCH  | `/api/admin/users/:id`           | Ban / unban a user                   |
| GET    | `/api/admin/bookings`            | List all bookings (filter: status)   |
| GET    | `/api/admin/categories`          | List all categories                  |
| POST   | `/api/admin/categories`          | Create a new category                |

Send the JWT as `Authorization: Bearer <token>` on any authenticated route.

## Booking Status Flow

```
REQUESTED → ACCEPTED → PAID → IN_PROGRESS → COMPLETED
         ↘ DECLINED

Customer can CANCEL at any point before IN_PROGRESS.
```

`ACCEPTED`/`DECLINED` are set by the technician. `PAID` is set automatically by the Stripe webhook once payment succeeds — no client can set it directly. `IN_PROGRESS`/`COMPLETED` are set by the technician.

## Stripe Setup (test mode)

1. Get your test secret key from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) and put it in `STRIPE_SECRET_KEY`.
2. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli), run `stripe login`, then:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/confirm
   ```
3. Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET`.

## API Documentation

Import `docs/postman_collection.json` and `docs/postman_environment.json` into Postman. Login/register requests auto-save the JWT into the environment (`token`, `technicianToken`, `adminToken`), and a few "create" requests auto-save IDs (`categoryId`, `serviceId`, `bookingId`, `paymentId`) so you can run requests in sequence without copy-pasting.

## Deploying (Render)

When creating the Web Service on Render, use these exact settings:

| Setting | Value |
|---------|-------|
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

`npm install` triggers the `postinstall` script (`prisma generate`) automatically, so the Prisma client is always generated before `npm run build` compiles the TypeScript. **The Build Command must include `npm install`** — if it's just `npm run build` on its own, nothing gets installed and every import will fail with "Cannot find module".

Environment variables to set in Render's dashboard: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NODE_ENV=production`.

After the first successful deploy, run the migration and seed once via Render's **Shell** tab:
```bash
npx prisma migrate deploy
npm run prisma:seed
```

## Next Steps

- Automated tests

