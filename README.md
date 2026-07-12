# DriveElite: Full-Stack Dealership Inventory System

DriveElite is an interview-ready, production-quality full-stack Car Dealership Inventory System. Built following **SOLID Design Principles**, **Clean Architecture**, and **Test-Driven Development (TDD)**, it features a secure role-based inventory management dashboard, atomic stock purchase transactions, advanced query search capabilities, and a responsive glassmorphic UI.

---

## 🛠️ Tech Stack

### Backend
*   **Core**: Node.js, TypeScript, Express.js
*   **Database & ORM**: PostgreSQL, Prisma ORM
*   **Authentication**: JWT (Short-lived body `accessToken`, Secure `HttpOnly` cookie `refreshToken`)
*   **Security**: bcrypt (Password hashing), Helmet (Secure headers), Express Rate Limit
*   **Validation**: Zod Schemas
*   **Testing**: Jest + Supertest (Unit & Integration tests)
*   **Development Tools**: ESLint, Prettier, Winston Logger

### Frontend
*   **Core**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **State & Query Management**: TanStack Query (React Query) v5, React Context API
*   **Routing**: React Router v6 (Protected & Guest Route Guards)
*   **Forms**: React Hook Form, Zod validation resolver
*   **Animations**: Framer Motion
*   **Testing**: Vitest, React Testing Library, jsdom
*   **Icons**: Lucide React

---

## 📐 System Architecture

### Clean Architecture Layers (Backend)
```text
┌────────────────────────────────────────────────────────┐
│                        HTTP Route                      │
├────────────────────────────────────────────────────────┤
│                     Zod Validation                     │
├────────────────────────────────────────────────────────┤
│                       Controller                       │
├────────────────────────────────────────────────────────┤
│                      Service Layer                     │
├────────────────────────────────────────────────────────┤
│                  Repository Interface                  │
├────────────────────────────────────────────────────────┤
│            Concrete Database Repository (Prisma)       │
└────────────────────────────────────────────────────────┘
```
*   **Repository Pattern**: All database calls are decoupled behind repository interfaces (`IVehicleRepository`, `IUserRepository`). This abstraction allows business logic testing without spawning live database connections.
*   **Centralized Error Handling**: Central middleware catches typed HTTP exceptions (`NotFoundError`, `BadRequestError`, `UnauthorizedError`) and returns clean, uniform JSON error structures.

### Client-Side State Flow (Frontend)
*   **Axios Interceptor Retry Queue**: Automatically injects bearer tokens into HTTP headers. Upon receiving a `401 Unauthorized` token expiration error, the client blocks outgoing traffic, initiates a silent `/auth/refresh` request, grabs a new token, and replays all queued network requests.
*   **Optimistic Updates**: For vehicle purchases, React Query optimistically decrements available stock counts in the UI cache before the database responds. If a transaction error occurs, it rolls back the cache and shows a Toast notification.

---

## 📁 Folder Structure

```text
Car Dealership/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # DB definitions and constraints
│   │   └── seed.ts            # Development data seed script
│   ├── src/
│   │   ├── config/            # Environment and DI containers
│   │   ├── controllers/       # HTTP parameter parsing
│   │   ├── middleware/        # JWT auth validation & rate limiters
│   │   ├── repositories/      # Decoupled repository patterns
│   │   ├── routes/            # Express route groups
│   │   ├── services/          # Core business validation layers
│   │   ├── utils/             # Errors and JWT helper libraries
│   │   └── app.ts             # Express server setup
│   └── tests/
│       ├── integration/       # API integration endpoint tests
│       └── unit/              # Service class unit tests
└── frontend/
    ├── src/
    │   ├── components/        # Reusable UI library (Button, Modal, Input)
    │   ├── context/           # Auth and Toast context providers
    │   ├── features/          # LoginPage & RegisterPage forms
    │   ├── layouts/           # Root and Admin Dashboard templates
    │   ├── pages/             # HomePage, Catalog Search, details specs
    │   ├── routes/            # Private and Guest Route Guards
    │   └── services/          # Axios interceptors config
    ├── vite.config.ts         # Vite build configuration
    └── vitest.config.ts       # Vitest setup configurations
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://db_user:db_password@db_host:5432/dealership_db?sslmode=require"
JWT_ACCESS_SECRET="cryptographically_strong_random_jwt_access_secret_key"
JWT_REFRESH_SECRET="cryptographically_strong_random_jwt_refresh_secret_key"
CORS_ORIGIN="https://your-frontend-domain.vercel.app"
```

### Frontend (`frontend/.env`)
```ini
VITE_API_BASE_URL="https://your-backend-service.onrender.com/api"
```

---

## 🚀 Installation & Running Local Servers

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL running locally or on a cloud service

### Database Setup
1.  **Configure `.env`**: Add your PostgreSQL database connection string to `backend/.env`.
2.  **Run Migrations**: Create tables and constraints:
    ```bash
    cd backend
    npx prisma migrate dev
    ```
3.  **Seed Database**: Seed default `ADMIN` / `USER` accounts and initial vehicle listings:
    ```bash
    npx prisma db seed
    ```

### Running Backend
```bash
cd backend
npm install
npm run dev
```
The server will boot on `http://localhost:5000` with the `/health` check live.

### Running Frontend
```bash
cd frontend
npm install
npm run dev
```
The site runs locally on `http://localhost:5173` with local API requests proxied to port `5000`.

---

## 🧪 Running Tests

### Backend Tests (Jest)
Runs unit tests for services and integration endpoint tests:
```bash
cd backend
npm test
```
To check test coverage reports:
```bash
npm run test:coverage
```

### Frontend Tests (Vitest + React Testing Library)
Runs component rendering tests, accessibility link checks, and form validations:
```bash
cd frontend
npm test
```

---

## 🌐 API Documentation

### Authentication Routes

#### POST `/api/auth/register`
Creates a new user profile.
*   **Body (JSON)**:
    ```json
    {
      "email": "john@dealership.com",
      "password": "password123",
      "name": "John Doe"
    }
    ```
*   **Response (201)**:
    ```json
    {
      "status": "success",
      "data": {
        "user": { "id": "uuid-1", "email": "john@dealership.com", "name": "John Doe", "role": "USER" }
      }
    }
    ```

#### POST `/api/auth/login`
Authenticates credentials and returns a short-lived bearer token while setting a secure HttpOnly refresh cookie.
*   **Body (JSON)**:
    ```json
    {
      "email": "john@dealership.com",
      "password": "password123"
    }
    ```
*   **Response (200)**:
    ```json
    {
      "status": "success",
      "data": {
        "accessToken": "ey...",
        "user": { "id": "uuid-1", "email": "john@dealership.com", "name": "John Doe", "role": "USER" }
      }
    }
    ```

---

### Vehicle Inventory Routes

#### GET `/api/vehicles/search`
Public endpoint to query the catalog with fuzzy search parameters.
*   **Query Parameters**: `make`, `model`, `category`, `minPrice`, `maxPrice`, `page`, `limit`
*   **Response (200)**:
    ```json
    {
      "status": "success",
      "data": {
        "vehicles": [
          { "id": "v-1", "make": "Tesla", "model": "Model Y", "category": "Electric SUV", "price": 49990, "quantity": 5 }
        ],
        "total": 1
      }
    }
    ```

#### POST `/api/vehicles/:id/purchase`
Decrements vehicle quantity by 1. Throws `400 Bad Request` if quantity is zero.
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Response (200)**:
    ```json
    {
      "status": "success",
      "data": {
        "vehicle": { "id": "v-1", "make": "Tesla", "model": "Model Y", "quantity": 4 }
      }
    }
    ```

#### POST `/api/vehicles/:id/restock`
Increments vehicle quantity by the specified amount.
*   **Headers**: `Authorization: Bearer <accessToken>` (Admin only)
*   **Body (JSON)**:
    ```json
    { "quantity": 10 }
    ```
*   **Response (200)**:
    ```json
    {
      "status": "success",
      "data": {
        "vehicle": { "id": "v-1", "make": "Tesla", "model": "Model Y", "quantity": 14 }
      }
    }
    ```

---

## 📈 Git Commit History Examples (TDD Pattern)

Following Test-Driven Development (TDD), tests are written first (RED state) before matching implementation logic is written to pass the test cases (GREEN state):

```text
commit 8d4b321a5cfbc9d8e78a22bc13d5a5a1f654bce7
Author: Developer <dev@dealership.com>
Date:   Sun Jul 12 01:10:00 2026 +0530

    feat(backend): implement vehicle purchase endpoints (GREEN)
    
    - Implemented vehicle purchase route mapping
    - Added decrement stock quantity logic inside VehicleService
    - Created VEHICLE_PURCHASED audit log registry
    
    Co-authored-by: ChatGPT <AI@users.noreply.github.com>

commit f5e4d3c2b1a09f8e7d6c5b4a3a2a1a0f9e8d7c6b
Author: Developer <dev@dealership.com>
Date:   Sun Jul 12 00:45:00 2026 +0530

    test(backend): write vehicle purchase unit & integration tests (RED)
    
    - Added purchaseVehicle unit tests in vehicle-service.test.ts
    - Added POST /api/vehicles/:id/purchase integration tests
    - Outlined out-of-stock and authorization check assertions
    
    Co-authored-by: ChatGPT <AI@users.noreply.github.com>

commit a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b
Author: Developer <dev@dealership.com>
Date:   Sun Jul 12 00:15:00 2026 +0530

    feat(frontend): implement optimistic updates for purchase mutation (GREEN)
    
    - Added onMutate React Query rollback snapshot logic
    - Linked toast notifications for purchase feedback
    - Invalidate related queries on settlement
    
    Co-authored-by: ChatGPT <AI@users.noreply.github.com>
```

---

## 🤖 My AI Usage

### AI Tools Used
*   **ChatGPT / Antigravity AI Agent**: Utilized for architecture layout suggestions, mock database configurations, React Testing Library query adjustments, and writing unit and integration tests.

### How AI Was Used
1.  **Test-Driven Development**: The AI helped write unit and integration test blocks first (verifying inputs validations, mock repository returns, and expected error exceptions) before generating the matching business service methods.
2.  **Typescript Strict Boundaries**: Helped resolve compiler errors involving unused parameters in Express middleware signatures and typing conflicts with Framer Motion custom props in our shared component library.
3.  **Network Architecture**: Guided the implementation of the Axios interceptor retry queue to handle silent token refresh cycles seamlessly.

### Reflection on AI Usage
AI pair-programming allowed me to focus on the overall system architecture, Clean Architecture boundaries, and SOLID design patterns while outsourcing boilerplate configurations (like environment setups, test scaffolding, and styling layouts). By verifying every generated code block against strict TypeScript compiler parameters and test runs, I ensured code quality while significantly reducing development cycles.

---

## 🔮 Future Improvements
*   **Subdomain Cookie Sharing**: Move backend and frontend to unified top-level subdomains to enable strict SameSite session cookies.
*   **Image Upload Pipeline**: Integrate AWS S3 or Cloudinary SDKs to support image uploads for vehicle inventory listings.
*   **Soft Deletes**: Update the schema to mark vehicles as deleted rather than completely purging records to preserve historical transaction audit logs.
