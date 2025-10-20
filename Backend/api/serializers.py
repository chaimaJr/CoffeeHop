"""
Serializers convert Django models to/from JSON for API requests/responses.
Each serializer defines which fields are exposed and validation rules.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import *

# User serializers for authentication and profile management
class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model - handles user profile data.
    Used for registration, profile viewing, and updates.
    """
    
    class Meta:
        model = User
        # Fields exposed in API responses
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'role', 'loyalty_points', 'notification_enabled',
            'date_joined'
        ]
        # Read-only fields that users cannot modify directly
        read_only_fields = ['id', 'role', 'loyalty_points', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for new user registration.
    Handles password validation and secure password storage.
    """
    
    # Password field (write-only, won't appear in responses)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="User password (min 8 characters)"
    )
    # Confirm password field for validation
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="Re-enter password for confirmation"
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone'
        ]
    
    def validate(self, data):
        """Validate that passwords match"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                "password": "Passwords do not match"
            })
        return data
    
    def create(self, validated_data):
        """Create new user with hashed password"""
        # Remove password_confirm as it's not a model field
        validated_data.pop('password_confirm')
        
        # Create user with hashed password using create_user method
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login authentication.
    Validates credentials and returns user data with auth token.
    """
    
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, data):
        """Authenticate user credentials"""
        username = data.get('username')
        password = data.get('password')
        
        # Authenticate using Django's authentication backend
        user = authenticate(username=username, password=password)
        
        if user is None:
            raise serializers.ValidationError(
                "Invalid username or password"
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                "User account is disabled"
            )
        
        # Add user object to validated data
        data['user'] = user
        return data


# Menu item serializers
class MenuItemSerializer(serializers.ModelSerializer):
    """
    Serializer for MenuItem model.
    Exposes all menu item details including image URL.
    """
    
    # Include full image URL in response
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuItem
        fields = [
            'id', 'title', 'description', 'image', 'image_url',
            'item_type', 'price', 'is_available', 'preparation_time',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Generate full URL for image if it exists"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None


# Order item serializers
class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for OrderItem - individual items within an order.
    Includes nested menu item details for complete information.
    """
    
    # Include full menu item data in response
    menu_item_detail = MenuItemSerializer(source='menu_item', read_only=True)
    # Accept menu item ID when creating order
    menu_item = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all()
    )
    # Calculate total for this line item
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'menu_item', 'menu_item_detail', 'quantity',
            'price', 'customizations', 'total'
        ]
        read_only_fields = ['id']
    
    def get_total(self, obj):
        """Calculate line item total (price * quantity)"""
        return obj.get_total_price()


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Order model.
    Handles complete order data including nested order items.
    """
    
    # Nested order items (read-only for display, writable for creation)
    items = OrderItemSerializer(many=True, read_only=True)
    # For creating orders with items
    order_items = OrderItemSerializer(many=True, write_only=True, required=False)
    # Include customer details in response
    customer_detail = UserSerializer(source='customer', read_only=True)
    # Calculate if order can be modified
    can_modify = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_detail', 'status', 'total_price',
            'notes', 'scheduled_for', 'is_favourite', 'items', 'order_items',
            'can_modify', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'customer', 'total_price', 'created_at', 'updated_at', 'completed_at'
        ]
    
    def get_can_modify(self, obj):
        """Check if order status allows modifications"""
        return obj.can_be_modified()
    
    def create(self, validated_data):
        """Create order with nested order items"""
        # Extract order items data
        order_items_data = validated_data.pop('order_items', [])
        
        # Set customer from request context
        validated_data['customer'] = self.context['request'].user
        
        # Calculate total price from items
        total = sum(
            item['price'] * item['quantity']
            for item in order_items_data
        )
        validated_data['total_price'] = total
        
        # Create order
        order = Order.objects.create(**validated_data)
        
        # Create order items
        for item_data in order_items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        # Award loyalty points (1 point per dollar)
        customer = order.customer
        customer.loyalty_points += order.calculate_points()
        customer.save()
        
        return order
    
    def update(self, instance, validated_data):
        """Update order, handle status changes"""
        old_status = instance.status
        
        # Update order fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # If status changed, send notification
        if old_status != instance.status:
            self._send_status_notification(instance)
        
        return instance
    
    def _send_status_notification(self, order):
        """Create notification when order status changes"""
        from .models import Notification
        
        # Map status to notification type and message
        status_messages = {
            Order.OrderStatus.RECEIVED: (
                Notification.NotificationType.ORDER_RECEIVED,
                "Order Received",
                "Your order has been received and will be prepared soon."
            ),
            Order.OrderStatus.PREPARING: (
                Notification.NotificationType.ORDER_PREPARING,
                "Order is Being Prepared",
                "Your order is now being prepared by our barista."
            ),
            Order.OrderStatus.READY: (
                Notification.NotificationType.ORDER_READY,
                "Order Ready for Pickup!",
                "Your order is ready! Please come pick it up."
            ),
            Order.OrderStatus.COMPLETED: (
                Notification.NotificationType.ORDER_COMPLETED,
                "Order Completed",
                "Thank you for your order! Enjoy your coffee and dessert."
            ),
            Order.OrderStatus.CANCELLED: (
                Notification.NotificationType.ORDER_CANCELLED,
                "Order Cancelled",
                "Your order has been cancelled."
            ),
        }
        
        if order.status in status_messages:
            notif_type, title, message = status_messages[order.status]
            Notification.objects.create(
                user=order.customer,
                notification_type=notif_type,
                title=title,
                message=message,
                order=order
            )


class OrderListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for order lists.
    Shows summary without nested items for better performance.
    """
    
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'status', 'total_price',
            'items_count', 'scheduled_for', 'created_at'
        ]
    
    def get_items_count(self, obj):
        """Count total items in order"""
        return obj.items.count()


# Favourite order serializers
class FavouriteOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for FavouriteOrder - saved order templates.
    Includes complete template order details for reordering.
    """
    
    # Include full order details
    template_order_detail = OrderSerializer(source='template_order', read_only=True)
    
    class Meta:
        model = FavouriteOrder
        fields = [
            'id', 'customer', 'name', 'template_order',
            'template_order_detail', 'created_at'
        ]
        read_only_fields = ['id', 'customer', 'created_at']
    
    def create(self, validated_data):
        """Create favourite with customer from request context"""
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)


# Loyalty offer serializers
class LoyaltyOfferSerializer(serializers.ModelSerializer):
    """
    Serializer for LoyaltyOffer - promotional offers.
    Shows offers available for redemption.
    """
    
    # Check if offer is currently valid
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = LoyaltyOffer
        fields = [
            'id', 'title', 'description', 'points_required',
            'is_active', 'valid_from', 'valid_until', 'is_valid'
        ]
        read_only_fields = ['id']
    
    def get_is_valid(self, obj):
        """Check if offer is within validity period"""
        from django.utils import timezone
        now = timezone.now()
        
        if not obj.is_active:
            return False
        if obj.valid_from > now:
            return False
        if obj.valid_until and obj.valid_until < now:
            return False
        return True


# Notification serializers
class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model.
    Shows notification history and allows marking as read.
    """
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'order', 'is_read', 'sent_at'
        ]
        read_only_fields = ['id', 'sent_at']



class LoyaltyRedemptionSerializer(serializers.ModelSerializer):
    """
    Serializer for LoyaltyRedemption - tracks redeemed offers.
    Shows redemption history with offer details.
    """
    
    # Include offer details
    loyalty_offer_detail = LoyaltyOfferSerializer(source='loyalty_offer', read_only=True)
    # Customer name for display
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    
    class Meta:
        model = LoyaltyRedemption
        fields = [
            'id', 'customer', 'customer_name', 'loyalty_offer', 
            'loyalty_offer_detail', 'points_spent', 'redemption_code',
            'is_used', 'order', 'redeemed_at'
        ]
        read_only_fields = [
            'id', 'customer', 'points_spent', 'redemption_code', 
            'redeemed_at'
        ]