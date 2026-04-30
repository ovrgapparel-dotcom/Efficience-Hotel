# Manuel de l'Utilisateur - Efficience Hotel ERP v2.0 (Premium Enterprise)

Bienvenue dans **Efficience Hotel**, votre système intelligent de planification des ressources hôtelières. Cette version 2.0 intègre une sécurité bancaire, un moteur d'intelligence artificielle cross-départemental (SAP) et une automatisation complète du cycle de vie des chambres.

---

## 0. Accès & Sécurité (Nouveau)
L'accès au système est protégé par un processus en deux étapes :
1. **Sélection du Rôle** : Choisissez votre département (Admin, Réception, Bar/Restaurant, Entretien).
2. **Code PIN** : Entrez votre code personnel à 4 chiffres.
   - **Master Key** : Le code `OV99` permet un accès administrateur total en toute circonstance.
   - **Gestion des PINs** : Les administrateurs peuvent modifier les codes d'accès depuis l'onglet `Admin` > `Gestion Sécurité`.

---

## 1. Dashboard Principal

Le **Dashboard (Tableau de bord)** est votre tour de contrôle.

- **KPIs (Indicateurs Clés de Performance)** : Affiche le taux d'occupation, le revenu global, la rentabilité brute, l'EBITDA et l'efficience du personnel.
- **Intelligence SAP (AIEngine)** : Un bouton dédié vous permet de générer un diagnostic complet de l'hôtel. L'IA corrèle les données entre les départements pour vous alerter sur :
  - Les décalages entre réservations et nettoyages.
  - Les prévisions de rupture de stock de fournitures.
  - Les surcharges de travail de l'équipe d'entretien.
  - L'efficience salariale par rapport au chiffre d'affaires.

## 2. Gestion de l'Hôtel

Cet espace vous permet de suivre l'occupation journalière.

- **Enregistrement de Nuitée** : Saisissez la chambre, le client et le prix.
- **Lien Automatisé** : Valider une nuitée déclenche **immédiatement** :
  1. Une tâche de nettoyage dans le calendrier de l'Entretien.
  2. Une déduction automatique des produits d'entretien dans les stocks.
  3. Une mise à jour du planning de rotation.

## 3. Point de Vente (Restaurant & Bar)

L'interface de vente et restauration (POS).

- **Enregistrer une vente** : Appuyez sur la catégorie (`Bar`, `Cocktails`, `Cuisine`), sélectionnez le produit depuis la liste, de saisir la quantité, et le système calcule le prix total.
- **Service Entretien (Nouveau)** :
  - **Calendrier de Rotation** : Visualisez les tâches par date avec barres de progression.
  - **Allocation Fournitures** : Suivez la consommation en temps réel et les prévisions à J+7.
  - **Validation** : Une fois la chambre propre, validez la tâche pour libérer la chambre dans les statistiques.

## 4. Gestion RH (Ressources Humaines)

- **Assigner une Garde** : Enregistrez le personnel, sa fonction (ex: Réception), et **son shift (Jour ou Nuit)**.
- **Calculs Temps Réel** : Les heures validées par les employés sont compilées en "Hs Prestées". Celles-ci doivent idéalement couvrir les "Hs Nécessaires" agrégées par vos entrées d'Hôtel et de Cuisine.
- Le module affichera des alertes urgentes si par exemple aucun technicien n'est enregistré de nuit à la Réception.

## 5. Comptabilité (Finance)

Gérez les entrées de caisse additionnelles ou les sorties/Dépenses de votre entreprise à l'exception de l'inventaire qui est automatique.
- Les dépenses opérationnelles affectent votre Profit Net de manière transparente.

## 6. Stock & Amortissements
L'ERP différencie désormais les actifs (Amortissements à long terme) et les consommables quotidiens.
- **Bar & Consommables** : Consultez les entrées de stock, le volume vendu, et le restant. Un signalement `⚠️ Stock Bas` apparaît pour tout article passant sous les 20% restants de son volume initial !
- **Restocker** : Entrez simplement le nom de l'article pour rajouter du volume dans votre inventaire.

---

*L'application est conçue pour fonctionner avec connectivité en temps réel. Pour toute demande de support technique supplémentaire, veuillez vous référer à votre intégrateur agréé OVRG.*
