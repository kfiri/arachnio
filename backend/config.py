import os

DEBUG = True

PROJECT_FOLDER = os.path.dirname(os.path.dirname(__file__))
STATIC_FOLDER = os.path.join(PROJECT_FOLDER, 'frontend', 'static')
TEMPLATE_FOLDER = os.path.join(PROJECT_FOLDER, 'frontend', 'templates')
TEMP_FOLDER = r'C:\Temp\arachnio' if os.name == 'nt' else '/tmp'

IP = '0.0.0.0'

PORT = 10946

# Game related values
WIDTH = 14
HEIGHT = 16
IS_CYCLIC = False
