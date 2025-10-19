"""
WebSocket URL routing for real-time features.
Defines WebSocket endpoint patterns and connects them to consumers.
"""

from django.urls import re_path
from . import consumers

# WebSocket URL patterns
# These define the WebSocket endpoints available to clients
websocket_urlpatterns = [
    # WebSocket for real-time order status updates
    # URL: ws://localhost:8000/ws/orders/<order_id>/
    # Clients connect to this to receive live updates about a specific order
    re_path(
        r'ws/orders/(?P<order_id>\d+)/$',
        consumers.OrderStatusConsumer.as_asgi()
    ),
]