@echo off
echo ==========================================
echo    QUICKPOLL EMERGENCY STORAGE CLEANER
echo ==========================================
echo.
echo [1/3] Stopping Jenkins Service (to unlock files)...
net stop jenkins 2>nul

echo [2/3] Wiping Jenkins Workspaces and Builds...
rmdir /s /q "C:\ProgramData\Jenkins\.jenkins\workspace" 2>nul
rmdir /s /q "C:\ProgramData\Jenkins\.jenkins\jobs\QuickPoll-CI\builds" 2>nul

echo [3/3] Cleaning project temp folders...
rmdir /s /q "frontend\.next" 2>nul
rmdir /s /q "node_modules" 2>nul
rmdir /s /q "frontend\node_modules" 2>nul
rmdir /s /q "backend\node_modules" 2>nul

echo.
echo [DONE] Starting Jenkins Service back up...
net start jenkins 2>nul

echo.
echo ==========================================
echo CLEANUP COMPLETE! Please check your storage.
echo ==========================================
pause
