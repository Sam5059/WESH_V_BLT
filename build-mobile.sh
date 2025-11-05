#!/bin/bash

# 🚀 Script de Build Mobile BuyGo
# Ce script facilite la création de builds pour Android/iOS

echo "🚀 BuyGo Mobile - Build Script"
echo "================================"
echo ""

# Vérifier si EAS CLI est installé
if ! command -v eas &> /dev/null
then
    echo "❌ EAS CLI n'est pas installé"
    echo "📦 Installation en cours..."
    npm install -g eas-cli
    echo "✅ EAS CLI installé!"
    echo ""
fi

# Menu de sélection
echo "Choisissez le type de build:"
echo "1) Development Build - Android (Recommandé pour test)"
echo "2) Development Build - iOS"
echo "3) Preview Build - Android (APK direct)"
echo "4) Production Build - Android"
echo "5) Production Build - iOS"
echo "6) Voir les builds en cours"
echo "7) Quitter"
echo ""
read -p "Votre choix (1-7): " choice

case $choice in
    1)
        echo ""
        echo "🤖 Création du Development Build Android..."
        echo "⏱️  Temps estimé: 10-15 minutes"
        echo ""
        eas build --profile development --platform android
        ;;
    2)
        echo ""
        echo "🍎 Création du Development Build iOS..."
        echo "⏱️  Temps estimé: 15-20 minutes"
        echo ""
        eas build --profile development --platform ios
        ;;
    3)
        echo ""
        echo "📦 Création du Preview Build Android..."
        echo "⏱️  Temps estimé: 10-15 minutes"
        echo ""
        eas build --profile preview --platform android
        ;;
    4)
        echo ""
        echo "🚢 Création du Production Build Android..."
        echo "⏱️  Temps estimé: 15-20 minutes"
        echo ""
        eas build --profile production --platform android
        ;;
    5)
        echo ""
        echo "🚢 Création du Production Build iOS..."
        echo "⏱️  Temps estimé: 20-25 minutes"
        echo ""
        eas build --profile production --platform ios
        ;;
    6)
        echo ""
        echo "📋 Builds en cours et récents:"
        echo ""
        eas build:list
        ;;
    7)
        echo ""
        echo "👋 Au revoir!"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "================================"
echo "✅ Commande lancée!"
echo ""
echo "📧 Vous recevrez un email quand le build sera prêt"
echo "🔗 Ou suivez sur: https://expo.dev"
echo ""
echo "💡 Commandes utiles:"
echo "   - Voir les builds: eas build:list"
echo "   - Voir les logs: eas build:view [BUILD_ID]"
echo "   - Annuler: eas build:cancel"
echo ""
echo "🗺️  N'oubliez pas de configurer Google Maps API!"
echo "📚 Voir: GOOGLE_MAPS_SETUP.md"
echo ""
