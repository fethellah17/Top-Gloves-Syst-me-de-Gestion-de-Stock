@echo off
REM 🚀 Script de déploiement rapide pour Vercel (Windows)
REM Top Gloves - Gestion de Stock

echo 🔍 Vérification de l'environnement...
echo.

REM Vérifier si Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

echo ✅ Node.js installé
node -v
echo ✅ NPM installé
npm -v

REM Nettoyer les anciens builds
echo.
echo 🧹 Nettoyage des anciens builds...
if exist dist rmdir /s /q dist

REM Installer les dépendances
echo.
echo 📦 Installation des dépendances...
call npm install

REM Build de production
echo.
echo 🏗️  Build de production...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Build réussi !
    echo.
    
    REM Vérifier si Vercel CLI est installé
    where vercel >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo 🚀 Vercel CLI détecté !
        echo.
        set /p DEPLOY="Voulez-vous déployer maintenant ? (y/n): "
        if /i "%DEPLOY%"=="y" (
            echo 🚀 Déploiement en cours...
            call vercel --prod
        ) else (
            echo ℹ️  Déploiement annulé. Vous pouvez déployer manuellement avec: vercel --prod
        )
    ) else (
        echo ℹ️  Vercel CLI n'est pas installé.
        echo 📝 Pour déployer:
        echo    1. Installer Vercel CLI: npm install -g vercel
        echo    2. Se connecter: vercel login
        echo    3. Déployer: vercel --prod
        echo.
        echo    Ou uploadez le dossier 'dist/' sur https://vercel.com/new
    )
) else (
    echo.
    echo ❌ Erreur lors du build !
    pause
    exit /b 1
)

echo.
pause
