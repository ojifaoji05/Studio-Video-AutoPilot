@echo off
echo ==========================================
echo    AutoPilot Studio - Update Script
echo ==========================================
echo Fetching latest updates from Git repository...
git pull
echo Installing any new dependencies...
npm install --legacy-peer-deps
echo.
echo AutoPilot Studio has been updated successfully!
pause
