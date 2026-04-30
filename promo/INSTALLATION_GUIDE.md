# Efficience Hotel ERP - Guide d'Installation & Déploiement

Ce pack contient toutes les instructions nécessaires pour installer, configurer et déployer le système Efficience Hotel ERP.

## 1. Prérequis Système
- **Node.js** : v18 ou supérieur recommandé.
- **npm** ou **yarn**.
- **Expo CLI** (installé via `npm install -g expo-cli`).
- **Git**.

## 2. Structure du Projet
- `/hotel-mobile` : Application React Native (Expo) - Interface utilisateur pour tablettes et serveurs.
- `/hotel-backend` : Serveur Node.js/Express - Gestion des APIs et de la base de données (si applicable).

## 3. Installation Locale

### Étape 1 : Cloner le dépôt
```bash
git clone https://github.com/ovrgapparel-dotcom/Efficience-Hotel.git
cd Efficience-Hotel
```

### Étape 2 : Configurer le Mobile
```bash
cd hotel-mobile
npm install
```

### Étape 3 : Configurer le Backend
```bash
cd ../hotel-backend
npm install
cp .env.example .env # Configurer vos variables d'environnement
```

## 4. Lancement
### Mode Développement (Web)
Dans le dossier `hotel-mobile` :
```bash
npx expo start --web
```

### Mode Développement (Android/iOS)
Utilisez l'application **Expo Go** sur votre smartphone et scannez le QR code généré par :
```bash
npx expo start
```

## 5. Déploiement Production (Web/Vercel)
L'application est configurée pour un déploiement continu sur Vercel.
1. Connectez votre dépôt GitHub à Vercel.
2. Définissez le `Root Directory` sur `hotel-mobile`.
3. Commande de build : `npm run build` ou `npx expo export:web`.
4. Répertoire de sortie : `web-build`.

## 6. Maintenance & Sécurité
- **Changement des PINs** : Accédez au panneau Admin > Gestion Sécurité.
- **Master Key** : En cas d'oubli, utilisez le code `OV99` (hardcodé dans `AuthContext.js`).
- **Base de données** : Le système utilise `AsyncStorage` pour la persistence locale Web/Mobile. Pour une persistence SQL, configurez le backend.

---
*Produit par OVRG Apparel & Intelligence - 2026*
