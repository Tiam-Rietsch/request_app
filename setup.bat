@echo off
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing requirements...
pip install -r requirements.txt

echo.
echo Setup complete! Virtual environment is activated.
echo To activate the virtual environment manually, run: venv\Scripts\activate.bat
