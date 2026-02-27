# 🚀 Déploiement Rapide - Top Gloves

## ⚡ Déploiement en 3 Étapes

### Option A : Via GitHub (Recommandé)

```bash
# 1. Créer un repository sur GitHub
# 2. Pousser le code
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE_USERNAME/top-gloves.git
git push -u origin main

# 3. Connecter à Vercel
# Aller sur https://vercel.com → Import Project → Sélectionner votre repo
```

### Option B : Via CLI Vercel

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
vercel --prod
```

### Option C : Script Automatique

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows:**
```cmd
deploy.bat
```

---

## 📋 Fichiers de Configuration Créés

✅ **vercel.json** - Configuration Vercel
- Routing SPA
- Cache optimisé
- Compression automatique

✅ **.vercelignore** - Fichiers à exclure du déploiement

✅ **deploy.sh** / **deploy.bat** - Scripts de déploiement automatique

✅ **DEPLOYMENT_GUIDE.md** - Guide complet de déploiement

---

## 🎯 URL de Déploiement

Après déploiement, votre app sera accessible à :
- `https://votre-projet.vercel.app`

---

## 🔑 Identifiants de Démo

**Utilisateur:**
- ID: n'importe quel texte
- Mot de passe: n'importe quel texte

**Admin:**
- Mot de passe admin: `admin`

---

## 📞 Besoin d'Aide ?

Consultez le guide complet : `DEPLOYMENT_GUIDE.md`
