@echo off
title WMS Analytics Hub - Servidor Local (solo Node, sin npm)

REM Carpeta donde esta este .bat (el proyecto)
set "PROYECTO=%~dp0"

REM Carpeta de Node portable (debe estar DENTRO del proyecto)
set "NODE_DIR=%PROYECTO%node-v24.20.0-win-x64"
set "NODE_EXE=%NODE_DIR%\node.exe"

echo =======================================================
echo   WMS Analytics Hub - Servidor Local
echo =======================================================
echo.

REM Verificar que exista node.exe portable
if not exist "%NODE_EXE%" (
    echo [ERROR] No se encontro node.exe en: %NODE_DIR%
    echo Revisa que la carpeta de Node este dentro del proyecto.
    pause
    exit /b 1
)

echo [INFO] Usando Node desde: %NODE_EXE%
"%NODE_EXE%" -v
echo.

REM Verificar que node_modules ya este instalado
REM (esto NO puede generarse sin npm, debe existir de antes)
if not exist "%PROYECTO%node_modules\vite\bin\vite.js" (
    echo [ERROR] No se encontro node_modules\vite\bin\vite.js
    echo.
    echo Esto significa que las dependencias del proyecto (vite, react, etc.)
    echo no estan instaladas todavia, y no se pueden instalar sin npm.
    echo.
    echo Opciones:
    echo   1. Pide a alguien que SI tenga npm que corra "npm install" una vez
    echo      y te copie la carpeta node_modules resultante.
    echo   2. O intenta habilitar npm portable ^(ver mensaje anterior^).
    echo.
    pause
    exit /b 1
)

echo [INFO] Dependencias encontradas. Iniciando servidor de desarrollo...
echo (Para detener el servidor, presiona Ctrl+C en esta ventana)
echo.

REM Ejecuta el script de Vite DIRECTAMENTE con node, sin pasar por npm
"%NODE_EXE%" "%PROYECTO%node_modules\vite\bin\vite.js"

pause