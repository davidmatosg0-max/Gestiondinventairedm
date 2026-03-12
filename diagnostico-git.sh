#!/bin/bash

echo "====================================="
echo "DIAGNÓSTICO GIT - BANQUE ALIMENTAIRE"
echo "====================================="
echo ""

# 1. Verificar si hay archivos muy grandes
echo "1. ARCHIVOS GRANDES (>50MB):"
echo "-------------------------------------"
find . -type f -size +50M -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null | head -20
echo ""

# 2. Tamaño del repositorio
echo "2. TAMAÑO DEL REPOSITORIO:"
echo "-------------------------------------"
du -sh .git 2>/dev/null
echo ""

# 3. Archivos en staging
echo "3. ARCHIVOS EN STAGING:"
echo "-------------------------------------"
git diff --cached --name-only | wc -l
echo "archivos listos para commit"
echo ""

# 4. Archivos trackeados
echo "4. TOTAL ARCHIVOS TRACKEADOS:"
echo "-------------------------------------"
git ls-files | wc -l
echo "archivos en total"
echo ""

# 5. Estado del repositorio
echo "5. ESTADO DEL REPOSITORIO:"
echo "-------------------------------------"
git status --short | head -30
echo ""

# 6. Remotes configurados
echo "6. REPOSITORIOS REMOTOS:"
echo "-------------------------------------"
git remote -v
echo ""

# 7. Archivos más grandes trackeados
echo "7. ARCHIVOS MÁS GRANDES TRACKEADOS:"
echo "-------------------------------------"
git ls-files | xargs ls -lh 2>/dev/null | sort -k5 -hr | head -10
echo ""

# 8. Verificar node_modules
echo "8. VERIFICAR NODE_MODULES:"
echo "-------------------------------------"
if [ -d "node_modules" ]; then
    echo "⚠️  ADVERTENCIA: Carpeta node_modules existe"
    du -sh node_modules
else
    echo "✓ No hay carpeta node_modules"
fi
echo ""

# 9. Verificar archivos temporales
echo "9. ARCHIVOS TEMPORALES EN GIT:"
echo "-------------------------------------"
git ls-files | grep -E '\.(log|tmp|bak|py|pyc)$' | head -20
echo ""

echo "====================================="
echo "FIN DEL DIAGNÓSTICO"
echo "====================================="
