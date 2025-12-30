# Booking Platform Backend

A robust ticket booking platform backend built with Node.js, Express, TypeScript, and Prisma.

## 🏗️ Architecture

```
src/
├── config/           # Configuration files
│   ├── index.ts      # Environment config
│   └── database.ts   # Prisma client singleton
├── middleware/       # Express middlewares
│   ├── auth.middleware.ts    # JWT authentication
│   └── error.middleware.ts   # Error handling
├── routes/           # API route handlers
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── event.routes.ts
│   ├── booking.routes.ts
│   └── venue.routes.ts
├── services/         # Business logic
│   ├── auth.service.ts
│   ├── event.service.ts
│   ├── booking.service.ts
│   └── seatLock.service.ts   # ⭐ Seat locking logic
├── jobs/             # Background jobs
│   └── cron.ts       # Scheduled tasks
├── types/            # TypeScript types
├── utils/            # Utility functions
└── index.ts          # App entry point
```

## 🔒 Seat Locking Mechanism

The platform uses a **two-phase locking** strategy to prevent overbooking:

### 1. Pessimistic Locking (Database-Level)
- Uses `SELECT ... FOR UPDATE NOWAIT` to lock seat rows during selection
- Prevents concurrent transactions from modifying the same seats
- Implemented in `seatLock.service.ts`

### 2. Optimistic Locking (Application-Level)
- Uses `version` field on bookings to detect concurrent modifications
- Prevents race conditions during booking confirmation
- Implemented in `booking.service.ts`

### Flow:
```
1. User selects seats → POST /api/bookings/hold-seats
   - Seats locked with pessimistic lock
   - Status: AVAILABLE → HELD
   - TTL: 10 minutes

2. User creates booking → POST /api/bookings/create
   - Validates held seats
   - Creates PENDING booking

3. User completes payment → POST /api/bookings/:id/confirm
   - Optimistic lock check
   - Status: PENDING → CONFIRMED
   - Seats: HELD → BOOKED

4. Background job runs every minute
   - Releases expired holds
   - Expires pending bookings
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh-token` | Refresh access token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/change-password` | Change password |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events (with filters) |
| GET | `/api/events/:id` | Get event details |
| GET | `/api/events/:id/seats` | Get seat availability |
| POST | `/api/events` | Create event (Admin) |
| PUT | `/api/events/:id` | Update event (Admin) |
| POST | `/api/events/:id/publish` | Publish event (Admin) |
| POST | `/api/events/:id/cancel` | Cancel event (Admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings/hold-seats` | Hold/lock seats |
| POST | `/api/bookings/release-seats` | Release held seats |
| POST | `/api/bookings/extend-hold` | Extend hold time |
| GET | `/api/bookings/hold-status` | Get held seats |
| POST | `/api/bookings/create` | Create booking |
| POST | `/api/bookings/:id/confirm` | Confirm after payment |
| POST | `/api/bookings/:id/cancel` | Cancel booking |
| GET | `/api/bookings/:id` | Get booking details |
| GET | `/api/bookings` | List user bookings |

### Venues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/venues` | List venues |
| GET | `/api/venues/:id` | Get venue details |
| POST | `/api/venues` | Create venue (Admin) |
| PUT | `/api/venues/:id` | Update venue (Admin) |
| POST | `/api/venues/:id/sections` | Add section (Admin) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for distributed locking)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start development server:
```bash
npm run dev
```

## 📊 Database Schema

See `prisma/schema.prisma` for the complete database schema including:
- **User** - Authentication and profiles
- **Venue** - Physical locations
- **Section** - Venue sections (VIP, Balcony, etc.)
- **Event** - Shows, concerts, movies
- **Seat** - Individual seats with lock fields
- **Booking** - User bookings with optimistic lock
- **BookingItem** - Booked seats
- **Payment** - Payment records
- **Review** - User reviews
- **Notification** - User notifications
- **Coupon** - Discount codes

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (USER, ADMIN, ORGANIZER)
- Helmet for HTTP headers
- CORS configuration
- Rate limiting ready
- Password hashing with bcrypt

## 🛠️ Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |
