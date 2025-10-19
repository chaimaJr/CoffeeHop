"""
API views using Django REST Framework.
Uses ViewSets for CRUD operations with minimal code.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    User, MenuItem, Order, OrderItem,
    FavouriteOrder, LoyaltyOffer, Notification
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    MenuItemSerializer, OrderSerializer, OrderListSerializer,
    OrderItemSerializer, FavouriteOrderSerializer,
    LoyaltyOfferSerializer, NotificationSerializer
)

# ============================================================================
# CUSTOM PERMISSION CLASSES
# ============================================================================

class IsBaristaOrAdmin(permissions.BasePermission):
    """
    Custom permission: only allow baristas and admins.
    Used for barista-specific endpoints like order queue.
    """
    
    def has_permission(self, request, view):
        """Check if user is barista or admin"""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in [User.UserRole.BARISTA, User.UserRole.ADMIN]
        )
    
# ============================================================================
# AUTHENTICATION VIEWS
# ============================================================================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Allow unauthenticated access for registration
def register(request):
    """
    Register a new customer account.
    POST /api/register/
    Body: {username, email, password, password_confirm, first_name, last_name, phone}
    Returns: User data and authentication token
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    # Validate input data
    if serializer.is_valid():
        # Create new user
        user = serializer.save()
        
        # Generate authentication token
        token, created = Token.objects.get_or_create(user=user)
        
        # Return user data with token
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)
    
    # Return validation errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Allow unauthenticated access for login
def login(request):
    """
    Login with username and password.
    POST /api/login/
    Body: {username, password}
    Returns: User data and authentication token
    """
    serializer = LoginSerializer(data=request.data)
    
    # Validate credentials
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Get or create token
        token, created = Token.objects.get_or_create(user=user)
        
        # Return user data with token
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        })
    
    # Return validation errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout(request):
    """
    Logout current user by deleting auth token.
    POST /api/logout/
    Requires: Authentication token in header
    """
    # Delete user's token to logout
    request.user.auth_token.delete()
    return Response({
        'message': 'Logout successful'
    })


@api_view(['GET', 'PUT', 'PATCH'])
def profile(request):
    """
    Get or update user profile.
    GET /api/profile/ - View profile
    PUT/PATCH /api/profile/ - Update profile
    Requires: Authentication
    """
    if request.method == 'GET':
        # Return current user profile
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    else:
        # Update user profile (PUT or PATCH)
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True  # Allow partial updates (PATCH)
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# MENU ITEM VIEWSET
# ============================================================================

class MenuItemViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for menu items (coffees and desserts).
    
    Endpoints:
    - GET /api/menu-items/ - List all items (with filters)
    - GET /api/menu-items/{id}/ - Get single item
    - POST /api/menu-items/ - Create item (barista/admin only)
    - PUT/PATCH /api/menu-items/{id}/ - Update item (barista/admin only)
    - DELETE /api/menu-items/{id}/ - Delete item (admin only)
    
    Query params:
    - item_type: Filter by COFFEE or DESSERT
    - is_available: Filter by availability (true/false)
    - search: Search in title and description
    """
    
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['item_type', 'is_available']  # Enable filtering by these fields
    search_fields = ['title', 'description']  # Enable search on these fields
    
    def get_permissions(self):
        """
        Set permissions based on action.
        - List and retrieve: Any authenticated user
        - Create and update: Barista or Admin only
        - Delete: Admin only
        """
        if self.action in ['list', 'retrieve']:
            # Customers can view menu
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['create', 'update', 'partial_update']:
            # Only barista/admin can modify availability
            permission_classes = [permissions.IsAuthenticated, IsBaristaOrAdmin]
        else:
            # Only admin can delete items
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]


# ============================================================================
# ORDER VIEWSET
# ============================================================================

class OrderViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for orders.
    
    Customer endpoints:
    - GET /api/orders/ - List my orders
    - GET /api/orders/{id}/ - Get order details
    - POST /api/orders/ - Create new order
    - PUT/PATCH /api/orders/{id}/ - Update order (if status=RECEIVED)
    - DELETE /api/orders/{id}/ - Cancel order (if status=RECEIVED)
    
    Barista endpoints:
    - GET /api/orders/queue/ - Get orders to prepare
    - POST /api/orders/{id}/update_status/ - Change order status
    
    Query params:
    - status: Filter by order status
    - scheduled_for: Filter scheduled orders
    """
    
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    
    def get_queryset(self):
        """
        Return orders based on user role.
        - Customers: Only their own orders
        - Baristas/Admin: All orders
        """
        user = self.request.user
        
        if user.role == User.UserRole.CUSTOMER:
            # Customers see only their orders
            return Order.objects.filter(customer=user)
        else:
            # Baristas and admin see all orders
            return Order.objects.all()
    
    def get_serializer_class(self):
        """
        Use lightweight serializer for list view.
        Use detailed serializer for single order view.
        """
        if self.action == 'list':
            return OrderListSerializer
        return OrderSerializer
    
    def perform_create(self, serializer):
        """
        Create order and set customer to current user.
        Automatically set status to RECEIVED.
        """
        serializer.save(customer=self.request.user)
    
    def update(self, request, *args, **kwargs):
        """
        Update order - only allowed if status is RECEIVED.
        """
        order = self.get_object()
        
        # Check if order belongs to requesting customer
        if order.customer != request.user:
            return Response(
                {'error': 'You can only modify your own orders'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if order can be modified
        if not order.can_be_modified():
            return Response(
                {'error': 'Order cannot be modified after preparation starts'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Cancel order - only allowed if status is RECEIVED.
        """
        order = self.get_object()
        
        # Check if order belongs to requesting customer
        if order.customer != request.user:
            return Response(
                {'error': 'You can only cancel your own orders'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if order can be cancelled
        if not order.can_be_modified():
            return Response(
                {'error': 'Order cannot be cancelled after preparation starts'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set status to cancelled instead of deleting
        order.status = Order.OrderStatus.CANCELLED
        order.save()
        
        return Response({
            'message': 'Order cancelled successfully'
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsBaristaOrAdmin])
    def queue(self, request):
        """
        Get orders queue for baristas.
        GET /api/orders/queue/
        Returns orders with status RECEIVED or PREPARING, ordered by creation time.
        """
        # Get orders that need attention
        orders = Order.objects.filter(
            status__in=[Order.OrderStatus.RECEIVED, Order.OrderStatus.PREPARING]
        ).order_by('created_at')
        
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsBaristaOrAdmin])
    def update_status(self, request, pk=None):
        """
        Update order status (barista only).
        POST /api/orders/{id}/update_status/
        Body: {status: "PREPARING" | "READY" | "COMPLETED"}
        """
        order = self.get_object()
        new_status = request.data.get('status')
        
        # Validate status value
        if new_status not in dict(Order.OrderStatus.choices):
            return Response(
                {'error': 'Invalid status value'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status
        order.status = new_status
        
        # Set completed timestamp if order is completed
        if new_status == Order.OrderStatus.COMPLETED:
            order.completed_at = timezone.now()
        
        order.save()
        
        # Serializer will automatically send notification
        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_favourite(self, request, pk=None):
        """
        Mark/unmark order as favourite template.
        POST /api/orders/{id}/mark_favourite/
        Body: {is_favourite: true/false}
        """
        order = self.get_object()
        
        # Check if order belongs to requesting customer
        if order.customer != request.user:
            return Response(
                {'error': 'You can only favourite your own orders'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Toggle favourite status
        is_favourite = request.data.get('is_favourite', True)
        order.is_favourite = is_favourite
        order.save()
        
        return Response({
            'message': 'Order favourite status updated',
            'is_favourite': order.is_favourite
        })


# ============================================================================
# FAVOURITE ORDER VIEWSET
# ============================================================================

class FavouriteOrderViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for saved order templates.
    
    Endpoints:
    - GET /api/favourites/ - List my saved orders
    - GET /api/favourites/{id}/ - Get favourite details
    - POST /api/favourites/ - Save order as template
    - PUT/PATCH /api/favourites/{id}/ - Update template name
    - DELETE /api/favourites/{id}/ - Delete template
    - POST /api/favourites/{id}/reorder/ - Create new order from template
    """
    
    serializer_class = FavouriteOrderSerializer
    
    def get_queryset(self):
        """Return only current user's favourites"""
        return FavouriteOrder.objects.filter(customer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def reorder(self, request, pk=None):
        """
        Create new order from favourite template.
        POST /api/favourites/{id}/reorder/
        Body: {scheduled_for: "2024-01-01T12:00:00Z"} (optional)
        """
        favourite = self.get_object()
        template = favourite.template_order
        
        # Create new order with same items as template
        new_order = Order.objects.create(
            customer=request.user,
            total_price=template.total_price,
            notes=template.notes,
            scheduled_for=request.data.get('scheduled_for', None)
        )
        
        # Copy all order items from template
        for item in template.items.all():
            OrderItem.objects.create(
                order=new_order,
                menu_item=item.menu_item,
                quantity=item.quantity,
                price=item.price,
                customizations=item.customizations
            )
        
        # Award loyalty points
        new_order.customer.loyalty_points += new_order.calculate_points()
        new_order.customer.save()
        
        # Return new order data
        serializer = OrderSerializer(new_order, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ============================================================================
# LOYALTY OFFER VIEWSET
# ============================================================================

class LoyaltyOfferViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view of available loyalty offers.
    
    Endpoints:
    - GET /api/loyalty-offers/ - List all active offers
    - GET /api/loyalty-offers/{id}/ - Get offer details
    """
    
    queryset = LoyaltyOffer.objects.filter(is_active=True)
    serializer_class = LoyaltyOfferSerializer
    
    def get_queryset(self):
        """Return only currently valid offers"""
        now = timezone.now()
        return LoyaltyOffer.objects.filter(
            is_active=True,
            valid_from__lte=now
        ).filter(
            # Either no expiry or not yet expired
            models.Q(valid_until__isnull=True) | models.Q(valid_until__gte=now)
        )


# ============================================================================
# NOTIFICATION VIEWSET
# ============================================================================

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    View notifications for current user.
    
    Endpoints:
    - GET /api/notifications/ - List my notifications
    - GET /api/notifications/{id}/ - Get notification details
    - POST /api/notifications/{id}/mark_read/ - Mark as read
    - POST /api/notifications/mark_all_read/ - Mark all as read
    """
    
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        """Return only current user's notifications"""
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Mark single notification as read.
        POST /api/notifications/{id}/mark_read/
        """
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """
        Mark all user's notifications as read.
        POST /api/notifications/mark_all_read/
        """
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'message': f'{count} notifications marked as read'
        })


# ============================================================================
# LOYALTY POINTS VIEW
# ============================================================================

@api_view(['GET'])
def loyalty_points(request):
    """
    Get current user's loyalty points balance.
    GET /api/loyalty-points/
    Returns: {points: 150, username: "john"}
    """
    return Response({
        'points': request.user.loyalty_points,
        'username': request.user.username
    })

