@echo off
echo Stopping Online Judge Services...

echo Killing all Node.js processes...
taskkill /f /im node.exe
taskkill /f /im nodemon.exe

echo All services stopped.
pause 