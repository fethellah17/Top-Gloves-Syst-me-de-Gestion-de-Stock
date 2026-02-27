#!/bin/bash

# 🚀 Script de déploiement rapide pour Vercel
# Top Gloves - Gestion de Stock

echo "🔍 Vérification de l'environnement..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ NPM version: $(npm -v)"

# Nettoyer les anciens builds
echo ""
echo "🧹 Nettoyage des anciens builds..."
rm -rf dist

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

# Vérifier les erreurs TypeScript
echo ""
echo "🔍 Vérification TypeScript..."
npm run lint

# Build de production
echo ""
echo "🏗️  Build de production..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build réussi !"
    echo ""
    echo "📊 Taille du build:"
    du -sh dist
    echo ""
    
    # Vérifier si Vercel CLI est installé
    if command -v vercel &> /dev/null; then
        echo "🚀 Vercel CLI détecté !"
        echo ""
        read -p "Voulez-vous déployer maintenant ? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🚀 Déploiement en cours..."
            vercel --prod
        else
            echo "ℹ️  Déploiement annulé. Vous pouvez déployer manuellement avec: vercel --prod"
        fi
    else
        echo "ℹ️  Vercel CLI n'est pas installé."
        echo "📝 Pour déployer:"
        echo "   1. Installer Vercel CLI: npm install -g vercel"
        echo "   2. Se connecter: vercel login"
        echo "   3. Déployer: vercel --prod"
        echo ""
        echo "   Ou uploadez le dossier 'dist/' sur https://vercel.com/new"
    fi
else
    echo ""
    echo "❌ Erreur lors du build !"
    exit 1
fi
