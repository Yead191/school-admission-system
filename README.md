# School Admission System (অনলাইন ভর্তি সিস্টেম)

A production-grade, high-concurrency seat reservation system built with **.NET 8 Web API**, **PostgreSQL**, **React 18+ (Vite + TypeScript + Tailwind CSS)**, and **Docker**.

Implemented for the **Assistant Software Engineer** recruitment assignment at **Onnorokom Projukti Limited**.

---

## 🚀 Key Highlights & Architecture

* **Zero Overbooking Guarantee (Strict FCFS):** Under heavy concurrent traffic, `held + confirmed <= totalSeats` is strictly guaranteed via **PostgreSQL Row-Level Pessimistic Locking (`SELECT FOR UPDATE`)** inside ACID transactions.
* **Multi-Instance Distributed Concurrency (Bonus §২.৬):** Even if multiple backend processes run simultaneously on separate ports or containers against the same PostgreSQL database, zero overbooking is preserved.
* **Auto-Expiration without API calls (Rule ২.৫):**
  * **Dynamic Sub-millisecond Evaluation:** Every query checks `expires_at > UTC_NOW()`, releasing seats instantaneously.
  * **Background Sweeper:** An `IHostedService` periodically marks expired holds in the database.
* **Idempotency (Rule ২.৫):** Multiple confirmation calls on the same hold return `200 OK` without incrementing confirmed seats again.
* **Enterprise Frontend:** Modular component architecture with **RTK Query**, real-time polling every 3s, client-side zero-reload expiration countdown, and friendly Bengali/English error alerts.

---

## 🛠 Tech Stack

* **Backend:** C# (.NET 8 Web API, Entity Framework Core 8, Npgsql)
* **Database:** PostgreSQL 16
* **Frontend:** React 18+ / React 19, TypeScript, Vite, Redux Toolkit (RTK Query), Tailwind CSS, Lucide Icons
* **Testing:** xUnit (Backend Integration & Concurrency Stress Tests), Vitest + React Testing Library (Frontend)
* **DevOps:** Docker, Docker Compose, Nginx

---

## 📦 How to Run with Docker (Recommended)

Simply run the following command from the repository root:

```bash
docker compose up --build
```

That's it! Docker will automatically pull PostgreSQL, compile and launch the .NET 8 backend, bundle the React frontend, and serve everything.

### 🌐 Access URLs:
* **Frontend UI:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:8080](http://localhost:8080)
* **Swagger / OpenAPI Documentation:** [http://localhost:8080/swagger](http://localhost:8080/swagger)
* **Health Check:** [http://localhost:8080/health](http://localhost:8080/health)

---

## 🧪 How to Run Automated Tests

### 1. Backend Tests (Unit, Integration & High-Concurrency Stress Test)
The backend test suite includes an extreme concurrency stress test (30 simultaneous clients competing for 5 limited seats):

```bash
cd backend
dotnet test
```

Expected result:
```text
Passed!  - Failed: 0, Passed: 11, Skipped: 0, Total: 11, Duration: 1 s
```

### 2. Frontend Tests (Unit & Component Tests)
```bash
cd frontend
npm test
```

Expected result:
```text
 Test Files  3 passed (3)
      Tests  11 passed (11)
```

---

## ⚙️ Environment Variables

| Variable | Service | Default Value | Description |
|---|---|---|---|
| `HOLD_DURATION_SECONDS` | Backend | `600` | Duration (in seconds) a seat remains held before expiring. |
| `ConnectionStrings__DefaultConnection` | Backend | `Host=postgres;...` | PostgreSQL connection string. |
| `ASPNETCORE_URLS` | Backend | `http://+:8080` | URL and port binding for Kestrel. |
| `VITE_API_BASE_URL` | Frontend | `http://localhost:8080` | Backend API base URL consumed by Vite. |

---

## 📂 Project Structure

```
.
├── docker-compose.yml              # Root Docker Compose
├── README.md                       # Documentation
├── ASSUMPTIONS.md                  # Design rationale & multi-instance concurrency bonus
├── AI_USAGE.md                     # AI usage and error corrections
├── backend/
│   ├── Dockerfile                  # Multi-stage .NET 8 build
│   ├── SchoolAdmission.sln
│   ├── src/
│   │   ├── SchoolAdmission.Domain/          # Core Entities, Enums, Domain Exceptions
│   │   ├── SchoolAdmission.Application/     # DTOs, Business Services, Validators
│   │   ├── SchoolAdmission.Infrastructure/  # EF Core, PostgreSQL Locking, Background Sweeper
│   │   └── SchoolAdmission.Api/             # Controllers, Middlewares, Program.cs
│   └── tests/
│       └── SchoolAdmission.Tests/           # Unit, Integration & Concurrency Stress Tests
└── frontend/
    ├── Dockerfile                  # Multi-stage Node + Nginx build
    ├── nginx.conf                  # Production SPA routing
    └── src/
        ├── api/                    # baseApi & injected feature APIs (classesApi, holdsApi)
        ├── components/
        │   ├── common/             # Header, StudentIdBar, StatusBadge, ErrorMessage, Modal
        │   ├── classes/            # ClassCard, ClassList, CreateClassModal
        │   └── holds/              # HoldCard, CountdownTimer, MyHoldsList, HoldDetailModal
        ├── pages/                  # HomePage dashboard
        ├── store/                  # Redux Toolkit store & authSlice
        ├── test/                   # Vitest automated tests
        └── types/                  # Shared TypeScript interfaces
```

---

## 📄 License & Confidentiality
Developed for the recruitment evaluation of **Onnorokom Projukti Limited**.

