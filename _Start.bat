@echo off
title FileVault Launcher

REM Pindah ke folder tempat file BAT berada
cd /d "%~dp0"

echo Menjalankan FileVault...
echo.

REM Jalankan aplikasi Electron
call npm start

echo.
echo Aplikasi ditutup.
pause
```
