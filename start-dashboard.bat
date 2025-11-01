@echo off
REM Start the app in production mode
start cmd /k "npm run build && npm run start"

REM Wait 5 seconds for the app to start
timeout /t 5 >nul

REM Open the default browser to localhost:3000
start http://localhost:3000
