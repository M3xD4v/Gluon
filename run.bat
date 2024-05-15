@echo off

rem Change directory to the location of the batch file
cd /d %~dp0

rem Run the Node.js script
npm run start

rem Keep the console open
pause