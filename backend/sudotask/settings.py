"""
Django settings for sudotask project.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {'1', 'true', 'yes', 'on'}


def env_list(name: str, default: str = '') -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(',') if item.strip()]


def normalize_auth_cookie_samesite(value: str) -> str:
    raw = (value or '').strip().lower()
    mapping = {
        'lax': 'Lax',
        'strict': 'Strict',
        'none': 'None',
    }
    if raw not in mapping:
        raise RuntimeError('AUTH_COOKIE_SAMESITE must be one of: Lax, Strict, None.')
    return mapping[raw]


def validate_auth_cookie_domain(value: str | None) -> str | None:
    if value is None:
        return None
    domain = value.strip()
    if not domain:
        return None
    if '://' in domain or '/' in domain or ':' in domain or any(ch.isspace() for ch in domain):
        raise RuntimeError(
            'AUTH_COOKIE_DOMAIN must be a plain host/domain without scheme, path, port, or spaces.'
        )
    return domain


def running_in_container() -> bool:
    return os.path.exists('/.dockerenv')


def resolve_database_host_port(host: str | None, port: str | None, *, in_container: bool) -> tuple[str, str]:
    resolved_host = (host or 'localhost').strip() or 'localhost'
    resolved_port = str(port or '5433').strip() or '5433'

    if not in_container and resolved_host == 'db' and resolved_port == '5432':
        return 'localhost', '5433'

    return resolved_host, resolved_port


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-this-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env_bool('DEBUG', False)
LOCAL_DEV_MODE = env_bool('LOCAL_DEV_MODE', DEBUG)

ALLOWED_HOSTS = env_list(
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1' if DEBUG else ''
)

if not DEBUG and not ALLOWED_HOSTS:
    raise RuntimeError('ALLOWED_HOSTS must be configured when DEBUG is False.')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    
    # Local apps
    'accounts',
    'classroom',
    'tasks',
    'submissions',
    'judge',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sudotask.urls'

# Enable automatic slash appending for API routes
APPEND_SLASH = True

# Disable automatic slash appending to prevent POST redirect issues
APPEND_SLASH = False

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

WSGI_APPLICATION = 'sudotask.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASE_HOST, DATABASE_PORT = resolve_database_host_port(
    os.getenv('DB_HOST', 'localhost'),
    os.getenv('DB_PORT', '5433'),
    in_container=running_in_container(),
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'sudotask'),
        'USER': os.getenv('DB_USER', 'admin'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'admin'),
        'HOST': DATABASE_HOST,
        'PORT': DATABASE_PORT,
    }
}


# Custom User Model
AUTH_USER_MODEL = 'accounts.User'


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

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
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'accounts.authentication.CookieJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': env_bool('JWT_ROTATE_REFRESH_TOKENS', False),
    'BLACKLIST_AFTER_ROTATION': env_bool('JWT_BLACKLIST_AFTER_ROTATION', False),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# Auth cookie settings
AUTH_ACCESS_COOKIE_NAME = os.getenv('AUTH_ACCESS_COOKIE_NAME', 'access_token')
AUTH_REFRESH_COOKIE_NAME = os.getenv('AUTH_REFRESH_COOKIE_NAME', 'refresh_token')
AUTH_COOKIE_SECURE = env_bool('AUTH_COOKIE_SECURE', not DEBUG)
AUTH_COOKIE_SAMESITE = normalize_auth_cookie_samesite(os.getenv('AUTH_COOKIE_SAMESITE', 'Lax'))
AUTH_COOKIE_DOMAIN = validate_auth_cookie_domain(os.getenv('AUTH_COOKIE_DOMAIN') or None)

if AUTH_COOKIE_SAMESITE == 'None' and not AUTH_COOKIE_SECURE:
    raise RuntimeError('AUTH_COOKIE_SECURE must be True when AUTH_COOKIE_SAMESITE is None.')

# CORS Settings
CORS_ALLOWED_ORIGINS = env_list(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000' if DEBUG else ''
)

CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = env_list(
    'CSRF_TRUSTED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000' if DEBUG else ''
)

# Security settings
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = env_bool('USE_X_FORWARDED_HOST', not LOCAL_DEV_MODE)
SECURE_SSL_REDIRECT = env_bool('SECURE_SSL_REDIRECT', not LOCAL_DEV_MODE)
SESSION_COOKIE_SECURE = env_bool('SESSION_COOKIE_SECURE', not LOCAL_DEV_MODE)
CSRF_COOKIE_SECURE = env_bool('CSRF_COOKIE_SECURE', not LOCAL_DEV_MODE)
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False
X_FRAME_OPTIONS = os.getenv('X_FRAME_OPTIONS', 'DENY')
SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '0' if LOCAL_DEV_MODE else '3600'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool('SECURE_HSTS_INCLUDE_SUBDOMAINS', not LOCAL_DEV_MODE)
SECURE_HSTS_PRELOAD = env_bool('SECURE_HSTS_PRELOAD', False)
SECURE_CONTENT_TYPE_NOSNIFF = env_bool('SECURE_CONTENT_TYPE_NOSNIFF', True)

# Celery Configuration
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Judge Settings
JUDGE_DOCKER_IMAGE = os.getenv('JUDGE_DOCKER_IMAGE', 'python:3.11-slim')
JUDGE_TIMEOUT_SECONDS = int(os.getenv('JUDGE_TIMEOUT_SECONDS', '2'))
JUDGE_MEMORY_LIMIT_MB = int(os.getenv('JUDGE_MEMORY_LIMIT_MB', '256'))
JUDGE_CPU_LIMIT = os.getenv('JUDGE_CPU_LIMIT', '0.5')
JUDGE_WORKSPACE_DIR = os.getenv('JUDGE_WORKSPACE_DIR', None)

# Spectacular Settings (OpenAPI)
SPECTACULAR_SETTINGS = {
    'TITLE': 'SudoTask API',
    'DESCRIPTION': 'Backend API for SudoTask - A programming task platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
