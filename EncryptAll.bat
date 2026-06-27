@echo off
chcp 65001 >nul
title FileVault — Enkripsi

setlocal DisableDelayedExpansion

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo ╔══════════════════════════════════════╗
echo ║         FileVault — ENKRIPSI         ║
echo ╚══════════════════════════════════════╝
echo.
echo Folder target: "%ROOT%"
echo.

set /p "PW=Masukkan password ENKRIPSI: "
if "%PW%"=="" (
  echo [ERROR] Password tidak boleh kosong!
  pause
  exit /b
)

set /p "DELCHOICE=Hapus file asli setelah enkripsi? (y/N): "
if /I "%DELCHOICE%"=="y" (
  set "DELFLAG=delete"
) else (
  set "DELFLAG="
)

echo.
node "%~dp0encrypt-recursive.js" "%ROOT%" "%PW%" "%DELFLAG%"

echo.
echo ══════════════════════════════════════
echo  SELESAI
echo ══════════════════════════════════════
pause
endlocal
