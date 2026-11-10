# ASSUMPTIONS & DESIGN DECISIONS

This document clarifies design choices and assumptions made to satisfy and exceed the requirements specified in the take-home assignment.

---

## 1. High-Concurrency & Multi-Instance Zero Overbooking (Bonus Requirement §2.6)
* **Requirement:** Under no circumstance can `held + confirmed` exceed `totalSeats` for a class, even when multiple backend instances run simultaneously on different ports against the same database.
* **Implementation & Design:**
  * In-memory synchronization primitives (`lock`, `SemaphoreSlim`) only work within a single process and fail in multi-instance/distributed setups.
  * We anchor concurrency control at the **PostgreSQL Database level** using **Pessimistic Row-Level Locking (`SELECT id FROM classes WHERE id = @classId FOR UPDATE`)** inside an ACID transaction (`READ COMMITTED` / `SERIALIZABLE`).
  * When concurrent requests arrive across any number of backend instances, PostgreSQL locks the specific class row. Only one transaction proceeds to evaluate current capacity (`held + confirmed`) and insert the hold. Subsequent transactions wait and re-evaluate the updated count. If full, they safely roll back and return **`409 Conflict`**.
  * This guarantees **Zero Overbooking** across single or multiple backend nodes.

---

## 2. Automatic Seat Expiration (Rule 2.5)
* **Requirement:** Holds expire automatically based on `HOLD_DURATION_SECONDS` (default: 600s) without requiring any external or manual API calls.
* **Implementation & Design:**
  * **Lazy Evaluation (Query-Time):** All seat count queries and hold eligibility checks dynamically filter for `status = 'HELD' AND expires_at > NOW() (UTC)`. When a hold expires, its seat is immediately and automatically available to other applicants within the exact millisecond of expiration.
  * **Eager Sweeper Worker (`IHostedService`):** A lightweight background service (`HoldExpirationWorker`) runs every 5 seconds to update expired rows in the database to `status = 'EXPIRED'`, ensuring persistence consistency and clean query plans.

---

## 3. Student Identification & Constraints (Rule 2.5)
* **Requirement:** Student identity is provided via the `X-Student-Id` header, representing a 17-digit birth registration number.
* **Assumptions & Validation:**
  * The header value must be exactly 17 numeric digits (`^[0-9]{17}$`). If missing, non-numeric, or incorrect length, the API returns **`400 Bad Request`**.
  * **Single Active Application Rule:** A student cannot hold more than one active hold (`HELD` and not expired) or confirmed seat (`CONFIRMED`) in the same class at the same time. Violations return **`409 Conflict`**.

---

## 4. Idempotent Confirmation (Rule 2.5)
* **Requirement:** Multiple confirmation requests for the same hold must not increase `confirmedSeats` more than once.
* **Implementation:** If `/holds/{holdId}/confirm` is called on a hold that is already `CONFIRMED`, the server immediately returns **`200 OK`** with `status: CONFIRMED` without modifying seat counts.
* Only the student who owns the hold can confirm it (checked via `X-Student-Id`). Attempts by other students return **`403 Forbidden`**.

---

## 5. Cancellation Behavior
* Calling `DELETE /holds/{holdId}` transitions an unconfirmed hold to `CANCELLED` and returns **`204 No Content`**, instantly freeing the held seat.
* A confirmed admission cannot be deleted via the student hold cancellation endpoint; doing so returns **`400 Bad Request`** to preserve enrollment integrity.

---

## 6. Timezone Handling
* All timestamps (`createdAt`, `expiresAt`, `confirmedAt`) are strictly stored and returned in **UTC (ISO 8601)** format (e.g., `2026-11-01T04:10:00Z`).
