# sk-prephub — Backend Roadmap (FastAPI)
Purpose
-------
This document is a concise developer-facing roadmap for the FastAPI backend that complements the React + Tailwind frontend in `frontend/`.

Goals
-----
- Provide role-based APIs for Students and Owners, plus Admin utilities.
- Core domains: Listings (Coaching, Hostels/PGs, Tiffin, Libraries), Bookings, Reviews/Ratings, Users, Storage (Supabase), and Analytics.
- Secure authentication using Supabase Auth JWT verification and synced user profiles.

High-level architecture
-----------------------
- FastAPI application (ASGI) with dependency injection for DB and auth.
- Postgres (Supabase) for persistent data. Use migrations in `supabase/migrations/`.
- Supabase Auth for identity; backend verifies JWTs and maps/syncs profiles as needed.
- Supabase Storage for file uploads; backend issues signed URLs where appropriate.
- Small, focused API modules to keep routes and services tiny, testable, and composable.

Repository layout (recommended)
------------------------------
backend/
- app/
	- __init__.py
	- main.py                # FastAPI app + include_router calls
	- config.py              # env loading (pydantic BaseSettings)
	- deps.py                # DI helpers (db, auth, current_user)
	- api/
		- v1/
			- auth.py            # lightweight sync endpoints (if needed)
			- users.py           # user CRUD/profile
			- listings/          # broken into tiny modules
				- create.py
				- read.py
				- update.py
				- delete.py
				- search.py
			- bookings/
				- create.py
				- manage.py        # accept/decline, owner actions
				- list.py
			- reviews.py
			- storage.py         # signed upload URLs, proxies
			- analytics.py
			- admin.py
	- db/
		- base.py              # DB engine and sessionlocal
		- models.py
		- crud/                # tiny CRUD modules per model
	- schemas/               # pydantic request/response schemas
	- services/              # business logic (payments, notifications)
	- tests/                 # unit + integration tests
- requirements.txt
- roadmap.md

Environment variables (suggested)
--------------------------------
- DATABASE_URL            # postgres connection (Supabase)
- SUPABASE_URL
- SUPABASE_SERVICE_KEY    # for privileged actions (if used carefully)
- SUPABASE_ANON_KEY       # for client usage (frontend uses this)
- JWT_AUDIENCE            # expected JWT audience from Supabase
- JWT_ISSUER              # expected issuer
- SECRET_KEY              # application secret (optional)
- SENTRY_DSN              # optional error reporting
- REDIS_URL               # optional caching/queues

Migrations
----------
- Use the `supabase/migrations/` directory already present. Keep schema changes small and versioned. Use psql or supabase CLI to apply.

Testing & CI
------------
- Unit tests for services and CRUD functions. Keep tests fast using a test DB or transaction rollback fixtures.
- Integration tests for critical endpoints (auth flow, listing create+search, booking lifecycle).
- GitHub Actions: lint, typecheck (mypy/ruff/flake), run tests, and build Docker image.

Design principles and contracts
------------------------------
- Small modules: one router file per narrow behavior (e.g., `listings/search.py` not `listings.py` with 50 routes).
- Explicit schemas: every endpoint has a pydantic input schema and output schema.
- Role-based authorization: `role` claims come from Supabase JWT (student, owner, admin). Protect owner-only endpoints.
- Fail fast and return helpful errors (use standardized error responses with code/message).

API surface (modular, minimal endpoints)
--------------------------------------
Notes:
- All routes are prefixed with `/api/v1`.
- Auth: endpoints that modify data require Authorization: Bearer <supabase-jwt>.
- Roles: student, owner, admin. Use DI `get_current_user()` which validates JWT and returns user record + role.

1) Health & Info
- GET /api/v1/health
	- 200 OK {"status":"ok","ready":true}

2) Auth / User sync
- POST /api/v1/auth/sync
	- input: {"supabase_user_id": "uuid"}
	- purpose: create/sync local user profile from Supabase claims (called after sign-up)
	- output: user profile

- GET /api/v1/users/me
	- auth required
	- output: user profile (id, role, name, contact, metadata)

3) Users (admin-facing)
- GET /api/v1/users
	- query: ?role=owner|student&page=1&per_page=20
	- admin only
	- returns paginated list of users

4) Listings (domain: coaching, hostel, tiffin, library)
Break the listings area into tiny endpoints:
- POST /api/v1/listings (owner)
	- body: ListingCreate { title, category, address, location: {lat,lon}, price, tags[], description, photos[] }
	- returns created listing

- GET /api/v1/listings/{listing_id}
	- returns ListingDetail {owner, images, avg_rating, amenities}

- PATCH /api/v1/listings/{listing_id} (owner)
	- partial update

- DELETE /api/v1/listings/{listing_id} (owner)

- GET /api/v1/listings/search
	- query params: q, category, lat, lon, radius_km, price_min, price_max, page, per_page, sort
	- returns paginated results with distance

- GET /api/v1/listings/owner/{owner_id}
	- list of owner's listings (with admin/owner protections)

5) Bookings
- POST /api/v1/bookings
	- body: BookingCreate { listing_id, start_date?, end_date?, quantity? }
	- creates booking in PENDING state, notifies owner

- GET /api/v1/bookings/me
	- list bookings for current user (student)

- GET /api/v1/bookings/owner (owner)
	- list bookings for owner across their listings

- POST /api/v1/bookings/{booking_id}/accept (owner)
	- owner accepts the booking -> status ACCEPTED

- POST /api/v1/bookings/{booking_id}/decline (owner)
	- owner declines with optional reason

- POST /api/v1/bookings/{booking_id}/cancel (student)
	- cancels by student (policy checks apply)

6) Reviews & Ratings
- POST /api/v1/listings/{listing_id}/reviews
	- body: { rating: int(1-5), comment: str }

- GET /api/v1/listings/{listing_id}/reviews
	- paginated

7) Storage (Supabase)
- POST /api/v1/storage/upload-url
	- body: { path, content_type }
	- returns signed upload URL (or client-side may use Supabase SDK directly)

- GET /api/v1/storage/public-url
	- body: { path }
	- returns public URL or signed URL depending on bucket policy

8) Analytics / Dashboard
- GET /api/v1/analytics/owner/summary
	- owner-only: bookings_count, revenue_estimate, recent_bookings, occupancy_rate

- GET /api/v1/analytics/admin/overview
	- admin-only: aggregate metrics across platform

9) Admin utilities
- GET /api/v1/admin/users/stats
- POST /api/v1/admin/reload-cache

Error handling and responses
----------------------------
- Use a consistent error schema: {"code": "string", "message": "human message", "details": optional}
- Map common HTTP codes: 400 (validation), 401 (auth), 403 (permission), 404 (not found), 409 (conflict), 500 (server)

Security & Auth notes
---------------------
- Verify Supabase JWTs using the JWKS or using Supabase service key where necessary, but avoid exposing service key to clients.
- Map JWT claims to a local `users` row where additional profile info and role are stored.
- Rate-limit sensitive endpoints if necessary.

Edge cases & considerations
--------------------------
- Geolocation: ensure safe fallbacks when lat/lon missing; support text search.
- Concurrency: booking acceptance should be transactional to avoid double-booking.
- Media uploads: prefer client direct-to-Supabase with signed URLs; validate file types and sizes server-side.
- Soft deletes for listings and users to preserve analytics and historical bookings.

Implementation steps (recommended ordering)
----------------------------------------
1. Add config + DB base (engine/session) in `app/db` and `app/config.py`.
2. Implement JWT verification and `get_current_user()` dependency in `app/deps.py`.
3. Implement health and users/me endpoints.
4. Implement listings create/read/search in tiny modules and wire to DB models.
5. Implement bookings lifecycle with transactional checks.
6. Integrate Supabase Storage signed URL endpoints.
7. Add reviews, analytics, and admin endpoints.
8. Add tests and CI pipeline.

Quick dev checklist (first 48 hours)
----------------------------------
- [ ] Create `app/config.py`, `app/db/base.py`, `app/main.py` with router includes.
- [ ] Implement JWT validation and a simple `users.sync` endpoint.
- [ ] Add `listings/create.py` + `listings/search.py` and corresponding schemas and models.
- [ ] Add basic tests for listings CRUD and booking creation.
- [ ] Document Postman/OpenAPI basic flows and hand off to frontend.

Next steps for you
------------------
- Confirm any domain model differences from the Supabase schema in `supabase/migrations/` and share those differences if you want me to generate models/schemas.
- If you want, I can scaffold the initial FastAPI files for you now (config, db, main, auth-dep, and one sample listings route) and run quick local tests.

Contact & notes
---------------
This roadmap is intentionally pragmatic and modular — the backend will remain easy to test, extend, and secure if we keep routes narrowly scoped and follow the small-module approach described above.

---
Generated: concise roadmap to implement backend APIs broken into small modules and endpoints.

