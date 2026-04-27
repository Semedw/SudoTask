import os

from .settings import *  # noqa: F403,F401


DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver']

DATABASES['default']['HOST'] = os.getenv('TEST_DB_HOST', 'localhost')  # noqa: F405
DATABASES['default']['PORT'] = os.getenv('TEST_DB_PORT', '5433')  # noqa: F405

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
