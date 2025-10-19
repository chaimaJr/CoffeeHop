"""
Database models for the coffee shop application.
Defines all database tables and their relationships using Django ORM.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


# ============================================================================
# USER MODEL
# ============================================================================

class User(AbstractUser):
    """
    User model for authentication and profile management.
    Extends Django's AbstractUser to add custom fields and user roles.
    
    Fields:
    - username, email, password (inherited from AbstractUser)
    - role: User type (CUSTOMER, BARISTA, ADMIN)
    - phone: Contact number
    - loyalty_points: Accumulated points from purchases
    - push_token: Device token for push notifications
    - notification_enabled: Whether user wants notifications
    """
    
    # User role choices - determines what features user can access
    class UserRole(models.TextChoices):
        CUSTOMER = 'CUSTOMER', 'Customer'  # Regular customer
        BARISTA = 'BARISTA', 'Barista'    # Staff member who prepares orders
        ADMIN = 'ADMIN', 'Admin'          # Administrator with full access
    
    # Role field - defaults to CUSTOMER for new users
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER,
        help_text="User role determines access permissions"
    )
    
    # Phone number for order notifications
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Phone number for order notifications"
    )
    
    # Loyalty points accumulated from purchases (1 point per dollar)
    loyalty_points = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Accumulated loyalty points from purchases"
    )
    
    # Push notification token from mobile device
    push_token = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Device push notification token for mobile alerts"
    )
    
    # Whether user wants to receive notifications
    notification_enabled = models.BooleanField(
        default=True,
        help_text="Whether user wants to receive push notifications"
    )
    
    class Meta:
        # Add database indexes for frequently queried fields
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        """String representation of user"""
        return f"{self.username} ({self.role})"


# ============================================================================
# MENU ITEM MODEL
# ============================================================================

class MenuItem(models.Model):
    """
    Menu items model for coffees and desserts.
    Stores all available products that customers can order.
    
    Fields:
    - title: Display name
    - description: Product details
    - image: Product photo
    - item_type: COFFEE or DESSERT
    - price: Cost in dollars
    - is_available: Whether currently in stock
    - preparation_time: Minutes needed to prepare
    """
    
    # Item type choices
    class ItemType(models.TextChoices):
        COFFEE = 'COFFEE', 'Coffee'
        DESSERT = 'DESSERT', 'Dessert'
    
    # Basic item information
    title = models.CharField(
        max_length=200,
        help_text="Display name of the menu item"
    )
    
    description = models.TextField(
        blank=True,
        help_text="Detailed description of the item"
    )
    
    # Image uploaded by admin
    image = models.ImageField(
        upload_to='menu_items/',
        blank=True,
        null=True,
        help_text="Product image displayed in app"
    )
    
    # Category: coffee or dessert
    item_type = models.CharField(
        max_length=20,
        choices=ItemType.choices,
        help_text="Category: coffee or dessert"
    )
    
    # Price in dollars (max 9999.99)
    price = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Base price in dollars"
    )
    
    # Whether item is available for ordering
    is_available = models.BooleanField(
        default=True,
        help_text="Whether item is currently available for ordering"
    )
    
    # Estimated preparation time in minutes
    preparation_time = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1)],
        help_text="Estimated preparation time in minutes"
    )
    
    # Metadata timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When item was added to menu"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Last time item details were updated"
    )
    
    class Meta:
        # Order by type then title by default
        ordering = ['item_type', 'title']
        # Add index for faster filtering
        indexes = [
            models.Index(fields=['item_type', 'is_available']),
        ]
    
    def __str__(self):
        """String representation of menu item"""
        return f"{self.title} ({self.item_type})"


# ============================================================================
# ORDER MODEL
# ============================================================================

class Order(models.Model):
    """
    Order model representing a customer's purchase.
    Tracks order status and manages the order lifecycle.
    
    Status workflow: RECEIVED → PREPARING → READY → COMPLETED
    
    Fields:
    - customer: Who placed the order
    - status: Current order status
    - total_price: Total cost
    - notes: Special instructions
    - scheduled_for: Future pickup time (optional)
    - is_favourite: Whether saved as template
    """
    
    # Order status workflow
    class OrderStatus(models.TextChoices):
        RECEIVED = 'RECEIVED', 'Received'        # Order just placed
        PREPARING = 'PREPARING', 'Preparing'     # Barista is making it
        READY = 'READY', 'Ready'                 # Ready for pickup
        COMPLETED = 'COMPLETED', 'Completed'     # Customer picked up
        CANCELLED = 'CANCELLED', 'Cancelled'     # Order was cancelled
    
    # Foreign key to customer who placed the order
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        help_text="Customer who placed this order"
    )
    
    # Current status of the order
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.RECEIVED,
        help_text="Current status of the order"
    )
    
    # Total order cost including all items
    total_price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Total order cost including all items"
    )
    
    # Special instructions from customer
    notes = models.TextField(
        blank=True,
        help_text="Special instructions from customer"
    )
    
    # Future time when order should be prepared (optional)
    scheduled_for = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Future time when order should be prepared"
    )
    
    # Whether customer saved this as favorite template
    is_favourite = models.BooleanField(
        default=False,
        help_text="Whether customer saved this as favorite"
    )
    
    # Timestamps for tracking order lifecycle
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When order was placed"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Last status update time"
    )
    
    completed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When order was completed/picked up"
    )
    
    class Meta:
        # Most recent orders first
        ordering = ['-created_at']
        # Add indexes for faster queries
        indexes = [
            models.Index(fields=['customer', '-created_at']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['scheduled_for']),
        ]
    
    def __str__(self):
        """String representation of order"""
        return f"Order #{self.id} - {self.customer.username} ({self.status})"
    
    def can_be_modified(self):
        """
        Check if order can still be changed or cancelled.
        Only RECEIVED orders can be modified.
        """
        return self.status == self.OrderStatus.RECEIVED
    
    def calculate_points(self):
        """
        Calculate loyalty points earned from this order.
        Rule: 1 point per dollar spent
        """
        return int(self.total_price)


# ============================================================================
# ORDER ITEM MODEL
# ============================================================================

class OrderItem(models.Model):
    """
    Individual items within an order.
    Links menu items to orders with quantities and customizations.
    
    Fields:
    - order: Parent order
    - menu_item: Which menu item was ordered
    - quantity: How many
    - price: Price at time of order (captures menu item price)
    - customizations: Custom modifications (e.g., "extra shot")
    """
    
    # Links to parent order
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        help_text="Parent order this item belongs to"
    )
    
    # Links to menu item being ordered
    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE,
        help_text="Menu item being ordered"
    )
    
    # Quantity of this item
    quantity = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Number of this item in order"
    )
    
    # Price at time of order (captures menu item price at that moment)
    price = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Price at time of order (captures menu item price)"
    )
    
    # Customization notes (e.g., "extra shot", "almond milk", "no sugar")
    customizations = models.TextField(
        blank=True,
        help_text="Custom modifications to this item"
    )
    
    class Meta:
        # Index for faster order item lookups
        indexes = [
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        """String representation of order item"""
        return f"{self.quantity}x {self.menu_item.title}"
    
    def get_total_price(self):
        """Calculate total price for this line item (price × quantity)"""
        return self.price * self.quantity


# ============================================================================
# FAVOURITE ORDER MODEL
# ============================================================================

class FavouriteOrder(models.Model):
    """
    Saved order templates that customers can quickly reorder.
    Stores complete order configuration for one-click ordering.
    
    Fields:
    - customer: Who saved this template
    - name: Customer's name for this template
    - template_order: Order that serves as template
    """
    
    # Links to customer who saved this
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favourites',
        help_text="Customer who saved this template"
    )
    
    # Customer's name for this saved order
    name = models.CharField(
        max_length=200,
        help_text="Customer's name for this saved order"
    )
    
    # Links to the original order used as template
    template_order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        help_text="Order that serves as template"
    )
    
    # When template was created
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When template was saved"
    )
    
    class Meta:
        ordering = ['-created_at']
        # Ensure unique names per customer
        unique_together = ['customer', 'name']
        indexes = [
            models.Index(fields=['customer', '-created_at']),
        ]
    
    def __str__(self):
        """String representation of favourite order"""
        return f"{self.customer.username}'s {self.name}"


# ============================================================================
# LOYALTY OFFER MODEL
# ============================================================================

class LoyaltyOffer(models.Model):
    """
    Promotional offers that customers can redeem with points.
    Managed by admin to incentivize customer loyalty.
    
    Fields:
    - title: Offer name
    - description: What customer gets
    - points_required: Points needed to redeem
    - is_active: Whether currently available
    - valid_from: When offer becomes available
    - valid_until: When offer expires (null = never)
    """
    
    # Offer name displayed to customers
    title = models.CharField(
        max_length=200,
        help_text="Offer name displayed to customers"
    )
    
    # What customer gets with this offer
    description = models.TextField(
        help_text="What customer gets with this offer"
    )
    
    # Points needed to redeem this offer
    points_required = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Points needed to redeem this offer"
    )
    
    # Whether offer is currently available
    is_active = models.BooleanField(
        default=True,
        help_text="Whether offer is currently available"
    )
    
    # Validity period
    valid_from = models.DateTimeField(
        help_text="When offer becomes available"
    )
    
    valid_until = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When offer expires (null = never expires)"
    )
    
    # When offer was created
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['points_required']
        indexes = [
            models.Index(fields=['is_active', 'valid_from']),
        ]
    
    def __str__(self):
        """String representation of loyalty offer"""
        return f"{self.title} ({self.points_required} points)"


# ============================================================================
# NOTIFICATION MODEL
# ============================================================================

class Notification(models.Model):
    """
    Notification log for tracking all notifications sent to users.
    Stores notification history for reference and debugging.
    
    Fields:
    - user: Who received the notification
    - notification_type: Category of notification
    - title: Notification headline
    - message: Notification body text
    - order: Related order (optional)
    - is_read: Whether user has seen it
    - sent_at: When it was sent
    """
    
    # Notification types
    class NotificationType(models.TextChoices):
        ORDER_RECEIVED = 'ORDER_RECEIVED', 'Order Received'
        ORDER_PREPARING = 'ORDER_PREPARING', 'Order Preparing'
        ORDER_READY = 'ORDER_READY', 'Order Ready'
        ORDER_COMPLETED = 'ORDER_COMPLETED', 'Order Completed'
        ORDER_CANCELLED = 'ORDER_CANCELLED', 'Order Cancelled'
        PROMOTION = 'PROMOTION', 'Promotional'
    
    # Recipient of notification
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        help_text="User who received notification"
    )
    
    # Category of notification
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        help_text="Category of notification"
    )
    
    # Notification headline
    title = models.CharField(
        max_length=200,
        help_text="Notification headline"
    )
    
    # Notification body text
    message = models.TextField(
        help_text="Notification body text"
    )
    
    # Optional link to related order
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='notifications',
        help_text="Related order if applicable"
    )
    
    # Whether user has seen notification
    is_read = models.BooleanField(
        default=False,
        help_text="Whether user has seen notification"
    )
    
    # When notification was sent
    sent_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When notification was sent"
    )
    
    class Meta:
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['user', '-sent_at']),
            models.Index(fields=['user', 'is_read']),
        ]
    
    def __str__(self):
        """String representation of notification"""
        return f"{self.notification_type} to {self.user.username}"