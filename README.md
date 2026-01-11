# 🎟️ Booking Platform

A full-stack **event ticket booking platform** built with modern technologies, featuring real-time seat selection with advanced locking mechanisms to prevent overbooking.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?logo=prisma&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Backend Details](#-backend-details)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Seat Locking Mechanism](#-seat-locking-mechanism)
- [Frontend Features](#-frontend-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)

---

## 🎯 Overview

The **Booking Platform** is a comprehensive ticket booking system designed for events like concerts, movies, sports, theater, comedy shows, and conferences. It allows users to:

- 🔍 Browse and search events with advanced filters
- 🪑 Select seats in real-time with interactive seat maps
- 💳 Book tickets with secure payment processing
- 📱 Manage their bookings and profile

The platform includes role-based access for **Users**, **Organizers**, and **Admins**.

---

## ✨ Core Features

### 🔐 Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (USER, ORGANIZER, ADMIN)
- Secure password hashing with bcrypt
- HTTP-only cookie support for enhanced security
- Profile management and password change

### 🎭 Event Management
- Create, update, publish, and cancel events
- Event categories: Movie, Concert, Sports, Theater, Comedy, Conference
- Event lifecycle: `DRAFT` → `PUBLISHED` → `COMPLETED`/`CANCELLED`
- Event filtering by category, city, date range, and price range
- Auto-generated seats based on venue sections
- Event images and banners support

### 🪑 Real-Time Seat Selection
- Interactive seat map with sections (VIP, Balcony, Ground Floor, etc.)
- **Two-phase locking** to prevent race conditions and overbooking
- 10-minute seat hold with extension capability
- Real-time availability updates
- Maximum 6 seats per user per event

### 📝 Booking System
- Multi-seat booking in a single transaction
- Booking status tracking: `PENDING` → `CONFIRMED`/`CANCELLED`/`EXPIRED`
- Automatic booking expiration for unpaid reservations
- Booking history with detailed seat information
- Cancellation support with seat release

### ⭐ Additional Features
- Review and rating system (1-5 stars) for events
- Coupon and discount codes (percentage or fixed amount)
- User notifications (booking confirmations, event reminders)
- Background jobs for cleanup and maintenance
  
### Future Scopes

### 💳 Payment Integration
- Payment gateway ready (Razorpay support)
- GST tax calculation (18%)
- Refund processing capability
- Multiple payment methods (card, UPI, netbanking)


---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js + Express 5** | REST API server |
| **TypeScript** | Type-safe development |
| **Prisma ORM** | Database operations |
| **PostgreSQL** | Primary database |
| **JWT** | Authentication tokens |
| **bcrypt.js** | Password hashing |
| **node-cron** | Background scheduled jobs |
| **Helmet** | Security HTTP headers |
| **Morgan** | HTTP request logging |
| **Cookie Parser** | HTTP-only cookie handling |

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool and dev server |
| **React Router DOM 7** | Client-side routing |
| **Tailwind CSS 4** | Utility-first styling |
| **Axios** | HTTP client with interceptors |

---

## 🏗️ Architecture

```
BookingPlatform/
├── backend/
│   ├── src/
│   │   ├── config/               # Configuration files
│   │   │   ├── index.ts          # Environment & app config
│   │   │   └── database.ts       # Prisma client singleton
│   │   │
│   │   ├── middleware/           # Express middlewares
│   │   │   ├── auth.middleware.ts      # JWT authentication
│   │   │   ├── error.middleware.ts     # Global error handler
│   │   │   └── index.ts                # Exports
│   │   │
│   │   ├── routes/               # API route handlers
│   │   │   ├── auth.routes.ts          # /api/auth/*
│   │   │   ├── user.routes.ts          # /api/users/*
│   │   │   ├── event.routes.ts         # /api/events/*
│   │   │   ├── booking.routes.ts       # /api/bookings/*
│   │   │   ├── venue.routes.ts         # /api/venues/*
│   │   │   └── index.ts                # Route aggregation
│   │   │
│   │   ├── services/             # Business logic layer
│   │   │   ├── auth.service.ts         # Authentication logic
│   │   │   ├── event.service.ts        # Event CRUD operations
│   │   │   ├── booking.service.ts      # Booking management
│   │   │   ├── seatLock.service.ts     # ⭐ Seat locking logic
│   │   │   └── index.ts                # Exports
│   │   │
│   │   ├── jobs/                 # Background jobs
│   │   │   └── cron.ts                 # Scheduled tasks
│   │   │
│   │   ├── types/                # TypeScript type definitions
│   │   ├── utils/                # Utility functions
│   │   └── index.ts              # App entry point
│   │
│   └── prisma/
│       └── schema.prisma         # Database schema
│
└── frontend/
    └── src/
        ├── api/                  # Axios API clients
        │   ├── axios.ts                # Axios instance config
        │   ├── auth.api.ts             # Auth endpoints
        │   ├── event.api.ts            # Event endpoints
        │   ├── booking.api.ts          # Booking endpoints
        │   └── user.api.ts             # User endpoints
        │
        ├── components/           # Reusable React components
        │   ├── booking/                # Seat grid, booking summary
        │   ├── layout/                 # Navbar, Footer
        │   ├── events/                 # Event filters
        │   └── common/                 # Shared components
        │
        ├── context/              # React Context providers
        │   └── AuthContext.tsx         # Authentication state
        │
        ├── pages/                # Application pages
        │   ├── Home.tsx
        │   ├── Events.tsx
        │   ├── EventDetails.tsx
        │   ├── BookingPage.tsx
        │   ├── PaymentPage.tsx
        │   ├── MyBookings.tsx
        │   ├── Profile.tsx
        │   ├── Login.tsx
        │   ├── Register.tsx
        │   └── organizer/              # Organizer dashboard
        │       ├── OrganizerDashboard.tsx
        │       ├── CreateEvent.tsx
        │       └── EditEvent.tsx
        │
        ├── types/                # TypeScript type definitions
        ├── utils/                # Utility functions
        ├── routes.tsx            # Route configuration
        └── App.tsx               # Root component
```

---

## ⚙️ Backend Details

### How the Backend Works

The backend follows a **layered architecture**:

```
Request → Routes → Services → Prisma (Database)
                ↓
        Response with JSON
```

### 1. Entry Point (`src/index.ts`)

The Express application initializes with:

- **Security**: Helmet for HTTP headers, CORS for cross-origin requests
- **Middleware**: Cookie parser, JSON body parser, Morgan logger
- **Routes**: All API endpoints mounted under `/api`
- **Error Handling**: Custom 404 and global error handlers
- **Background Jobs**: Cron jobs for expired holds and bookings

```typescript
// Middleware stack
app.use(helmet());                    // Security headers
app.use(cors({ credentials: true })); // CORS with cookies
app.use(cookieParser());              // Parse cookies
app.use(express.json());              // Parse JSON body
app.use(morgan('dev'));               // Request logging

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);
```

### 2. Configuration (`src/config/index.ts`)

Centralized configuration for:

```typescript
export const config = {
    // Server
    port: 3001,
    nodeEnv: 'development',

    // JWT
    jwt: {
        secret: 'your-super-secret-key',
        expiresIn: '7d',
        refreshExpiresIn: '30d',
    },

    // Seat Hold Configuration
    seatHold: {
        ttlSeconds: 600,        // 10 minutes
        maxSeatsPerUser: 6,     // Max seats per booking
    },

    // Pagination
    pagination: {
        defaultLimit: 10,
        maxLimit: 100,
    },
};
```

### 3. Services Layer

#### AuthService
Handles user authentication:

| Method | Description |
|--------|-------------|
| `register()` | Create new user with hashed password |
| `login()` | Validate credentials and return JWT tokens |
| `refreshToken()` | Issue new access token from refresh token |
| `getProfile()` | Get user profile with booking count |
| `updateProfile()` | Update name and phone |
| `changePassword()` | Change password with current password verification |

#### EventService
Manages event lifecycle:

| Method | Description |
|--------|-------------|
| `createEvent()` | Create event with auto-generated seats |
| `getEvents()` | Paginated listing with filters |
| `getEvent()` | Single event with venue and ratings |
| `getSeatAvailability()` | Seats grouped by section |
| `updateEvent()` | Update event details |
| `publishEvent()` | Change status to PUBLISHED |
| `cancelEvent()` | Cancel event and all bookings |

#### BookingService
Handles the booking flow:

| Method | Description |
|--------|-------------|
| `createBooking()` | Validate held seats and create PENDING booking |
| `confirmBooking()` | Confirm payment with optimistic locking |
| `cancelBooking()` | Cancel and release seats |
| `getBooking()` | Get booking with full details |
| `getUserBookings()` | Paginated user booking history |
| `expirePendingBookings()` | Background job for expired bookings |

#### SeatLockService ⭐
Critical service for preventing overbooking:

| Method | Description |
|--------|-------------|
| `holdSeats()` | Pessimistic lock on seats with TTL |
| `releaseSeats()` | Manual release of held seats |
| `extendHold()` | Extend hold time up to 10 minutes |
| `releaseExpiredHolds()` | Background cleanup job |
| `getHoldStatus()` | Check user's current holds |

### 4. Background Jobs (Cron)

Three scheduled tasks running continuously:

| Job | Schedule | Purpose |
|-----|----------|---------|
| Release Expired Holds | Every minute | Free seats whose hold expired |
| Expire Pending Bookings | Every minute | Mark unpaid bookings as EXPIRED |
| Clean Old Notifications | Daily at midnight | Delete 30+ day old read notifications |

```typescript
// Release expired seat holds
cron.schedule('* * * * *', async () => {
    const result = await SeatLockService.releaseExpiredHolds();
    if (result.released > 0) {
        console.log(`Released ${result.released} expired seat holds`);
    }
});
```

---

## 🗃️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Venue    │       │   Coupon    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ email       │       │ name        │       │ code        │
│ password    │       │ address     │       │ discountType│
│ name        │       │ city        │       │ discountValue│
│ phone       │       │ capacity    │       │ validFrom   │
│ role        │       │ amenities[] │       │ validUntil  │
└──────┬──────┘       └──────┬──────┘       └─────────────┘
       │                     │
       │              ┌──────┴──────┐
       │              │   Section   │
       │              ├─────────────┤
       │              │ id          │
       │              │ name        │
       │              │ rowCount    │
       │              │ seatsPerRow │
       │              │ priceMultiplier│
       │              └──────┬──────┘
       │                     │
       │              ┌──────┴──────┐       ┌─────────────┐
       │              │    Event    │───────│   Review    │
       │              ├─────────────┤       ├─────────────┤
       │              │ id          │       │ id          │
       │              │ title       │       │ userId      │
       │              │ description │       │ eventId     │
       │              │ category    │       │ rating (1-5)│
       │              │ eventDate   │       │ comment     │
       │              │ basePrice   │       └─────────────┘
       │              │ status      │
       │              └──────┬──────┘
       │                     │
       │              ┌──────┴──────┐
       │              │    Seat     │
       │              ├─────────────┤
       │              │ id          │
       │              │ eventId     │
       │              │ sectionId   │
       │              │ rowNumber   │
       │              │ seatNumber  │
       │              │ price       │
       │              │ status      │ ← AVAILABLE|HELD|BOOKED|BLOCKED
       │              │ heldBy      │ ← User ID
       │              │ heldUntil   │ ← Expiry timestamp
       │              │ version     │ ← Optimistic lock
       │              └──────┬──────┘
       │                     │
┌──────┴──────┐       ┌──────┴──────┐       ┌─────────────┐
│   Booking   │───────│ BookingItem │       │ Notification│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ bookingNumber│      │ bookingId   │       │ userId      │
│ userId      │       │ seatId      │       │ type        │
│ eventId     │       │ price       │       │ title       │
│ status      │       └─────────────┘       │ message     │
│ totalAmount │                             │ isRead      │
│ taxAmount   │                             └─────────────┘
│ finalAmount │
│ expiresAt   │
│ version     │ ← Optimistic lock
└──────┬──────┘
       │
┌──────┴──────┐
│   Payment   │
├─────────────┤
│ id          │
│ bookingId   │
│ gatewayOrderId│
│ gatewayPaymentId│
│ amount      │
│ status      │
│ method      │
└─────────────┘
```

### Key Enums

```prisma
enum UserRole {
  USER
  ADMIN
  ORGANIZER
}

enum EventCategory {
  MOVIE
  CONCERT
  SPORTS
  THEATER
  COMEDY
  CONFERENCE
  OTHER
}

enum EventStatus {
  DRAFT
  PUBLISHED
  CANCELLED
  COMPLETED
}

enum SeatStatus {
  AVAILABLE
  HELD
  BOOKED
  BLOCKED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  REFUNDED
  EXPIRED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login and get tokens |
| POST | `/api/auth/refresh-token` | ❌ | Refresh access token |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | ✅ | Get current user profile |
| PUT | `/api/users/profile` | ✅ | Update profile |
| PUT | `/api/users/change-password` | ✅ | Change password |

### Events

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | ❌ | List events with filters |
| GET | `/api/events/:id` | ❌ | Get event details |
| GET | `/api/events/:id/seats` | ❌ | Get seat availability |
| POST | `/api/events` | ✅ Admin | Create event |
| PUT | `/api/events/:id` | ✅ Admin | Update event |
| POST | `/api/events/:id/publish` | ✅ Admin | Publish event |
| POST | `/api/events/:id/cancel` | ✅ Admin | Cancel event |

**Query Parameters for GET `/api/events`:**
- `category` - Filter by event category
- `city` - Filter by venue city
- `dateFrom` - Events starting after this date
- `dateTo` - Events starting before this date
- `minPrice` - Minimum base price
- `maxPrice` - Maximum base price
- `status` - Filter by status (all, DRAFT, PUBLISHED, etc.)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings/hold-seats` | ✅ | Hold/lock seats |
| POST | `/api/bookings/release-seats` | ✅ | Release held seats |
| POST | `/api/bookings/extend-hold` | ✅ | Extend hold time |
| GET | `/api/bookings/hold-status` | ✅ | Get held seats |
| POST | `/api/bookings/create` | ✅ | Create booking |
| POST | `/api/bookings/:id/confirm` | ✅ | Confirm after payment |
| POST | `/api/bookings/:id/cancel` | ✅ | Cancel booking |
| GET | `/api/bookings/:id` | ✅ | Get booking details |
| GET | `/api/bookings` | ✅ | List user bookings |

### Venues

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/venues` | ❌ | List all venues |
| GET | `/api/venues/:id` | ❌ | Get venue details |
| POST | `/api/venues` | ✅ Admin | Create venue |
| PUT | `/api/venues/:id` | ✅ Admin | Update venue |
| POST | `/api/venues/:id/sections` | ✅ Admin | Add section |

---

## 🔒 Seat Locking Mechanism

The platform uses a **two-phase locking** strategy to prevent overbooking in high-concurrency scenarios:

### Phase 1: Pessimistic Locking (Database-Level)

When a user selects seats, we use database transactions with strict isolation:

```typescript
// In SeatLockService.holdSeats()
const result = await prisma.$transaction(async (tx) => {
    // 1. Check user's existing holds (max 6 seats total)
    const existingHolds = await tx.seat.count({
        where: {
            eventId,
            heldBy: userId,
            status: SeatStatus.HELD,
            heldUntil: { gt: new Date() }
        }
    });

    if (existingHolds + seatIds.length > 6) {
        throw new ApiError(400, 'Cannot hold more than 6 seats');
    }

    // 2. Find and verify seats are available
    const availableSeats = await tx.seat.findMany({
        where: {
            id: { in: seatIds },
            eventId,
            status: SeatStatus.AVAILABLE
        }
    });

    if (availableSeats.length !== seatIds.length) {
        throw new ApiError(409, 'Some seats are no longer available');
    }

    // 3. Update seats to HELD (race condition protected by WHERE clause)
    const updateResult = await tx.seat.updateMany({
        where: {
            id: { in: seatIds },
            status: SeatStatus.AVAILABLE  // ← Only if still available!
        },
        data: {
            status: SeatStatus.HELD,
            heldBy: userId,
            heldUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 min
            version: { increment: 1 }
        }
    });

    // 4. Verify all seats were updated
    if (updateResult.count !== seatIds.length) {
        throw new ApiError(409, 'Some seats were booked by another user');
    }

    return { success: true };
}, {
    timeout: 10000  // 10 second timeout
});
```

**Key Protections:**
- Transaction isolation prevents concurrent modifications
- WHERE clause includes `status: AVAILABLE` to prevent double-booking
- Count verification ensures all seats were successfully locked
- Timeout prevents indefinite locking

### Phase 2: Optimistic Locking (Application-Level)

When confirming payment, we use version checking:

```typescript
// In BookingService.confirmBooking()
const updatedBooking = await tx.booking.updateMany({
    where: {
        id: bookingId,
        version: booking.version,  // ← Optimistic lock check
        status: BookingStatus.PENDING
    },
    data: {
        status: BookingStatus.CONFIRMED,
        paymentId,
        confirmedAt: new Date(),
        version: { increment: 1 }  // ← Increment version
    }
});

if (updatedBooking.count === 0) {
    throw new ApiError(409, 'Booking was modified by another transaction');
}
```

### Complete Booking Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: User selects seats                                        │
│  ─────────────────────────────────────────────────────────────────  │
│  POST /api/bookings/hold-seats                                      │
│  Body: { eventId, seatIds: ["seat-1", "seat-2"] }                   │
│                                                                     │
│  ✓ Pessimistic lock acquired                                        │
│  ✓ Seats: AVAILABLE → HELD                                          │
│  ✓ TTL: 10 minutes from now                                         │
│  Response: { success: true, expiresAt: "2024-01-15T12:10:00Z" }     │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: User creates booking                                       │
│  ─────────────────────────────────────────────────────────────────  │
│  POST /api/bookings/create                                          │
│  Body: { eventId, seatIds: ["seat-1", "seat-2"] }                   │
│                                                                     │
│  ✓ Validates seats are still held by this user                      │
│  ✓ Creates PENDING booking with pricing                             │
│  ✓ Calculates: totalAmount + 18% GST = finalAmount                  │
│  Response: { bookingId, status: "PENDING", finalAmount: 1180 }      │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: User completes payment                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  POST /api/bookings/:bookingId/confirm                              │
│  Body: { paymentId: "pay_xyz", paymentMethod: "card" }              │
│                                                                     │
│  ✓ Optimistic lock check on booking version                         │
│  ✓ Booking: PENDING → CONFIRMED                                     │
│  ✓ Seats: HELD → BOOKED                                             │
│  ✓ Payment record created                                           │
│  Response: { status: "CONFIRMED", confirmedAt: "..." }              │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  BACKGROUND: Cleanup jobs (every minute)                            │
│  ─────────────────────────────────────────────────────────────────  │
│  • Releases expired seat holds (heldUntil < now)                    │
│  • Expires PENDING bookings past their expiresAt                    │
│  • Frees seats for other users to book                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Race Condition Scenarios Handled

| Scenario | Protection | Result |
|----------|------------|--------|
| Two users click same seat simultaneously | Pessimistic lock + WHERE clause | Only one succeeds |
| User's hold expires during payment | Booking expiry check | Payment rejected |
| Network retry during confirmation | Optimistic lock version check | Duplicate rejected |
| User tries to hold 7+ seats | Max seats validation | Request rejected |

---

## 💻 Frontend Features

### Pages

| Page | Route | Auth | Description |
|------|-------|------|-------------|
| **Home** | `/` | ❌ | Landing page with featured events |
| **Events** | `/events` | ❌ | Browsable event list with filters |
| **Event Details** | `/events/:id` | ❌ | Event info, venue, reviews |
| **Booking** | `/booking/:eventId` | ✅ | Interactive seat selection |
| **Payment** | `/payment/:bookingId` | ✅ | Payment form and confirmation |
| **My Bookings** | `/my-bookings` | ✅ | User's booking history |
| **Profile** | `/profile` | ✅ | User profile management |
| **Login** | `/login` | ❌ | Authentication |
| **Register** | `/register` | ❌ | New user registration |
| **Organizer Dashboard** | `/organizer/dashboard` | ✅ Organizer | Event management |
| **Create Event** | `/organizer/events/create` | ✅ Organizer | New event form |
| **Edit Event** | `/organizer/events/:id/edit` | ✅ Organizer | Edit existing event |

### Key Components

| Component | Description |
|-----------|-------------|
| **SeatGrid** | Interactive seat map with real-time status updates |
| **EventFilters** | Category, date, price, and city filtering |
| **Navbar** | Navigation with auth state and avatar dropdown |
| **BookingSummary** | Price breakdown with taxes |
| **EventCard** | Event preview in listings |

### State Management

- **AuthContext**: Global authentication state using React Context
- **Local State**: Component-level state with useState/useEffect
- **URL State**: Filters and pagination via query parameters

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher
- **npm** or **yarn**

### Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/booking-platform.git
cd booking-platform
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials (see below)

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed the database
npm run db:seed

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
echo "VITE_API_URL=http://localhost:3001" > .env

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/bookingplatform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Server
PORT=3001
NODE_ENV=development

# Seat Hold Configuration
SEAT_HOLD_TTL=600          # 10 minutes in seconds
MAX_SEATS_PER_USER=6

# CORS
CORS_ORIGIN=http://localhost:5173

# Payment Gateway (Optional)
PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Redis (Optional - for distributed deployments)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001
```

---

## 📜 Scripts

### Backend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (nodemon) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema changes (dev only) |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio GUI |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 🔧 Deployment

### Backend (Render, Railway, etc.)

1. Set environment variables in your hosting platform
2. Build command: `npm run build`
3. Start command: `npm start`
4. Ensure PostgreSQL database is accessible

### Frontend (Vercel, Netlify, etc.)

1. Set `VITE_API_URL` to your backend URL
2. Build command: `npm run build`
3. Output directory: `dist`
4. Configure `vercel.json` for SPA routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

Built with ❤️ by Sahil Agarwal

---

## 🙏 Acknowledgments

- [Prisma](https://www.prisma.io/) for the amazing ORM
- [React](https://react.dev/) for the UI framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for the blazing fast build tool
