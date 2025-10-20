"""
Django admin configuration.
Registers models with the admin interface for easy management.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import *

# ============================================================================
# USER ADMIN
# ============================================================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin interface for User model.
    Extends Django's default UserAdmin with custom fields.
    """
    
    # Fields to display in user list
    list_display = [
        'username', 'email', 'role', 'loyalty_points',
        'notification_enabled', 'is_active', 'date_joined'
    ]
    
    # Filters in sidebar
    list_filter = ['role', 'is_active', 'notification_enabled', 'date_joined']
    
    # Search functionality
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    
    # Add custom fields to user edit form
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {
            'fields': ('role', 'phone', 'loyalty_points', 'push_token', 'notification_enabled')
        }),
    )
    
    # Fields to show when creating new user
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Custom Fields', {
            'fields': ('role', 'phone', 'notification_enabled')
        }),
    )


# ============================================================================
# MENU ITEM ADMIN
# ============================================================================

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    """
    Admin interface for MenuItem model.
    Allows managing coffee and dessert menu items.
    """
    
    # Fields to display in list view
    list_display = [
        'title', 'item_type', 'price', 'is_available',
        'preparation_time', 'created_at'
    ]
    
    # Filters in sidebar
    list_filter = ['item_type', 'is_available', 'created_at']
    
    # Search functionality
    search_fields = ['title', 'description']
    
    # Fields that can be edited directly from list view
    list_editable = ['price', 'is_available', 'preparation_time']
    
    # Default ordering (newest first)
    ordering = ['-created_at']
    
    # Organize fields into sections in edit form
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'item_type')
        }),
        ('Pricing & Availability', {
            'fields': ('price', 'is_available', 'preparation_time')
        }),
        ('Media', {
            'fields': ('image',)
        }),
    )


# ============================================================================
# ORDER ITEM INLINE
# ============================================================================

class OrderItemInline(admin.TabularInline):
    """
    Inline admin for OrderItem.
    Allows editing order items directly within Order admin page.
    """
    model = OrderItem
    extra = 0  # Don't show empty forms by default
    
    # Fields to display in inline table
    fields = ['menu_item', 'quantity', 'price', 'customizations']
    readonly_fields = []  # Can edit all fields


# ============================================================================
# ORDER ADMIN
# ============================================================================

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """
    Admin interface for Order model.
    Shows order details with inline order items.
    """
    
    # Fields to display in list view
    list_display = [
        'id', 'customer', 'status', 'total_price',
        'is_favourite', 'scheduled_for', 'created_at'
    ]
    
    # Filters in sidebar
    list_filter = ['status', 'is_favourite', 'created_at', 'scheduled_for']
    
    # Search by customer name, email, or order ID
    search_fields = [
        'customer__username', 'customer__email',
        'customer__first_name', 'customer__last_name', 'id'
    ]
    
    # Fields that can be edited from list view
    list_editable = ['status']
    
    # Default ordering (newest first)
    ordering = ['-created_at']
    
    # Read-only fields in edit form
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    
    # Show order items inline
    inlines = [OrderItemInline]
    
    # Organize fields into sections
    fieldsets = (
        ('Customer Information', {
            'fields': ('customer',)
        }),
        ('Order Details', {
            'fields': ('status', 'total_price', 'notes')
        }),
        ('Scheduling & Favorites', {
            'fields': ('scheduled_for', 'is_favourite')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)  # Collapsed by default
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """
        Override save to handle status changes.
        Award points when order is completed.
        """
        # Check if status changed
        if change:
            old_obj = Order.objects.get(pk=obj.pk)
            if old_obj.status != obj.status:
                # Status changed - notification will be sent by serializer
                if obj.status == Order.OrderStatus.COMPLETED and not obj.completed_at:
                    from django.utils import timezone
                    obj.completed_at = timezone.now()
        
        super().save_model(request, obj, form, change)


# ============================================================================
# FAVOURITE ORDER ADMIN
# ============================================================================

@admin.register(FavouriteOrder)
class FavouriteOrderAdmin(admin.ModelAdmin):
    """
    Admin interface for FavouriteOrder model.
    Shows saved order templates.
    """
    
    # Fields to display in list view
    list_display = ['name', 'customer', 'template_order', 'created_at']
    
    # Filters in sidebar
    list_filter = ['created_at']
    
    # Search by customer or favourite name
    search_fields = ['name', 'customer__username', 'customer__email']
    
    # Default ordering (newest first)
    ordering = ['-created_at']
    
    # Read-only fields
    readonly_fields = ['created_at']


# ============================================================================
# LOYALTY OFFER ADMIN
# ============================================================================

@admin.register(LoyaltyOffer)
class LoyaltyOfferAdmin(admin.ModelAdmin):
    """
    Admin interface for LoyaltyOffer model.
    Allows creating and managing promotional offers.
    """
    
    # Fields to display in list view
    list_display = [
        'title', 'points_required', 'is_active',
        'valid_from', 'valid_until', 'created_at'
    ]
    
    # Filters in sidebar
    list_filter = ['is_active', 'valid_from', 'valid_until', 'created_at']
    
    # Search by title or description
    search_fields = ['title', 'description']
    
    # Fields that can be edited from list view
    list_editable = ['is_active']
    
    # Default ordering (by points required)
    ordering = ['points_required']
    
    # Read-only fields
    readonly_fields = ['created_at']
    
    # Organize fields into sections
    fieldsets = (
        ('Offer Details', {
            'fields': ('title', 'description', 'points_required')
        }),
        ('Availability', {
            'fields': ('is_active', 'valid_from', 'valid_until')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


# ============================================================================
# NOTIFICATION ADMIN
# ============================================================================

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """
    Admin interface for Notification model.
    Shows notification history and allows manual notification creation.
    """
    
    # Fields to display in list view
    list_display = [
        'notification_type', 'user', 'title',
        'is_read', 'order', 'sent_at'
    ]
    
    # Filters in sidebar
    list_filter = ['notification_type', 'is_read', 'sent_at']
    
    # Search by user or notification content
    search_fields = [
        'user__username', 'user__email',
        'title', 'message'
    ]
    
    # Default ordering (newest first)
    ordering = ['-sent_at']
    
    # Read-only fields
    readonly_fields = ['sent_at']
    
    # Organize fields into sections
    fieldsets = (
        ('Recipient', {
            'fields': ('user',)
        }),
        ('Notification Content', {
            'fields': ('notification_type', 'title', 'message')
        }),
        ('Related Data', {
            'fields': ('order', 'is_read')
        }),
        ('Metadata', {
            'fields': ('sent_at',),
            'classes': ('collapse',)
        }),
    )


# ============================================================================
# Loyalty Redemption Admin
# ============================================================================

@admin.register(LoyaltyRedemption)
class LoyaltyRedemptionAdmin(admin.ModelAdmin):
    """
    Admin interface for loyalty redemptions.
    Allows viewing and managing customer redemptions.
    """
    
    list_display = [
        'id', 'customer', 'loyalty_offer', 'redemption_code',
        'points_spent', 'is_used', 'redeemed_at'
    ]
    
    list_filter = [
        'is_used', 'redeemed_at', 'loyalty_offer'
    ]
    
    search_fields = [
        'customer__username', 'customer__email',
        'redemption_code', 'loyalty_offer__title'
    ]
    
    readonly_fields = [
        'customer', 'loyalty_offer', 'points_spent',
        'redemption_code', 'redeemed_at'
    ]
    
    ordering = ['-redeemed_at']
    
    # Allow filtering by date
    date_hierarchy = 'redeemed_at'
    
    def has_add_permission(self, request):
        """Prevent manual creation of redemptions in admin"""
        return False


# ============================================================================
# ADMIN SITE CUSTOMIZATION
# ============================================================================

# Customize admin site header and title
admin.site.site_header = "Coffee Shop Admin"
admin.site.site_title = "Coffee Shop Admin Portal"
admin.site.index_title = "Welcome to Coffee Shop Administration"