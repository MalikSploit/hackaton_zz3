# 🌿 StepCoins — Application décentralisée Web3

**StepCoins** est une DApp (application décentralisée) développée avec **Angular 16**, intégrant des technologies Web3 comme **ethers.js**, **Leaflet** pour la cartographie, et **TailwindCSS** pour le style. 

L'application vise à permettre l'échange, la visualisation ou la compensation de crédits carbone sur une infrastructure décentralisée.

| Catégorie          | Outil                                                             |
|--------------------|--------------------------------------------------------------------|
| Framework Frontend | [Angular 16](https://angular.io/)                                  |
| Blockchain/Web3    | [Ethers.js](https://docs.ethers.org/) pour les interactions avec Ethereum |
| Cartographie       | [Leaflet](https://leafletjs.com/), [Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/), [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) |
| UI / CSS           | [Tailwind CSS](https://tailwindcss.com/)                           |
| Icônes             | [Font Awesome](https://fontawesome.com/)                           |
| Langage            | TypeScript                                                         |
| Build/CLI          | Angular CLI, Webpack                                               |

---

## Fonctionnalités principales

- Connexion au portefeuille Web3 (MetaMask, WalletConnect...)
- Cartes interactives (routage, chaleur, données géographiques)
- Gestion de tokens et appels à des smart contracts via ethers.js
- Interface responsive et rapide grâce à Tailwind CSS
- Tests unitaires avec Jasmine/Karma

---

## Installation et lancement du projet

### Prérequis

- Node.js v18+
- npm
- Angular CLI

```bash
npm install -g @angular/cli
```

### Démarrage du projet 

```bash
back-end : script dev
déployer un token : script deploy
smart contract : script node (carbon-api)
front-end : npm start
```

**Le front-end (``carbon-swap``) sera disponible sur le port : http://localhost:4200/** 

**Le serveur (```carbin-api```) écoute sur le port 3000. (http://localhost:3000)**

L'application utilise ethers.js pour :

-  Se connecter à un portefeuille Web3 (MetaMask, etc.)

- Lire et écrire dans un smart contract (ex : transfert de tokens, enregistrement de données)

- Afficher des informations sur la blockchain (soldes, adresses, etc.)

⚠️  N.B. : Les adresses de contrat et les ABI sont à configurer manuellement dans le code.
