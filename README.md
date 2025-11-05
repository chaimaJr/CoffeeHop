# CoffeeHop

An Ionic + Django coffee shop ordering app.  
CoffeeHop enables customers to browse a coffee shop’s menu, place orders (pickup or delivery), and manage their orders. On the admin side (Django backend), the shop owner can manage menu items, orders, and view order history.

---

## Table of Contents

- [Features](#features)  
- [Usd Technologies](#architecture--tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Backend Setup (Django)](#backend-setup-django)  
  - [Frontend Setup (Ionic)](#frontend-setup-ionic)  
- [Usage](#usage)  
- [API endpoints](#api-endpoints)

---

## Features

- Browse menu by category (coffee, tea, snacks, etc.)  
- Add items to cart and place orders  
- Order status tracking  
- User authentication (signup / login)
- Responsive UI (mobile-first)

---

## Used Technologies

| Layer        | Framework / Technology     |
|--------------|-----------------------------|
| Backend      | Django + Django REST Framework |
| Frontend     | Ionic + Angular              |


---

## Getting Started

### Prerequisites

- Python <= v3.8
- pip (Python Package Manager)
- npm (Node Package Manager)
- Angular CLI v19.2.x
- Node.js v20.11.x  
- Ionic CLI v7.2.x  

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/chaimaJr/CoffeeHop.git
cd CoffeeHop
```


#### 2. Backend Setup (Django)

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


#### 3. Frontend Setup (Ionic)

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


## Usage

- As a Customer:
  - Sign up for a new account or log in with existing credentials.
  - Browse the coffee menu and view details of each item.
  - Add items to your cart and proceed to checkout to place an order.
  - View your past orders and order status in your account dashboard.

- As a barista:
  - Log in with existing credentials.
  - Browse incoming orders and view detials of each one.
  - Update orders status after 

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
