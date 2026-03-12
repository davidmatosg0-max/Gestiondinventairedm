# 🔧 Solución: Error al Enviar a GitHub

## 🎯 Diagnóstico Rápido

Ejecuta primero este comando para ver qué está pasando:

```bash
bash diagnostico-git.sh
```

## 📊 Problemas Comunes y Soluciones

### **PROBLEMA 1: Archivos demasiado grandes (>100MB)**

**Síntoma:** Error mencionando "file exceeds GitHub's file size limit"

**Solución:**
```bash
# Encontrar archivos grandes
find . -type f -size +100M -not -path "./.git/*" -not -path "./node_modules/*"

# Eliminarlos o agregarlos a .gitignore
echo "nombre-archivo-grande.ext" >> .gitignore
git rm --cached nombre-archivo-grande.ext
```

---

### **PROBLEMA 2: Demasiados archivos (.md, .py, .txt temporales)**

**Síntoma:** Push muy lento o error de timeout

**Solución:**
```bash
# Ejecutar el script de preparación
bash preparar-github.sh

# Luego hacer commit y push
git commit -m "Sistema Banque Alimentaire completo"
git push origin main
```

---

### **PROBLEMA 3: Historia de Git corrupta o muy grande**

**Síntoma:** Error "failed to push some refs" o "repository size exceeded"

**Solución:**
```bash
# Opción A: Limpiar historial de archivos grandes
git filter-branch --tree-filter 'rm -rf node_modules tmp' --prune-empty HEAD
git push -f origin main

# Opción B: Reiniciar con historial limpio (RECOMENDADO)
bash reiniciar-git-limpio.sh
```

---

### **PROBLEMA 4: Error de autenticación**

**Síntoma:** "Authentication failed" o "Permission denied"

**Solución:**

#### Para HTTPS:
```bash
# Verificar tu token de GitHub
git remote set-url origin https://YOUR_TOKEN@github.com/usuario/repo.git

# O usar GitHub CLI
gh auth login
```

#### Para SSH:
```bash
# Verificar tu clave SSH
ssh -T git@github.com

# Cambiar remote a SSH
git remote set-url origin git@github.com:usuario/repo.git
```

---

### **PROBLEMA 5: Conflicto con rama remota**

**Síntoma:** "Updates were rejected because the remote contains work..."

**Solución:**
```bash
# Opción A: Hacer pull primero
git pull origin main --rebase
git push origin main

# Opción B: Forzar push (CUIDADO: sobrescribe el remoto)
git push -f origin main
```

---

## 🚀 Proceso Paso a Paso (RECOMENDADO)

### **Método 1: Limpieza Rápida**

```bash
# 1. Diagnóstico
bash diagnostico-git.sh

# 2. Preparar archivos
bash preparar-github.sh

# 3. Commit
git commit -m "Sistema Banque Alimentaire completo"

# 4. Push
git push origin main
```

### **Método 2: Reinicio Completo (Si lo anterior no funciona)**

```bash
# 1. Reiniciar Git
bash reiniciar-git-limpio.sh

# 2. Push forzado (es seguro porque es un repo nuevo)
git push -f origin main
```

---

## 📝 Checklist Pre-Push

Antes de hacer push, verifica:

- [ ] `.gitignore` está configurado
- [ ] No hay `node_modules/` trackeado
- [ ] No hay archivos `.py` temporales trackeados
- [ ] No hay archivos >100MB
- [ ] El remote está configurado correctamente
- [ ] Tienes permisos de escritura en el repo

```bash
# Verificar checklist automáticamente
git ls-files | grep node_modules && echo "❌ node_modules trackeado" || echo "✓ OK"
git ls-files | grep -E '\.py$' && echo "⚠️  Archivos .py trackeados" || echo "✓ OK"
git remote -v | grep origin || echo "❌ No hay remote configurado"
```

---

## 🆘 Si Nada Funciona

### Crear repositorio desde cero:

```bash
# 1. Ir a GitHub y crear un nuevo repositorio vacío
#    Nombre: banque-alimentaire-system

# 2. En tu proyecto local:
bash reiniciar-git-limpio.sh

# 3. Cuando te pida la URL del repositorio, ingresa:
#    https://github.com/TU_USUARIO/banque-alimentaire-system.git

# 4. Push inicial:
git push -u origin main
```

---

## 📚 Comandos Útiles

```bash
# Ver tamaño del repositorio
du -sh .git

# Ver archivos más grandes trackeados
git ls-files | xargs ls -lh | sort -k5 -hr | head -20

# Ver qué archivos están en staging
git diff --cached --name-only

# Remover archivo del tracking pero mantenerlo localmente
git rm --cached archivo.txt

# Ver historial de commits
git log --oneline -10

# Ver estado del repositorio
git status
```

---

## ⚡ Quick Fix (El más rápido)

Si solo quieres una solución rápida **AHORA MISMO**:

```bash
# 1. Reset todo
git reset

# 2. Agregar solo lo esencial
git add .gitignore package.json vite.config.ts index.html src/ public/manifest.json public/robots.txt public/sw.js README.md

# 3. Commit
git commit -m "Sistema completo"

# 4. Push
git push origin main

# Si falla el push:
git push -f origin main
```

---

## 📞 Necesitas Más Ayuda

Si después de probar todo lo anterior aún tienes problemas, proporcióname:

1. **El error exacto** (copia y pega el mensaje completo)
2. **Resultado de:** `bash diagnostico-git.sh`
3. **Tu sistema operativo:** Windows / Mac / Linux
4. **Método de autenticación:** HTTPS / SSH

---

## ✅ Verificación Final

Después del push exitoso, verifica:

```bash
# Ver último commit en GitHub
git log origin/main -1

# Verificar que todo se subió
git diff origin/main
```

Si no hay diferencias, ¡todo está bien! 🎉
