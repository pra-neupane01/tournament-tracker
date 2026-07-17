# Esports Tournament Management System

A comprehensive, production-ready platform designed to help colleges, schools, and independent organizers manage esports tournaments for games like Free Fire, PUBG Mobile, eFootball, Mobile Legends, and more.

## Technology Stack

**Backend:**
- Java 21 / Spring Boot 4.1.0
- Spring Web, Spring Data JPA, Spring Security
- PostgreSQL with Flyway migrations and Hibernate-managed compatibility updates for existing local databases
- Spring WebSocket
- Swagger / Springdoc OpenAPI

**Frontend:**
- React (TypeScript) / Vite
- React Router & TanStack Query
- Tailwind CSS (v4)
- Zustand (State management)
- Axios & React Hook Form + Zod

## Root Folder Structure

```
esports-management-system/
├── backend/          # Spring Boot API and persistence layer
├── frontend/         # React/Vite SPA and UI components
└── README.md         # Project documentation
```

## Prerequisites
- **Java 21**
- **Node.js 20+**
- **PostgreSQL 15+**
- **Maven** (optional, uses wrapper `mvnw`)

---

## Local Development Setup

### 1. Database Configuration
Ensure PostgreSQL is running on your machine.
Create a local database named `esports_management_app`.
```bash
# Example psql command
psql -U postgres -c "CREATE DATABASE esports_management_app;"
```

Flyway applies versioned migrations on startup. Existing development databases can be adopted with
`FLYWAY_ENABLED=true` and `spring.jpa.hibernate.ddl-auto=update`; production deployments should use
`ddl-auto=validate` after applying migrations.

### 2. Backend Setup
The backend uses standard environment variables that fall back to sensible defaults. You can override them via the `.env` file.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create your `.env` from the template (if not already copied):
   ```bash
   cp .env.example .env
   ```
3. Run the Spring Boot application using Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```

### 3. Frontend Setup
The frontend securely connects to the backend API via environment configurations.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Create your `.env` from the template:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## Expected Local URLs

Once both servers are running, access the application and APIs via:

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API Base URL:** `http://localhost:8080/api/v1`
- **Health Check:** [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)
- **Swagger Documentation:** [http://localhost:8080/api/v1/swagger-ui/index.html](http://localhost:8080/api/v1/swagger-ui/index.html)
- **Actuator Health:** [http://localhost:8080/api/v1/actuator/health](http://localhost:8080/api/v1/actuator/health)

---

## Implemented Scope

- JWT authentication, rotating refresh tokens, role authorization, and account administration.
- Email verification with expiring hashed tokens, resend support, and JavaMailSender delivery.
- Organizations, educational institutions, memberships, games, teams, and roster management.
- Tournament CRUD, lifecycle rules, dynamic registration forms, application review, and roster snapshots.
- Stages, groups, fixture generation, scheduling, protected rooms, and participant check-in.
- Scoring rules, result review, leaderboards, qualification, penalties, and disputes.
- Persistent notifications with authenticated STOMP/WebSocket delivery and organizer announcements.
- File storage, CSV reports, verifiable PDF certificates, and public certificate verification.
- Isolated unit, integration, and complete lifecycle tests.
- A complete React management client for every backend workflow, with protected routing, typed API services, automatic token refresh, live notifications, responsive navigation, and lazy-loaded feature routes.

Run `npm run check` inside `frontend` and `mvnw test` inside `backend` for the full verification gates.
