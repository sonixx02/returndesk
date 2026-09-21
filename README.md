# ReturnDesk

ReturnDesk is a returns desk web application for an online store. It allows support agents to raise return requests, review them, approve/reject them, record resolutions (refunds, replacements, or store credit), keep ordered notes, and manage the request lifecycle.


---

## Getting Started

### 1. Prerequisites & Environment
Ensure you have Node.js (v18+) and a PostgreSQL database available (local, Docker, Supabase, or Neon).

Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/returndesk
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration & Seeding
Run the migration script to create tables, ENUM types, sequences, and indexes:
```bash
npm run migrate
```
Run the seed script to populate the database with 30 realistic requests across all statuses and reasons, along with attached notes:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Schema & Architecture

### Tables & Indexes
- **`requests`**:
  - `id`: UUID PRIMARY KEY
  - `reference_number`: Auto-generated reference (`RD-XXXXXX`) using a PostgreSQL sequence.
  - `customer_name`, `customer_contact`, `order_number`, `item`, `quantity`
  - `reason`: ENUM (`DAMAGED`, `WRONG_ITEM`, `SIZE_ISSUE`, `NOT_AS_DESCRIBED`, `CHANGED_MIND`)
  - `status`: ENUM (`OPEN`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `COMPLETED`)
  - `resolution`: ENUM (`REFUND`, `REPLACEMENT`, `STORE_CREDIT`)
  - `refund_amount`: INTEGER (stored in base currency units / cents)
  - `created_at`, `updated_at`, `removed_at` (TIMESTAMPTZ)
  - **Index**: Unique index `requests_one_live_order_item_idx` on `(order_number, item)` where `status NOT IN ('REJECTED', 'COMPLETED')` to enforce the one live request per item rule at the database level.

- **`notes`**:
  - `id`: UUID PRIMARY KEY
  - `request_id`: UUID (Foreign Key to `requests(id)`)
  - `content`: TEXT
  - `created_at`: TIMESTAMPTZ
  - **Index**: Index on `(request_id, created_at)` for ordered note retrieval.

### Architecture
- **Framework**: Next.js (App Router) + React + TypeScript.
- **Styling**: Tailwind CSS (responsive down to 375px width).
- **Backend / Query Layer**: Raw SQL using `pg` pool in Next.js Route Handlers (`src/app/api/...`), organized into repository files (`src/server/repositories/`) and service files (`src/server/services/`).

---

## Business Rules Enforced on the Server

1. **Status Flow Lifecycle**:
   - `OPEN` → `IN_REVIEW` → `APPROVED` / `REJECTED` → `COMPLETED`.
   - `REJECTED` and `COMPLETED` are terminal states. Illegal transitions are refused with HTTP 409 `INVALID_STATUS_TRANSITION`.

2. **Approval & Resolutions**:
   - Approval requires a resolution (`REFUND`, `REPLACEMENT`, `STORE_CREDIT`).
   - `REFUND` requires a positive integer `refund_amount` (HTTP 422). Non-refund resolutions forbid refund amounts.

3. **One Live Request Per Item**:
   - A customer cannot have multiple active requests (`OPEN`, `IN_REVIEW`, `APPROVED`) for the same order number and item.
   - Refused with HTTP 409 `DUPLICATE_LIVE_REQUEST`.

4. **Locked Once Decided**:
   - Request details (`customer_name`, `item`, `quantity`, etc.) cannot be edited after reaching `APPROVED`, `REJECTED`, or `COMPLETED` (HTTP 409 `REQUEST_NOT_EDITABLE`). Notes can still be added.

5. **Soft Removal**:
   - Requests are soft-removed (`removed_at IS NOT NULL`) so records are preserved. Only requests in `OPEN` or `REJECTED` status can be removed (HTTP 409 `REQUEST_NOT_REMOVABLE`).

---

## Design Decisions

- **Raw SQL via `pg`**: Used raw SQL queries with parameterized values (`$1`, `$2`) to ensure full control over SQL queries, exact index utilization, and high performance without ORM overhead.
- **Server-Side Searching, Filtering, Sorting & Paging**: All search queries (`ILIKE`), status/reason filtering (`WHERE`), sorting (`ORDER BY`), and pagination (`LIMIT`/`OFFSET`) execute entirely on PostgreSQL.
- **Structured Error Handling**: All API errors throw an `AppError` and are converted by `errorResponse` into consistent, machine-readable JSON responses `{ error: { code, message } }` with accurate HTTP status codes (400, 404, 409, 422, 500).
- **Frontend Debouncing**: Search input is debounced by 300ms to avoid firing unnecessary network requests on every keystroke.

---

## Additional Polish & Core Strengthening

Rather than adding superficial extra features, I chose to **strengthen what exists** to make ReturnDesk production-ready and reliable:
- **Server Input Boundary Validations**: Implemented strict validation for text field length caps (100 chars), contact format validation (email and 7–20 digit phone format checking), positive integer quantity ranges (1–1000), and refund amount bounds.
- **Database & Service Layer Race-Condition Safety**: Enforced duplicate live request checks in the service layer (`findLiveRequestByOrderItem`) as well as a partial unique index in PostgreSQL (`requests_one_live_order_item_idx`).
- **Database Error Mapping**: Handled PostgreSQL constraint code `23505` in `errorResponse` to return clean HTTP 409 `DUPLICATE_LIVE_REQUEST` responses if concurrent requests bypass service checks.
- **Zero Lints & Full Type Safety**: Fixed React Hook effect rendering side-effects, eliminating 100% of TypeScript and ESLint warnings.


---

## What Is Done vs. What Is Left

### Done
- Server-side enforcement of all 5 core business rules.
- Server-side searching, filtering by status/reason, sorting, and pagination.
- Full UI for raising requests, viewing request details, adding notes, transitioning status, and editing/removing requests.
- Input validation (field lengths, valid email/phone format, quantity bounds, refund bounds).
- 30 seed records with notes across all statuses and reasons.
- Zero TypeScript and ESLint warnings/errors.

### Left / Future Work
- CSV export for return request reports.
- Automated email notifications sent to customers upon status changes or approvals.
- Visual analytics dashboard showing return reason distributions.

---

## Assumptions Made
- `refund_amount` is provided and stored as a positive integer (cents/units).
- Customer contact must be a valid email or phone number format.
- Text fields (`customerName`, `customerContact`, `orderNumber`, `item`) have a max length limit of 100 characters.

---

## Time Spent
Approximately **6-7 hours** total spent on schema design, backend routes, business rules enforcement, UI implementation, seed data, and testing
