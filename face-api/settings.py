import os

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

TEMP_DATA_DIR_NAME = '.temp'

TEMP_DATA_DIR = os.path.join(ROOT_DIR, TEMP_DATA_DIR_NAME)

WEIGHTS_DIR = os.path.join(ROOT_DIR, 'weights')

# API

API_PORT = int(os.getenv('FACE_API_PORT', default=8080))
DEBUG = bool(os.getenv('FACE_API_DEBUG', default=False))
FILE_UPLOAD_DIR = os.path.join(ROOT_DIR, str(os.getenv('FACE_API_FILE_UPLOAD_DIR', default='uploads')))
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
