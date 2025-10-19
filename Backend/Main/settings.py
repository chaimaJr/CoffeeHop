"""
Django settings for coffee_shop project.
This file configures all Django project settings including installed apps,
middleware, database configuration, and REST framework settings.
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-your-secret-key-change-this-in-production'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Allowed hosts for the application
ALLOWED_HOSTS = ['*']

# Application definition - all installed Django apps and third-party packages
INSTALLED_APPS = [
    'django.contrib.admin',  # Admin interface
    'django.contrib.auth',  # Authentication framework
    'django.contrib.contenttypes',  # Content type system
    'django.contrib.sessions',  # Session framework
    'django.contrib.messages',  # Messaging framework
    'django.contrib.staticfiles',  # Static files management
    
    # Third party apps
    'rest_framework',  # Django REST framework for building APIs
    'rest_framework.authtoken',  # Token-based authentication
    'corsheaders',  # Handle Cross-Origin Resource Sharing (CORS)
    'django_filters',  # Filtering support for querysets
    'channels',  # WebSocket support for real-time features
    
    # Local apps
    'api',  # Our main API application
]

# Middleware - processes requests/responses globally
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS middleware (must be before CommonMiddleware)
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Root URL configuration
ROOT_URLCONF = 'Main.urls'

# Template configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI application for synchronous requests
WSGI_APPLICATION = 'Main.wsgi.application'

# ASGI application for WebSocket/async support (real-time order tracking)
ASGI_APPLICATION = 'Main.asgi.application'

# Database configuration - using SQLite for development
# For production, switch to PostgreSQL
DATABASE_ROUTERS = []
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Use custom user model that extends Django's AbstractUser
# THIS MUST BE SET BEFORE RUNNING MIGRATIONS
AUTH_USER_MODEL = 'api.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (user uploads like menu item images)
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework configuration
REST_FRAMEWORK = {
    # Use token authentication - clients send token in Authorization header
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',  # For browsable API
    ],
    # Default permissions - require authentication for all endpoints
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    # Pagination settings - return max 100 items per page
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,
    # Enable filtering support
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
        'rest_framework.filters.SearchFilter',
    ],
}

# CORS settings - allow Ionic app to make requests from any origin
# In production, replace with your actual Ionic app URL
CORS_ALLOW_ALL_ORIGINS = True  # For development only
CORS_ALLOW_CREDENTIALS = True

# Channels configuration for WebSocket support (real-time order updates)
CHANNEL_LAYERS = {
    'default': {
        # Using in-memory channel layer for development
        # For production, use Redis: 'channels_redis.core.RedisChannelLayer'
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    }
}