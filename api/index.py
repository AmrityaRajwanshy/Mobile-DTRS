import sys
import os

# Add root directory and Backend directory to sys.path so modules and datasets resolve
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..'))

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

backend_dir = os.path.join(PROJECT_ROOT, 'Backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import FastAPI application instance from AppServer
from Backend.AppServer import app

# Vercel expects the ASGI application to be named `app`
__all__ = ['app']
