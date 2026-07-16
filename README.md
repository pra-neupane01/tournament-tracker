# Esports Tournament Management System

A comprehensive, production-ready platform designed to help colleges, schools, and independent organizers manage esports tournaments for games like Free Fire, PUBG Mobile, eFootball, Mobile Legends, and more.

## Technology Stack

**Backend:**
- Java 21 / Spring Boot 4.1.0
- Spring Web, Spring Data JPA, Spring Security
- PostgreSQL & Flyway (Schema evolution)
- Spring WebSocket & Spring Data Redis
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
Create a local database named `esports_management`.
```bash
# Example psql command
psql -U postgres -c "CREATE DATABASE esports_management;"
```

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

## Current Implemented Scope (Chunk 1)
- Clean project initialization and environment setup.
- Backend architectural foundation (common entities, generic API responses, global exception handlers, pagination, Flyway integration).
- Baseline security configurations and dynamic CORS logic.
- Complete frontend scaffolding (React Router, TanStack Query, Tailwind Dark Theme).
- Responsive UI layouts (Header, Sidebar, Dashboard) and initial visual pages (Landing, Login, 404).

## Planned Next Feature (Chunk 2)
- Implementation of the comprehensive Authentication & Authorization system.
- JWT security filter chain, token generation, refresh tokens, and domain-specific roles (Super Admin, Organizer, Referee, Player).
