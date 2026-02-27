# 🚀 Guide de Déploiement Vercel - Top Gloves

## 📋 Prérequis

- Compte Vercel (gratuit) : https://vercel.com
- Git installé
- Repository GitHub/GitLab/Bitbucket (optionnel mais recommandé)

---

## 🎯 Méthode 1 : Déploiement via GitHub (Recommandé)

### Étape 1 : Préparer le Repository

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Commit initial
git commit -m "Initial commit - Top Gloves Stock Management"

# Créer un repository sur GitHub et le lier
git remote add origin https://github.com/VOTRE_USERNAME/top-gloves.git
git branch -M main
git push -u origin main
```

### Étape 2 : Connecter à Vercel

1. Aller sur https://vercel.com
2. Cliquer sur "Add New Project"
3. Importer votre repository GitHub
4. Vercel détectera automatiquement Vite
5. Cliquer sur "Deploy"

### Configuration Automatique
Vercel détectera automatiquement :
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

## 🎯 Méthode 2 : Déploiement via CLI Vercel

### Étape 1 : Installer Vercel CLI

```bash
npm install -g vercel
```

### Étape 2 : Se connecter

```bash
vercel login
```

### Étape 3 : Déployer

```bash
# Premier déploiement (mode interactif)
vercel

# Ou directement en production
vercel --prod
```

### Répondre aux questions :
- Set up and deploy? **Y**
- Which scope? **Votre compte**
- Link to existing project? **N**
- What's your project's name? **top-gloves**
- In which directory is your code located? **./**
- Want to override the settings? **N**

---

## 🎯 Méthode 3 : Déploiement via Interface Web

### Étape 1 : Build local

```bash
npm run build
```

### Étape 2 : Upload sur Vercel

1. Aller sur https://vercel.com/new
2. Cliquer sur "Deploy" sans Git
3. Glisser-déposer le dossier `dist/`
4. Cliquer sur "Deploy"

---

## ⚙️ Configuration Vercel

Le fichier `vercel.json` est déjà configuré avec :

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Fonctionnalités :
- ✅ Routing SPA (Single Page Application)
- ✅ Cache optimisé pour les assets
- ✅ Compression automatique
- ✅ HTTPS automatique
- ✅ CDN global

---

## 🔧 Variables d'Environnement (Optionnel)

Si vous ajoutez des variables d'environnement plus tard :

### Via Dashboard Vercel :
1. Projet → Settings → Environment Variables
2. Ajouter vos variables (ex: `VITE_API_URL`)

### Via CLI :
```bash
vercel env add VITE_API_URL
```

### Dans le code :
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📦 Scripts NPM Utiles

```bash
# Build de production
npm run build

# Preview du build local
npm run preview

# Déploiement Vercel (si CLI installé)
vercel --prod
```

---

## 🌐 Domaine Personnalisé

### Ajouter un domaine :
1. Dashboard Vercel → Votre projet → Settings → Domains
2. Ajouter votre domaine
3. Configurer les DNS selon les instructions

### Domaine gratuit Vercel :
- Format : `votre-projet.vercel.app`
- HTTPS automatique
- Certificat SSL gratuit

---

## 🔄 Déploiement Automatique

Avec GitHub connecté :
- ✅ Chaque push sur `main` → Déploiement en production
- ✅ Chaque pull request → Preview deployment
- ✅ Rollback facile via dashboard

---

## 🐛 Troubleshooting

### Erreur : "Build failed"
```bash
# Vérifier le build en local
npm run build

# Vérifier les dépendances
npm install
```

### Erreur : "404 on refresh"
- Vérifier que `vercel.json` contient les rewrites
- Le fichier est déjà configuré correctement

### Erreur : "Module not found"
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Monitoring

### Analytics Vercel (Gratuit)
- Dashboard → Analytics
- Voir les visites, performances, erreurs

### Logs
- Dashboard → Deployments → Logs
- Voir les logs de build et runtime

---

## 🚀 Optimisations Post-Déploiement

### 1. Activer la compression
✅ Déjà activé par défaut sur Vercel

### 2. Optimiser les images
```bash
npm install -D vite-plugin-imagemin
```

### 3. Analyser le bundle
```bash
npm run build -- --mode analyze
```

---

## 📝 Checklist de Déploiement

- [ ] Build local réussi (`npm run build`)
- [ ] Tests passent (`npm run test`)
- [ ] Pas d'erreurs TypeScript
- [ ] `.gitignore` configuré
- [ ] `vercel.json` présent
- [ ] Repository Git créé (si méthode 1)
- [ ] Compte Vercel créé
- [ ] Déploiement effectué
- [ ] Site accessible
- [ ] Routing fonctionne (tester plusieurs pages)
- [ ] Responsive testé (mobile/desktop)

---

## 🎉 Après le Déploiement

Votre application sera accessible à :
- **URL Vercel :** `https://votre-projet.vercel.app`
- **Domaine personnalisé :** (si configuré)

### Identifiants de démo :
- **Utilisateur :** N'importe quel ID + mot de passe
- **Admin :** Mot de passe = `admin`

---

## 📞 Support

- Documentation Vercel : https://vercel.com/docs
- Support Vercel : https://vercel.com/support
- Community : https://github.com/vercel/vercel/discussions

---

**Bon déploiement ! 🚀**
