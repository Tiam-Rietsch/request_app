@echo off
echo ========================================
echo Quick Start - Systeme de Gestion de Requetes
echo ========================================
echo.

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Creating superuser (admin account)...
echo Default suggested username: admin
echo Default suggested email: admin@example.com
python manage.py createsuperuser

echo.
echo Populating test data...
python manage.py populate_testdata

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Starting development server...
echo.
echo You can now access:
echo - Django Admin: http://localhost:8000/admin/
echo - Swagger UI: http://localhost:8000/api/schema/swagger-ui/
echo - API Root: http://localhost:8000/api/
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver
