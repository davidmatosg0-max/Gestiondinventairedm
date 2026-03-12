#!/bin/bash

echo "====================================="
echo "PREPARAR REPOSITORIO PARA GITHUB"
echo "====================================="
echo ""

# Paso 1: Limpiar staging area
echo "1. Limpiando staging area..."
git reset
echo "✓ Staging area limpiado"
echo ""

# Paso 2: Remover archivos no deseados del tracking
echo "2. Removiendo archivos no deseados del tracking..."

# Remover archivos de documentación temporales
git rm --cached *.md 2>/dev/null
git rm --cached *.txt 2>/dev/null
git rm --cached *.py 2>/dev/null
git rm --cached tmp/* 2>/dev/null
git rm --cached temp_script.txt 2>/dev/null

# Remover scripts temporales
git rm --cached fix*.py 2>/dev/null
git rm --cached fix*.js 2>/dev/null
git rm --cached check-*.sh 2>/dev/null

echo "✓ Archivos temporales removidos"
echo ""

# Paso 3: Agregar solo archivos necesarios
echo "3. Agregando archivos esenciales..."

# Archivos de configuración
git add .gitignore
git add package.json
git add vite.config.ts
git add postcss.config.mjs
git add tsconfig.json 2>/dev/null
git add index.html

# Configuración de deploy
git add netlify.toml
git add vercel.json
git add _config.yml

# Código fuente
git add src/

# Archivos públicos (pero no todos)
git add public/manifest.json
git add public/robots.txt
git add public/sw.js
git add public/favicon.svg
git add public/*.svg
git add public/*.html
git add public/_headers 2>/dev/null
git add public/_redirects 2>/dev/null

# Documentación esencial
git add README.md
git add LICENSE 2>/dev/null

echo "✓ Archivos esenciales agregados"
echo ""

# Paso 4: Mostrar resumen
echo "4. RESUMEN:"
echo "-------------------------------------"
echo "Archivos listos para commit:"
git diff --cached --name-only | wc -l
echo ""
echo "Tamaño estimado:"
git diff --cached --stat
echo ""

echo "====================================="
echo "LISTO PARA COMMIT"
echo "====================================="
echo ""
echo "Ejecuta los siguientes comandos:"
echo ""
echo "git commit -m 'Sistema Banque Alimentaire completo'"
echo "git push origin main"
echo ""
