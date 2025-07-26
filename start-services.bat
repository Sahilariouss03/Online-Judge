@echo off
echo Starting Online Judge Services...

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend  && nodemon index.js"

echo Starting Compiler Service...
start "Compiler Service" cmd /k "cd Compiler  && npm run start"

echo Starting Frontend...
start "Frontend" cmd /k "cd Frontend  && npm run dev"

echo All services are starting...
echo Backend: http://localhost:3000
echo Compiler: http://localhost:5000
echo Frontend: http://localhost:5173
pause 