# AI Usage Report

## 1. AI Tools Used
* **Tool:** Antigravity AI Assistant (Google DeepMind Gemini 3.8 Flash)
* **Areas of Usage:**
  * Architecture formulation (Clean Architecture layering with .NET 8 Web API).
  * Concurrency strategy design (PostgreSQL pessimistic row locking vs advisory locking).
  * Boilerplate scaffolding for DTOs, controllers, EF Core persistence configuration, and test fixtures.

## 2. Observations & Error Corrections
* **Issue 1 (SDK & Environment Availability):**
  * *AI Mistake / Environmental Challenge:* Initial package installation attempt via system winget failed due to installer privilege restrictions.
  * *Correction:* Identified that the official Microsoft user-level script (`dotnet-install.ps1`) could install the full .NET 8 SDK directly into the user profile without requiring administrative elevation, and permanently configured the environment PATH.
* **Issue 2 (Configuration Binder Dependency):**
  * *AI Mistake:* Code originally called `configuration.GetValue<int?>("HOLD_DURATION_SECONDS")` in the Application layer, which required the `Microsoft.Extensions.Configuration.Binder` package not present in the abstractions package.
  * *Correction:* Refactored to direct indexer access `configuration["HOLD_DURATION_SECONDS"]` and explicit `int.TryParse`, eliminating unnecessary third-party package dependencies while increasing performance and resilience.
* **Issue 3 (Database Provider Differences in Tests):**
  * *AI Mistake:* Code originally referenced `Database.IsSqlite()` directly in Infrastructure, which is only present when the SQLite EF provider package is referenced.
  * *Correction:* Replaced with clean abstraction check handling PostgreSQL in production and non-PostgreSQL (SQLite / InMemory) gracefully for unit and integration test fixtures.
