"""
URL routing for API endpoints.
Maps URL patterns to views using Django REST Framework routers.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for automatic URL routing with ViewSets
# Router automatically creates URLs for CRUD operations:
# - GET /resource/ - list
# - POST /resource/ - create
# - GET /resource/{id}/ - retrieve
# - PUT /resource/{id}/ - update
# - PATCH /resource/{id}/ - partial_update
# - DELETE /resource/{id}/ - destroy
# Plus any custom @action decorated methods

router = DefaultRouter()

# Register ViewSets with the router
# Each registration creates a full set of CRUD endpoints

# Menu items CRUD: /api/menu-items/
router.register(r'menu-items', views.MenuItemViewSet, basename='menuitem')

# Orders CRUD: /api/orders/
# Also includes custom actions: /api/orders/queue/, /api/orders/{id}/update_status/
router.register(r'orders', views.OrderViewSet, basename='order')

# Favourite orders CRUD: /api/favourites/
# Also includes custom action: /api/favourites/{id}/reorder/
router.register(r'favourites', views.FavouriteOrderViewSet, basename='favourite')

# Loyalty offers (read-only): /api/loyalty-offers/
router.register(r'loyalty-offers', views.LoyaltyOfferViewSet, basename='loyaltyoffer')

router.register(r'loyalty-redemptions', views.LoyaltyRedemptionViewSet, basename='loyaltyredemption')  # ADD THIS LINE

# Notifications (read-only with mark actions): /api/notifications/
router.register(r'notifications', views.NotificationViewSet, basename='notification')

# URL patterns
urlpatterns = [
    # Authentication endpoints (function-based views)
    path('register/', views.register, name='register'),  # POST - Create new account
    path('login/', views.login, name='login'),          # POST - Login with credentials
    path('logout/', views.logout, name='logout'),       # POST - Logout current user
    path('profile/', views.profile, name='profile'),    # GET/PUT/PATCH - View/update profile
    
    # Loyalty points endpoint
    path('loyalty-points/', views.loyalty_points, name='loyalty-points'),  # GET - Check points balance
    
    # Include all router-generated URLs
    # This adds all the ViewSet URLs defined above
    path('', include(router.urls)),
]

"""
Complete API Endpoints Summary:

AUTHENTICATION:
- POST   /api/register/           - Register new customer
- POST   /api/login/              - Login and get token
- POST   /api/logout/             - Logout (delete token)
- GET    /api/profile/            - View profile
- PUT    /api/profile/            - Update profile (full)
- PATCH  /api/profile/            - Update profile (partial)

MENU ITEMS:
- GET    /api/menu-items/         - List all items (filter: ?item_type=COFFEE&is_available=true)
- POST   /api/menu-items/         - Create item (barista/admin)
- GET    /api/menu-items/{id}/    - Get item details
- PUT    /api/menu-items/{id}/    - Update item (barista/admin)
- PATCH  /api/menu-items/{id}/    - Partial update (barista/admin)
- DELETE /api/menu-items/{id}/    - Delete item (admin)

ORDERS:
- GET    /api/orders/             - List my orders (customer) or all orders (barista)
- POST   /api/orders/             - Create new order
- GET    /api/orders/{id}/        - Get order details
- PUT    /api/orders/{id}/        - Update order (if status=RECEIVED)
- PATCH  /api/orders/{id}/        - Partial update order
- DELETE /api/orders/{id}/        - Cancel order (if status=RECEIVED)
- GET    /api/orders/queue/       - Get orders to prepare (barista)
- POST   /api/orders/{id}/update_status/ - Change status (barista)
- POST   /api/orders/{id}/mark_favourite/ - Mark as favourite template

FAVOURITES:
- GET    /api/favourites/         - List my saved order templates
- POST   /api/favourites/         - Save order as template
- GET    /api/favourites/{id}/    - Get template details
- PUT    /api/favourites/{id}/    - Update template
- PATCH  /api/favourites/{id}/    - Partial update
- DELETE /api/favourites/{id}/    - Delete template
- POST   /api/favourites/{id}/reorder/ - Create order from template

LOYALTY:
- GET    /api/loyalty-points/     - Get my points balance
- GET    /api/loyalty-offers/     - List available offers
- GET    /api/loyalty-offers/{id}/ - Get offer details

NOTIFICATIONS:
- GET    /api/notifications/      - List my notifications
- GET    /api/notifications/{id}/ - Get notification details
- POST   /api/notifications/{id}/mark_read/ - Mark as read
- POST   /api/notifications/mark_all_read/ - Mark all as read
"""