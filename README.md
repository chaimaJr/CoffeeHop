# CoffeeHop

An Ionic + Django coffee shop ordering app. CoffeeHop provides a mobile/web UI (Ionic + Angular) for customers and a REST API backend (Django REST Framework) for business logic, persistence and realtime updates.

---

## Table of Contents

- [Features](#role-based-features)  
- [Architecture](#architecture)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Backend Setup (Django)](#backend-setup-django)  
  - [Frontend Setup (Ionic)](#frontend-setup-ionic)  
- [API endpoints](#api-endpoints)



---

## Role-based Features

The project enforces role-based access at the API level using a custom User model with three roles: CUSTOMER, BARISTA, ADMIN.

Customer:
- Register, login, update their profile.
- Browse available menu items.
- Create orders (immediate or scheduled).
- Update or cancel their own orders only while order status is RECEIVED.
- Save orders as favourites and reorder from favourites.
- View loyalty points and redeem offers.
- View their notifications.

Barista:
- Access the order queue.
- Change order status (PREPARING / READY / COMPLETED).
- Create and update menu items (via API endpoints protected to barista/admin).
- Mark loyalty redemptions as used.

Admin:
- Full access: create/update/delete menu items, manage offers, view and modify all orders.
- Access Django admin site (/admin/) for full data management.
- Can delete resources that baristas cannot (e.g., menu item DELETE limited to admin).

---

## Architecture

Overview
- Frontend (Ionic + Angular)
  - Runs in browser or as a mobile app via Capacitor.
  - Handles UI, local cart state, authentication token storage, WebSocket client for realtime updates.
  - Communicates with backend via REST API (HTTP) and WebSocket (Channels).
- Backend (Django + DRF + Channels)
  - Exposes REST endpoints (authentication, menu, orders, favourites, loyalty, notifications).
  - Persists data in a relational DB (SQLite by default for dev; Postgres recommended for production).
  - Uses Django Channels for WebSocket support to power realtime order status updates.
  - Uses TokenAuthentication for mobile clients (Authorization: Token <key>).

---

## Getting Started

### Prerequisites

- Python <= v3.8
- pip (Python Package Manager)
- npm (Node Package Manager)
- Angular CLI v19.2.x
- Node.js v20.11.x  
- Ionic CLI v7.2.x  


### Backend Setup (Django)

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

Create a superuser (admin):

```bash
python manage.py createsuperuser
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`


### Frontend Setup (Ionic)

Open a new terminal and navigate to the frontend directory:

```bash
cd Frontend  
```

Install Node.js dependencies:

```bash
npm install
```

Start the Ionic development server:

```bash
ionic serve
```

The app will be available at `http://localhost:8100`

---

## Backend environment variables

Copy Backend/.env.example → Backend/.env and update.

Keys present in .env.example:
- SECRET_KEY — Django secret key (replace in production)
- DEBUG — True / False
- ALLOWED_HOSTS — CSV of allowed hostnames
- DATABASE_URL — e.g., sqlite:///db.sqlite3 or postgres://user:pass@host:port/dbname
- CORS_ALLOWED_ORIGINS — e.g., http://localhost:8100,http://localhost:4200
- (Optional email settings commented in example)

Important frontend keys (in Frontend/src/environments/environment.ts)
- apiUrl — base REST API URL (default: http://127.0.0.1:8000/api)
- wsUrl — WebSocket URL for realtime (default: ws://127.0.0.1:8000/ws)


## API endpoints:
---

Below is a detailed list of all available API endpoints for the CoffeeHop backend, categorized by functionality.

---

### Authentication

| Method | Endpoint | Description |
|---------|-----------|-------------|
| POST | `/api/register/` | Register new customer |
| POST | `/api/login/` | Login and get token |
| POST | `/api/logout/` | Logout (delete token) |
| GET | `/api/profile/` | View profile |
| PUT | `/api/profile/` | Update profile (full) |
| PATCH | `/api/profile/` | Update profile (partial) |

---

### Menu Items

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/api/menu-items/` | List all items (`?item_type=COFFEE&is_available=true` for filtering) |
| POST | `/api/menu-items/` | Create item (barista/admin) |
| GET | `/api/menu-items/{id}/` | Get item details |
| PUT | `/api/menu-items/{id}/` | Update item (barista/admin) |
| PATCH | `/api/menu-items/{id}/` | Partial update (barista/admin) |
| DELETE | `/api/menu-items/{id}/` | Delete item (admin) |

---

### Orders

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/api/orders/` | List my orders (customer) or all orders (barista) |
| POST | `/api/orders/` | Create new order |
| GET | `/api/orders/{id}/` | Get order details |
| PUT | `/api/orders/{id}/` | Update order (if `status=RECEIVED`) |
| PATCH | `/api/orders/{id}/` | Partial update order |
| DELETE | `/api/orders/{id}/` | Cancel order (if `status=RECEIVED`) |
| GET | `/api/orders/queue/` | Get orders to prepare (barista) |
| POST | `/api/orders/{id}/update_status/` | Change order status (barista) |
| POST | `/api/orders/{id}/mark_favourite/` | Mark order as favourite template |

---

### Favourites

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/api/favourites/` | List my saved order templates |
| POST | `/api/favourites/` | Save order as template |
| GET | `/api/favourites/{id}/` | Get template details |
| PUT | `/api/favourites/{id}/` | Update template |
| PATCH | `/api/favourites/{id}/` | Partial update |
| DELETE | `/api/favourites/{id}/` | Delete template |
| POST | `/api/favourites/{id}/reorder/` | Create order from template |

---

### Loyalty

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/api/loyalty-points/` | Get my points balance |
| GET | `/api/loyalty-offers/` | List available offers |
| GET | `/api/loyalty-offers/{id}/` | Get offer details |

---

### Notifications

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/api/notifications/` | List my notifications |
| GET | `/api/notifications/{id}/` | Get notification details |
| POST | `/api/notifications/{id}/mark_read/` | Mark as read |
| POST | `/api/notifications/mark_all_read/` | Mark all as read |
