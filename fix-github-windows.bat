@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════╗
echo ║  FIX RÁPIDO GITHUB - WINDOWS          ║
echo ║  Banque Alimentaire System            ║
echo ╚════════════════════════════════════════╝
echo.

echo Verificando Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Git no está instalado o no está en PATH
    pause
    exit /b 1
)
echo ✓ Git encontrado
echo.

echo Limpiando staging area...
git reset >nul 2>&1
echo ✓ Limpio
echo.

echo Agregando .gitignore...
git add .gitignore
echo.

echo Agregando archivos esenciales...
git add package.json 2>nul
git add vite.config.ts 2>nul
git add postcss.config.mjs 2>nul
git add tsconfig.json 2>nul
git add index.html 2>nul
git add netlify.toml 2>nul
git add vercel.json 2>nul
git add _config.yml 2>nul
git add src/ 2>nul
git add public/manifest.json 2>nul
git add public/robots.txt 2>nul
git add public/sw.js 2>nul
git add public/favicon.svg 2>nul
git add README.md 2>nul
git add LICENSE 2>nul
echo ✓ Archivos agregados
echo.

echo Archivos listos para commit:
git diff --cached --name-only | find /c /v ""
echo.

set /p CONTINUAR="¿Continuar con commit y push? (S/N): "
if /i not "%CONTINUAR%"=="S" (
    echo Operación cancelada
    pause
    exit /b 0
)

echo.
echo Creando commit...
git commit -m "Sistema Banque Alimentaire completo" >nul 2>&1
if errorlevel 1 (
    echo ✗ Error al crear commit
    pause
    exit /b 1
)
echo ✓ Commit creado
echo.

echo Enviando a GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo Push normal falló.
    set /p FORCE="¿Hacer push con --force? (S/N): "
    if /i "%FORCE%"=="S" (
        git push -f origin main
        if errorlevel 1 (
            echo.
            echo ✗ Push forzado también falló
            echo.
            echo Verifica:
            echo 1. Tu autenticación (token o SSH)
            echo 2. Que no haya archivos demasiado grandes
            echo 3. Permisos en el repositorio
            pause
            exit /b 1
        )
        echo ✓ Push forzado exitoso
    ) else (
        echo Push cancelado
        pause
        exit /b 0
    )
) else (
    echo ✓ Push exitoso
)

echo.
echo ╔════════════════════════════════════════╗
echo ║         ✅ PROCESO COMPLETADO          ║
echo ╚════════════════════════════════════════╝
echo.
pause
