"""
ASGI config for coffee_shop project.
Handles both HTTP and WebSocket connections for real-time features.
"""

import os
from django.core.asgi import get_asgi_application

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Main.settings')

# Initialize Django ASGI application
# This handles standard HTTP requests
django_asgi_app = get_asgi_application()

# Import channels components after Django is initialized
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from api.routing import websocket_urlpatterns

# ASGI application that routes by protocol type
# - 'http': Standard HTTP requests go to Django
# - 'websocket': WebSocket connections for real-time order updates
application = ProtocolTypeRouter({
    # Handle HTTP requests with Django
    'http': django_asgi_app,
    
    # Handle WebSocket connections
    # AuthMiddlewareStack adds user authentication to WebSocket connections
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})