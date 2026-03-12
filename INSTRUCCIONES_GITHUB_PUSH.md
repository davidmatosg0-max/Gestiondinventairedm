# 🚀 Instrucciones: Subir a GitHub

## 📋 Tabla de Contenidos
- [Solución Inmediata](#-solución-inmediata)
- [Paso a Paso](#-paso-a-paso)
- [Solución de Problemas](#-solución-de-problemas)
- [Comandos por Sistema Operativo](#-comandos-por-sistema-operativo)

---

## ⚡ Solución Inmediata

### Linux / Mac / Git Bash (Windows)
```bash
bash fix-github-rapido.sh
```

### Windows CMD / PowerShell
```cmd
fix-github-windows.bat
```

**¡Eso es todo!** El script hace todo automáticamente.

---

## 📝 Paso a Paso

Si prefieres entender qué hace cada paso:

### 1. Diagnóstico (Opcional)
```bash
bash diagnostico-git.sh
```
Esto te muestra el estado actual del repositorio.

### 2. Limpieza
```bash
# Resetear staging area
git reset

# Agregar .gitignore
git add .gitignore
```

### 3. Agregar Archivos Esenciales
```bash
git add package.json vite.config.ts index.html
git add src/
git add public/manifest.json public/robots.txt public/sw.js
git add README.md
```

### 4. Commit
```bash
git commit -m "Sistema Banque Alimentaire completo"
```

### 5. Push
```bash
git push origin main
```

Si falla:
```bash
git push -f origin main
```

---

## 🔧 Solución de Problemas

### Error: "Authentication failed"

**Solución con Token Personal:**
```bash
# Obtén un token en: https://github.com/settings/tokens
git remote set-url origin https://TU_TOKEN@github.com/usuario/repo.git
git push origin main
```

**Solución con SSH:**
```bash
# Configura SSH: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
git remote set-url origin git@github.com:usuario/repo.git
git push origin main
```

---

### Error: "File too large"

```bash
# Encontrar archivos grandes
find . -size +100M -not -path "./.git/*" -not -path "./node_modules/*"

# Agregar a .gitignore y remover del tracking
echo "archivo-grande.zip" >> .gitignore
git rm --cached archivo-grande.zip
git commit -m "Remover archivo grande"
```

---

### Error: "Remote rejected"

```bash
# Pull primero
git pull origin main --rebase
git push origin main

# O forzar (CUIDADO)
git push -f origin main
```

---

### Error: "Repository too large"

**Opción 1: Limpiar historia**
```bash
# Usar el script
bash reiniciar-git-limpio.sh
```

**Opción 2: Git Filter-Repo (avanzado)**
```bash
# Instalar git-filter-repo primero
# pip install git-filter-repo

# Remover archivos grandes de la historia
git filter-repo --strip-blobs-bigger-than 10M
```

---

## 💻 Comandos por Sistema Operativo

### 🐧 Linux / 🍎 Mac

```bash
# Hacer scripts ejecutables
chmod +x *.sh

# Ejecutar solución rápida
./fix-github-rapido.sh

# O con bash
bash fix-github-rapido.sh
```

### 🪟 Windows

**Git Bash (Recomendado):**
```bash
bash fix-github-rapido.sh
```

**PowerShell:**
```powershell
# Permitir ejecución de scripts (una sola vez)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Ejecutar
.\fix-github-windows.bat
```

**CMD:**
```cmd
fix-github-windows.bat
```

---

## 📊 Verificación Post-Push

Después de un push exitoso:

```bash
# Ver el último commit en GitHub
git log origin/main -1

# Verificar que todo está sincronizado
git diff origin/main

# Ver estado
git status
```

Si `git diff origin/main` no muestra nada, ¡perfecto! ✅

---

## 🎯 Flujo de Trabajo Recomendado

Para futuros cambios:

```bash
# 1. Ver cambios
git status

# 2. Agregar cambios
git add .

# 3. Commit
git commit -m "Descripción de cambios"

# 4. Push
git push origin main
```

**Importante:** El `.gitignore` ya está configurado, así que no subirás archivos innecesarios.

---

## 🛠️ Scripts Disponibles

| Script | Propósito | Cuándo Usar |
|--------|-----------|-------------|
| `fix-github-rapido.sh` | Solución todo-en-uno | **SIEMPRE (primera opción)** |
| `diagnostico-git.sh` | Ver estado del repo | Cuando quieres investigar |
| `preparar-github.sh` | Preparar archivos | Cuando quieres control manual |
| `reiniciar-git-limpio.sh` | Historial nuevo | Último recurso |
| `fix-github-windows.bat` | Solución Windows | Si usas Windows nativo |

---

## 📚 Documentación Adicional

- **Guía completa:** `SOLUCION_ERROR_GITHUB.md`
- **Guía rápida:** `COMO_SUBIR_A_GITHUB.md`
- **Texto simple:** `LEEME.txt`

---

## ✅ Checklist Pre-Push

Antes de hacer push, verifica:

- [ ] ✓ `.gitignore` configurado
- [ ] ✓ No hay `node_modules/` en staging
- [ ] ✓ No hay archivos `.env`
- [ ] ✓ No hay archivos temporales `.py`, `.bak`
- [ ] ✓ Remote configurado correctamente
- [ ] ✓ Tienes permisos en el repositorio

```bash
# Verificación automática
git ls-files | grep node_modules && echo "❌ node_modules" || echo "✓ OK"
git ls-files | grep .env && echo "❌ .env files" || echo "✓ OK"
git remote -v | grep origin || echo "❌ No remote"
```

---

## 🆘 Ayuda Adicional

Si después de todo aún tienes problemas:

1. **Ejecuta el diagnóstico:**
   ```bash
   bash diagnostico-git.sh > diagnostico.txt
   ```

2. **Revisa el archivo `diagnostico.txt`**

3. **Busca el error específico en `SOLUCION_ERROR_GITHUB.md`**

4. **Considera usar `reiniciar-git-limpio.sh` como última opción**

---

## 💡 Tips Profesionales

1. **Commits frecuentes:** Haz commits pequeños y frecuentes
2. **Mensajes descriptivos:** Usa mensajes de commit claros
3. **Branches:** Para features grandes, usa branches:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   git push origin feature/nueva-funcionalidad
   ```
4. **Pull antes de Push:** Siempre haz pull antes de push si trabajas en equipo

---

## 🎓 Aprender Más

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**Creado para:** Sistema de Banque Alimentaire  
**Última actualización:** Marzo 2026  
**Mantenedor:** David (Desarrollador)
