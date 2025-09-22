# Run the Project (DB + Backend + Frontend)

## Prerequisites:

* **Docker** & **Docker Compose**
* **PHP 8.x** + **Composer**
* **Node 18+** (Node 20/22 OK) and **pnpm** (or npm/yarn)

## Project Structure

```
Autoone/
├─ backend/        # Laravel API (+ docker-compose.yml for MySQL)
└─ apps/
   └─ web/         # React (Vite) frontend
```

## Quickstart (TL;DR)

```bash
# 1) DB (from backend/)
cd backend
docker compose up -d

# 2) Backend (from backend/)
cd backend
cp .env.example .env
composer install
php artisan key:generate

# run migrations + demo seed data (users, workshops, services, cars, rentals, parts, imports)
php artisan migrate --seed

# start API
php artisan serve --host=0.0.0.0 --port=8000

# 3) Frontend (from apps/web/)
cd ../apps/web
pnpm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
pnpm dev --host --port 5173
```

---

## Step-by-Step

### 1) Clone

```bash
git clone https://github.com/ElSedik-devs/Autoone
cd Autoone
```

### 2) Start the Database (MySQL via Docker)

Run from **`backend/`**:

```bash
cd backend
docker compose up -d
docker compose ps
```

Connection details:

* Host: `127.0.0.1:3307`
* Database: `autoone`
* User: `autoone`
* Password: `secret`

### 3) Configure Backend (Laravel)

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

API available at: **[http://localhost:8000](http://localhost:8000)**

Check routes:

```bash
php artisan route:list
```

### 4) Run the Frontend (Vite React)

```bash
cd ../apps/web
pnpm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
pnpm dev --host --port 5173
```

Frontend at: **[http://localhost:5173](http://localhost:5173)**

---

## Application Overview

### Roles

* **User** – browse workshops, car wash, rentals, cars, imports, spare parts; place bookings/orders.
* **Partner** – manage their services, bookings, spare parts, reports.
* **Admin** – manage users, partners, workshops, services, bookings.

### Frontend (React + Vite)

* **Routing:** React Router (`/`, `/workshops`, `/wash`, `/cars`, `/rental`, `/import`, `/parts`, `/cart`, `/profile`)

* **Components:**

  * **Home** – entry page with quick links
  * **Workshops & Maintenance** – list + detail + booking
  * **Car Wash** – list providers
  * **Cars (buy/finance)** – search & filter
  * **Car Rental** – filter by city/date
  * **Car Import** – Europe, China, USA
  * **Spare Parts Marketplace** – cart, stock, orders
  * **Partner Dashboard** – services, parts, bookings, reports
  * **Admin Dashboard** – users, partners, workshops, services, pending approvals

* **State management:**

  * Local state with React hooks (`useState`, `useEffect`)
  * API layer (`/lib/api.ts`) for backend calls
  * Cart state stored in context + persisted locally
  * i18n via `react-i18next`

* **Internationalization:**

  * **English (LTR)**, **Deutsch (LTR)**, **العربية (RTL)**
  * Full UI translation (menus, buttons, filters, quick links)
  * RTL layout automatically applied in Arabic

### Backend (Laravel)

* **Auth:** JWT-based, roles (`user`, `partner`, `admin`)
* **Key Models:**

  * `User`, `Partner`, `Workshop`, `Service`, `Booking`, `Part`, `Order`, `Car`, `Rental`, `Import`
* **Routes:** (from `php artisan route:list`)

  * `/api/workshops` – CRUD workshops & services
  * `/api/cars` – list & filter cars
  * `/api/rentals` – rental bookings
  * `/api/imports` – car imports
  * `/api/parts` – spare parts marketplace
  * `/api/bookings` – user bookings
  * `/api/partner/...` – partner dashboards, reports, orders
  * `/api/admin/...` – admin dashboards, manage users/partners

---

## Useful Commands

```bash
# Docker (from backend/)
docker compose ps
docker compose logs -f
docker compose restart
docker compose down

# Laravel (from backend/)
php artisan route:list
php artisan migrate:fresh
php artisan tinker

# Frontend (from apps/web/)
pnpm build
pnpm preview
```

---

## Troubleshooting

* **Port already in use**
  → Adjust ports in `backend/docker-compose.yml` or `php artisan serve --port=XXXX`.

* **Backend cannot connect to DB**
  → Ensure MySQL is running (`docker compose ps`) and `.env` matches DB credentials.

* **CORS errors**
  → Confirm `VITE_API_BASE_URL` in `apps/web/.env` is set to `http://localhost:8000`.

* **Composer/Node missing**
  → Install Composer + Node, or use Docker for PHP if needed.

---
