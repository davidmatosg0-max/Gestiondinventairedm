#!/bin/bash

echo "====================================="
echo "REINICIAR GIT CON HISTORIAL LIMPIO"
echo "====================================="
echo ""
echo "⚠️  ADVERTENCIA: Esto creará un nuevo historial de Git"
echo "⚠️  Solo usa esto si el repositorio actual tiene problemas"
echo ""
read -p "¿Estás seguro? (escribe SI para continuar): " confirmacion

if [ "$confirmacion" != "SI" ]; then
    echo "Cancelado."
    exit 1
fi

echo ""
echo "Iniciando reinicio..."
echo ""

# Paso 1: Guardar la URL del remote
echo "1. Guardando configuración del remote..."
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo "No se encontró remote 'origin'"
    read -p "Ingresa la URL de tu repositorio GitHub: " REMOTE_URL
fi
echo "Remote URL: $REMOTE_URL"
echo ""

# Paso 2: Respaldar el directorio .git actual
echo "2. Respaldando .git actual..."
if [ -d ".git" ]; then
    mv .git .git.backup.$(date +%Y%m%d_%H%M%S)
    echo "✓ Respaldo creado"
fi
echo ""

# Paso 3: Inicializar nuevo repositorio
echo "3. Inicializando nuevo repositorio..."
git init
git branch -M main
echo "✓ Repositorio inicializado"
echo ""

# Paso 4: Configurar remote
echo "4. Configurando remote..."
git remote add origin "$REMOTE_URL"
echo "✓ Remote configurado"
echo ""

# Paso 5: Agregar archivos
echo "5. Agregando archivos..."
bash preparar-github.sh
echo ""

# Paso 6: Crear commit inicial
echo "6. Creando commit inicial..."
git commit -m "Sistema Banque Alimentaire - Commit inicial limpio

- Sistema completo de gestión para Banque Alimentaire
- Módulos: Dashboard, Inventario, Comandas, Organismos, Transporte, etc.
- Soporte multilingüe (ES, FR, EN, AR con RTL)
- Sistema de autenticación con JWT
- PWA con soporte offline
- Correcciones completas de accesibilidad"
echo "✓ Commit creado"
echo ""

echo "====================================="
echo "REPOSITORIO LIMPIO LISTO"
echo "====================================="
echo ""
echo "Para subir a GitHub:"
echo ""
echo "git push -f origin main"
echo ""
echo "NOTA: El -f (force) es necesario porque es un historial nuevo"
echo ""
