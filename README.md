# NILEV 🌿

> **NILEV** is a private, production-ready, two-person habit, goal, activity, and companion tracking platform engineered exclusively for couples.

---

## 🏛️ System Architecture

NILEV employs a decoupled, production-oriented client-server architecture:

```
nilev/
├── backend/               # Spring Boot 3 + Java 21 REST API
│   ├── .mvn/              # Maven wrapper configuration
│   ├── src/main/java/     # Application source (Layered architecture)
│   ├── src/main/resources/# Spring config (application.yml)
│   ├── pom.xml            # Maven project descriptor
│   └── mvnw / mvnw.cmd    # Cross-platform Maven wrappers
│
├── frontend/              # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/           # Axios HTTP client & API endpoint definitions
│   │   ├── assets/        # Static assets
│   │   ├── components/    # Modular component library
│   │   │   ├── ui/        # shadcn/ui style atomic primitives
│   │   │   ├── layout/    # Header, Sidebar, Footer
│   │   │   ├── dashboard/ # Dashboard metric widgets
│   │   │   ├── habits/    # Habit cards & check-in UI
│   │   │   ├── goals/     # Goal progress indicators
│   │   │   ├── activity/  # Activity timeline components
│   │   │   ├── companion/ # Virtual companion avatar card
│   │   │   └── surprises/ # Locked surprise cards
│   │   ├── constants/     # Routes, API URLs, Storage keys
│   │   ├── hooks/         # Custom React hooks (useAuth)
│   │   ├── layouts/       # RootLayout, DashboardLayout, AuthLayout
│   │   ├── pages/         # Route views (Home, Login, Register, Dashboard)
│   │   ├── routes/        # Router configuration & ProtectedRoute
│   │   ├── services/      # Business & API client services
│   │   ├── types/         # Strongly-typed domain & API contracts
│   │   └── utils/         # Tailwind merge (cn) & utilities
│   ├── vite.config.ts     # Vite configuration with Tailwind & path alias
│   └── package.json       # Frontend dependencies
│
└── README.md              # Project documentation & run guide
```

---

## 🛠️ Technology Stack

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3.3.4
- **Web**: Spring Web (Spring MVC REST API)
- **Data Persistence**: Spring Data JPA & Hibernate
- **Database**: PostgreSQL
- **Security**: Spring Security 6 (Stateless JWT authentication)
- **JWT**: `io.jsonwebtoken` (JJWT 0.12.6)
- **Validation**: Jakarta Bean Validation (`spring-boot-starter-validation`)
- **Productivity**: Project Lombok
- **Build Tool**: Maven 3.9+ (includes self-bootstrapping `mvnw` / `mvnw.cmd`)

### Frontend
- **Framework**: React 19 + TypeScript
- **Tooling / Bundler**: Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Design System / UI**: shadcn/ui design patterns (`class-variance-authority`, `clsx`, `tailwind-merge`)
- **Icons**: Lucide React
- **Visualizations**: Recharts
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios with Bearer token interceptor

---

## ⚙️ Environment Configuration

### Backend Environment Variables (`backend/.env` / `backend/.env.example`)

| Variable | Description | Default (Local Dev) |
|---|---|---|
| `DATABASE_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/nilev` |
| `DATABASE_USERNAME` | PostgreSQL database user | `postgres` |
| `DATABASE_PASSWORD` | PostgreSQL database password | `postgres` |
| `JWT_SECRET` | 256-bit+ HMAC-SHA secret key | *(Preset default in application.yml)* |
| `PORT` | Spring Boot HTTP port | `8080` |
| `CORS_ALLOWED_ORIGINS`| Permitted CORS origin URLs | `http://localhost:5173,http://localhost:3000` |

### Frontend Environment Variables (`frontend/.env` / `frontend/.env.example`)

| Variable | Description | Default (Local Dev) |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend REST API | `http://localhost:8080/api/v1` |

---

## 🚀 Running the Project Locally

### Prerequisites
1. **Java Development Kit (JDK)**: Version 21 or higher installed (`java -version`).
2. **Node.js**: Version 18 or higher with npm (`node -v`, `npm -v`).
3. **PostgreSQL**: PostgreSQL 14+ instance running with a database named `nilev`:
   ```sql
   CREATE DATABASE nilev;
   ```

---

### 1. Running the Backend

Open a terminal in the `backend/` directory:

```bash
cd backend
```

#### Copy environment variables (optional for overrides):
```bash
cp .env.example .env
```

#### Run with Maven Wrapper:

**On Windows (PowerShell / Command Prompt):**
```powershell
.\mvnw.cmd spring-boot:run
```

**On Linux / macOS:**
```bash
chmod +x ./mvnw
./mvnw spring-boot:run
```

The backend server will start on `http://localhost:8080`.

#### Verify Backend Health:
```bash
curl http://localhost:8080/api/v1/auth/ping
```
Expected response:
```json
{
  "success": true,
  "message": "NILEV Auth Service is active",
  "data": "NILEV Auth Service is active",
  "timestamp": "2026-09-27T12:00:00Z"
}
```

---

### 2. Running the Frontend

Open a second terminal in the `frontend/` directory:

```bash
cd frontend
```

#### Install dependencies (if not already installed):
```bash
npm install
```

#### Start the Vite development server:
```bash
npm run dev
```

The frontend will run at `http://localhost:5173`. Open this URL in your web browser.

---

## 📐 Clean Layered Architecture Pattern

The backend strictly adheres to clean layered separation:

```
[ HTTP Request ]
       ↓
Controller          (@RestController, consumes & produces DTOs)
       ↓
Service             (Interfaces & @Service implementations with @Transactional)
       ↓
Repository          (@Repository Spring Data JPA interfaces)
       ↓
Entity              (@Entity JPA entities extending BaseEntity)
```

- **DTO Encapsulation**: Domain JPA entities are **never** exposed across API boundaries.
- **Global Error Handling**: `@RestControllerAdvice` traps exceptions (`MethodArgumentNotValidException`, `NilevApiException`, `ResourceNotFoundException`, etc.) and formats them into a standardized `ApiErrorResponse` envelope.
- **Unified Success Envelopes**: All endpoints return `ApiResponse<T>` with timestamped status and typed payloads.

---

## 📦 Backend Domain Modules Directory

Each domain package is structured with distinct layered boundaries:

| Package | Responsibility |
|---|---|
| `com.nilev.config` | CORS, JPA Auditing, and Spring configuration |
| `com.nilev.security` | JWT token provider, filters, and Spring Security chain |
| `com.nilev.auth` | Registration, login, and token issuance |
| `com.nilev.user` | User account lifecycle and profile queries |
| `com.nilev.partner` | Partner pairing, invitation codes, and connection state |
| `com.nilev.habit` | Individual and shared habit tracking & streaks |
| `com.nilev.activity` | Couple activity logging, memories, and shared reflections |
| `com.nilev.goal` | Milestones, target progress, and mutual goals |
| `com.nilev.companion` | Virtual companion avatar state & emotional feedback |
| `com.nilev.surprise` | Timed-release love notes and couple surprises |
| `com.nilev.notification`| Real-time alerts and partner event reminders |
| `com.nilev.analytics` | Aggregated insights, metrics, and streak statistics |
| `com.nilev.common` | BaseEntity, ApiResponse, and ApiErrorResponse |
| `com.nilev.exception` | GlobalExceptionHandler and domain exceptions |
