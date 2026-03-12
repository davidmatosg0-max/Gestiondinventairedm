#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║  FIX RÁPIDO - GITHUB PUSH             ║"
echo "║  Banque Alimentaire System            ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar paso
step() {
    echo -e "${GREEN}➜${NC} $1"
}

# Función para advertencia
warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Función para error
error() {
    echo -e "${RED}✗${NC} $1"
}

# Paso 1: Verificar si estamos en un repositorio git
if [ ! -d ".git" ]; then
    error "No estás en un repositorio Git"
    echo "Ejecuta: git init"
    exit 1
fi

# Paso 2: Verificar si hay remote configurado
REMOTE=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE" ]; then
    warn "No hay remote 'origin' configurado"
    read -p "Ingresa la URL de tu repositorio GitHub: " REMOTE_URL
    git remote add origin "$REMOTE_URL"
    step "Remote configurado: $REMOTE_URL"
else
    step "Remote encontrado: $REMOTE"
fi
echo ""

# Paso 3: Limpiar staging area
step "Limpiando staging area..."
git reset > /dev/null 2>&1
echo "   ✓ Limpio"
echo ""

# Paso 4: Agregar .gitignore
step "Configurando .gitignore..."
if [ -f ".gitignore" ]; then
    echo "   ✓ .gitignore existe"
else
    warn ".gitignore no existe (debería haber sido creado)"
fi
git add .gitignore
echo ""

# Paso 5: Agregar archivos esenciales
step "Agregando archivos esenciales..."

# Configuración
git add package.json 2>/dev/null
git add vite.config.ts 2>/dev/null
git add postcss.config.mjs 2>/dev/null
git add tsconfig.json 2>/dev/null
git add index.html 2>/dev/null

# Deploy configs
git add netlify.toml 2>/dev/null
git add vercel.json 2>/dev/null
git add _config.yml 2>/dev/null

# Source code
git add src/ 2>/dev/null

# Public files (selective)
git add public/manifest.json 2>/dev/null
git add public/robots.txt 2>/dev/null
git add public/sw.js 2>/dev/null
git add public/favicon.svg 2>/dev/null
git add public/*.svg 2>/dev/null
git add public/*.html 2>/dev/null
git add public/_headers 2>/dev/null
git add public/_redirects 2>/dev/null

# Docs
git add README.md 2>/dev/null
git add LICENSE 2>/dev/null
git add CONTRIBUTING.md 2>/dev/null
git add ATTRIBUTIONS.md 2>/dev/null

# Important guides (selectivos)
git add CHANGELOG.md 2>/dev/null
git add DEPLOY.md 2>/dev/null
git add DEPLOYMENT_GUIDE.md 2>/dev/null

echo "   ✓ Archivos agregados"
echo ""

# Paso 6: Verificar archivos problemáticos
step "Verificando archivos problemáticos..."

PROBLEM_FILES=0

# Verificar node_modules
if git diff --cached --name-only | grep -q "node_modules"; then
    error "node_modules está en staging"
    git reset -- node_modules/
    PROBLEM_FILES=$((PROBLEM_FILES + 1))
fi

# Verificar archivos Python
PYTHON_COUNT=$(git diff --cached --name-only | grep -c "\.py$" || true)
if [ $PYTHON_COUNT -gt 0 ]; then
    warn "$PYTHON_COUNT archivos .py encontrados (probablemente temporales)"
    PROBLEM_FILES=$((PROBLEM_FILES + PYTHON_COUNT))
fi

if [ $PROBLEM_FILES -eq 0 ]; then
    echo "   ✓ No hay archivos problemáticos"
else
    warn "Se encontraron $PROBLEM_FILES archivos potencialmente problemáticos"
fi
echo ""

# Paso 7: Mostrar resumen
step "Resumen de archivos a subir:"
FILES_COUNT=$(git diff --cached --name-only | wc -l)
echo "   Total: $FILES_COUNT archivos"
echo ""
echo "   Primeros 20 archivos:"
git diff --cached --name-only | head -20 | sed 's/^/   - /'
if [ $FILES_COUNT -gt 20 ]; then
    echo "   ... y $((FILES_COUNT - 20)) más"
fi
echo ""

# Paso 8: Confirmar
read -p "¿Continuar con el commit y push? (s/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    warn "Operación cancelada"
    exit 0
fi

# Paso 9: Crear commit
step "Creando commit..."
git commit -m "Sistema Banque Alimentaire completo

- Sistema integral de gestión para Banque Alimentaire
- Módulos: Dashboard, Inventario, Comandas, Organismos, Transporte, Reportes
- Soporte multilingüe (ES, FR, EN, AR con RTL)
- Autenticación JWT híbrida
- PWA con modo offline
- Sistema de backups automáticos
- Correcciones completas de accesibilidad
- Driver de balanzas Pennsylvania Scale
- Sistema dual donateurs/fournisseurs" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✓ Commit creado exitosamente"
else
    error "Error al crear commit"
    exit 1
fi
echo ""

# Paso 10: Push
step "Enviando a GitHub..."
echo ""

# Intentar push normal primero
git push origin main 2>&1

if [ $? -eq 0 ]; then
    echo ""
    step "✅ Push exitoso!"
    echo ""
    echo "Tu código está ahora en GitHub: $REMOTE"
else
    echo ""
    warn "Push normal falló. Intentando con force..."
    echo ""
    read -p "¿Hacer push con --force? Esto sobrescribirá el repositorio remoto (s/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        git push -f origin main
        
        if [ $? -eq 0 ]; then
            echo ""
            step "✅ Push forzado exitoso!"
        else
            echo ""
            error "Push forzado falló"
            echo ""
            echo "Posibles causas:"
            echo "1. Problema de autenticación (token o SSH key)"
            echo "2. Archivos demasiado grandes (>100MB)"
            echo "3. Sin permisos de escritura en el repositorio"
            echo ""
            echo "Para más ayuda, ejecuta: bash diagnostico-git.sh"
            exit 1
        fi
    else
        warn "Push cancelado"
        exit 0
    fi
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║         ✅ PROCESO COMPLETADO          ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Verifica tu repositorio en: $REMOTE"
echo ""
