# 📊 Documentation Complète - Module Rapports CashTrack

## 📋 Vue d'ensemble

Le module **Rapports** de CashTrack est un système complet de génération, sauvegarde et gestion de rapports financiers. Il permet de créer des rapports professionnels au format Excel avec toutes les transactions, statistiques et analyses pour une période donnée.

## 🎯 Objectifs du module

- **Traçabilité** : Enregistrer tous les rapports générés avec leurs métadonnées
- **Analyse** : Fournir des statistiques détaillées sur les opérations financières
- **Export professionnel** : Générer des fichiers Excel formatés et prêts à l'emploi
- **Historique** : Conserver un historique complet des rapports pour consultation ultérieure
- **Flexibilité** : Permettre la génération de rapports sur différentes périodes

## 🔧 Types de rapports disponibles

### 1. Rapport Journalier
- **Période** : Jour en cours
- **Usage** : Suivi quotidien des opérations
- **Format** : Excel (XLSX)
- **Contenu** : Toutes les transactions du jour avec statistiques

### 2. Rapport Hebdomadaire
- **Période** : Semaine en cours (du lundi au dimanche)
- **Usage** : Bilan hebdomadaire des opérations
- **Format** : Excel (XLSX)
- **Contenu** : Toutes les transactions de la semaine avec statistiques

### 3. Rapport Mensuel
- **Période** : Mois en cours (du 1er au dernier jour du mois)
- **Usage** : Bilan mensuel pour la comptabilité
- **Format** : Excel (XLSX)
- **Contenu** : Toutes les transactions du mois avec statistiques

### 4. Rapport Annuel
- **Période** : Année en cours (du 1er janvier au 31 décembre)
- **Usage** : Bilan annuel complet
- **Format** : Excel (XLSX)
- **Contenu** : Toutes les transactions de l'année avec statistiques

### 5. Rapport Personnalisé
- **Période** : Période libre définie par l'utilisateur
- **Usage** : Analyse sur une période spécifique
- **Format** : Excel (XLSX)
- **Contenu** : Toutes les transactions de la période avec statistiques
- **Validation** :
  - Date de début < Date de fin
  - Pas de dates futures
  - Période maximale : 365 jours

## 📊 Structure d'un rapport Excel

### En-tête du document

1. **Logo de l'entreprise** (optionnel)
   - Position : Haut à gauche
   - Taille : 240x80 pixels
   - Format : PNG

2. **Titre principal**
   - Format : Texte en majuscules
   - Couleur : Blanc sur fond bleu (#0B177C)
   - Taille de police : 20pt
   - Exemple : "RAPPORT MENSUEL - JANVIER 2025"

3. **Ligne de statistiques**
   - Contenu : Période, nombre d'enregistrements, date d'export
   - Format : Texte bleu sur fond bleu clair
   - Exemple : "📊 Période: 01/01/2025 au 31/01/2025 | Total: 150 enregistrement(s) | Date d'export: 15/02/2025 14:30"

### Tableau des transactions

#### Colonnes incluses

1. **ID** (largeur: 10)
   - Identifiant unique de la transaction

2. **DATE DE CRÉATION** (largeur: 20)
   - Date et heure de création de la transaction
   - Format : JJ/MM/AAAA HH:MM

3. **TYPE** (largeur: 12)
   - "Entrée" pour les recettes
   - "Sortie" pour les dépenses

4. **CATÉGORIE** (largeur: 18)
   - Nom de la catégorie
   - "Non catégorisé" si aucune catégorie

5. **DESCRIPTION** (largeur: 30)
   - Description de la transaction

6. **MONTANT** (largeur: 15)
   - Montant formaté en FCFA
   - Format : #,##0 " FCFA"
   - Exemple : "1 500 000 FCFA"

7. **RÉFÉRENCE** (largeur: 15)
   - Numéro de référence de la transaction

8. **EXPORTATEUR/FOURNISSEUR** (largeur: 25)
   - En-tête multi-lignes
   - Nom de l'exportateur ou du fournisseur

9. **SOLDE** (largeur: 15)
   - Solde cumulé après chaque transaction
   - Format : #,##0 " FCFA"

10. **CRÉÉ PAR** (largeur: 18)
    - Nom ou email de l'utilisateur ayant créé la transaction

#### Formatage du tableau

- **En-têtes** :
  - Fond bleu (#0B177C)
  - Texte blanc en gras
  - Centré verticalement et horizontalement
  - Texte avec retour à la ligne activé
  - Hauteur de ligne : 40px

- **Lignes de données** :
  - Alternance de couleurs (blanc/gris clair)
  - Bordures fines grises
  - Hauteur de ligne : 25px
  - Texte avec retour à la ligne activé

- **Ligne de totaux** :
  - Fond bleu (#0B177C)
  - Texte blanc en gras
  - Calcul automatique des totaux
  - Hauteur de ligne : 30px

### Section Statistiques

Située en bas du document, après les données et les totaux.

#### Contenu

1. **Titre "📊 STATISTIQUES"**
   - Fond bleu (#0B177C)
   - Texte blanc en gras
   - Taille : 18pt
   - Hauteur : 35px

2. **Tableau de statistiques** (2 colonnes)

   | Colonne 1 (Label) | Colonne 2 (Valeur) |
   |-------------------|-------------------|
   | Total opérations | Nombre de transactions |
   | Total recettes   | Montant total des recettes (FCFA) |
   | Total dépenses   | Montant total des dépenses (FCFA) |
   | Solde            | Solde final (Recettes - Dépenses) |

   - Formatage : Alternance de couleurs
   - Bordures fines
   - Texte bleu en gras pour les valeurs

## 🚀 Fonctionnalités de génération

### Génération depuis la page Rapports

#### Options disponibles

1. **Télécharger Excel (immédiat)**
   - Génération frontend uniquement
   - Téléchargement immédiat du fichier
   - Sauvegarde automatique en base de données
   - Pas de fichier sur le serveur

2. **Générer et sauvegarder**
   - Génération backend
   - Fichier sauvegardé sur le serveur
   - Téléchargement automatique
   - Disponible pour téléchargement ultérieur

3. **Prévisualiser uniquement**
   - Génération locale
   - Affichage des statistiques
   - Pas de téléchargement
   - Sauvegarde en base de données

### Génération depuis la page Opérations

- **Menu "Exporter"** → **"Générer un rapport"**
- Utilise automatiquement la période sélectionnée dans les filtres
- Détection automatique du type de rapport :
  - 1 jour → Journalier
  - ≤ 7 jours → Hebdomadaire
  - ≤ 31 jours → Mensuel
  - ≥ 365 jours → Annuel
  - Autre → Personnalisé
- Génération et sauvegarde automatiques

## 💾 Système de sauvegarde

### Métadonnées sauvegardées

Chaque rapport généré est automatiquement enregistré en base de données avec :

- **Informations du fichier** :
  - Nom du fichier
  - Format (XLSX)
  - Type de rapport (daily, weekly, monthly, yearly, custom)
  - Chemin du fichier (si généré côté backend)

- **Période** :
  - Date de début
  - Date de fin

- **Statistiques** :
  - Nombre de transactions
  - Total des recettes
  - Total des dépenses
  - Solde final

- **Métadonnées** :
  - Utilisateur ayant généré le rapport
  - Date et heure de génération
  - Nombre de téléchargements
  - Dernier téléchargement (date, utilisateur)

### Avantages de la sauvegarde

1. **Historique complet** : Tous les rapports sont conservés
2. **Traçabilité** : Qui a généré quoi et quand
3. **Réutilisation** : Téléchargement ultérieur des rapports
4. **Statistiques** : Suivi de l'utilisation des rapports
5. **Audit** : Traçabilité complète des actions

## 📥 Gestion des rapports sauvegardés

### Liste des rapports

- **Affichage paginé** : 5, 10, 25, 50 rapports par page
- **Filtres disponibles** :
  - Par type : Journalier, Hebdomadaire, Mensuel, Annuel, Personnalisé
  - Par format : XLSX, PDF
  - Recherche par nom, période, utilisateur

### Informations affichées

Pour chaque rapport :

- **Nom du fichier**
- **Période** : Dates de début et de fin
- **Date de génération**
- **Généré par** : Nom ou email de l'utilisateur
- **Statistiques** :
  - Total entrées (recettes)
  - Total sorties (dépenses)
  - Solde net
  - Nombre de transactions
- **Statistiques de téléchargement** :
  - Nombre de téléchargements
  - Dernier téléchargement

### Actions disponibles

1. **Prévisualiser**
   - Affiche un résumé du rapport
   - Statistiques détaillées
   - Informations sur la période

2. **Télécharger depuis le serveur**
   - Si le fichier existe sur le serveur
   - Téléchargement du fichier original
   - Mise à jour des statistiques de téléchargement

3. **Régénérer en Excel**
   - Régénération avec le format frontend
   - Utilise les données actuelles de la période
   - Téléchargement immédiat

## 🔍 Filtres et recherche

### Filtres par type

- **Tous les types** : Affiche tous les rapports
- **Journalier** : Rapports quotidiens uniquement
- **Hebdomadaire** : Rapports hebdomadaires uniquement
- **Mensuel** : Rapports mensuels uniquement
- **Annuel** : Rapports annuels uniquement
- **Personnalisé** : Rapports avec période personnalisée

### Filtres par format

- **Tous les formats** : XLSX et PDF
- **Excel (XLSX)** : Rapports Excel uniquement
- **PDF** : Rapports PDF uniquement

### Recherche

La recherche fonctionne sur :
- **Nom du fichier**
- **Période** (dates)
- **Utilisateur** (nom ou email)

## 📈 Statistiques et KPIs

### KPIs affichés sur la page Rapports

1. **Total Encaissements**
   - Somme de toutes les recettes
   - Format : FCFA
   - Icône : TrendingUp (vert)

2. **Total Décaissements**
   - Somme de toutes les dépenses
   - Format : FCFA
   - Icône : TrendingDown (rouge)

3. **Solde Actuel**
   - Solde net (Recettes - Dépenses)
   - Format : FCFA
   - Icône : Wallet (bleu)

4. **Rapports Sauvegardés**
   - Nombre total de rapports en base de données
   - Icône : FileText (violet)

## 🔐 Permissions et rôles

### Administrateur
- ✅ Générer tous les types de rapports
- ✅ Télécharger tous les rapports
- ✅ Consulter l'historique complet
- ✅ Supprimer des rapports (si implémenté)

### Utilisateur
- ✅ Générer des rapports
- ✅ Télécharger ses propres rapports
- ✅ Consulter l'historique
- ❌ Supprimer des rapports d'autres utilisateurs

### Lecture seule (Readonly)
- ✅ Consulter les rapports
- ✅ Prévisualiser les rapports
- ❌ Générer de nouveaux rapports
- ❌ Télécharger des rapports

## 🛠️ Architecture technique

### Frontend

#### Composants principaux

- **`ReportsPage`** : Page principale des rapports
- **`useReport`** : Hooks React Query pour les rapports
  - `useReports` : Liste des rapports sauvegardés
  - `useDownloadSavedReport` : Téléchargement d'un rapport
  - `useGenerateBackendReport` : Génération backend
  - `useSaveReportMetadata` : Sauvegarde des métadonnées

#### Services

- **`api.ts`** :
  - `listReports()` : Liste paginée des rapports
  - `downloadReportById()` : Téléchargement par ID
  - `downloadReport()` : Génération et téléchargement
  - `saveReportMetadata()` : Sauvegarde des métadonnées

#### Utilitaires

- **`excel.ts`** :
  - `exportToExcel()` : Génération de fichiers Excel
  - Interface `ExcelColumn` : Configuration des colonnes
  - Interface `ExcelExportOptions` : Options d'export

### Backend

#### Modèles

- **`Report`** : Modèle principal
  - Champs : file, filename, format_type, report_type, date_from, date_to
  - Métadonnées : generated_by, generated_at
  - Statistiques : transaction_count, total_recettes, total_depenses, balance
  - Téléchargements : download_count, last_downloaded_at, last_downloaded_by

- **`ReportDownload`** : Historique des téléchargements
  - Champs : report, downloaded_by, downloaded_at, ip_address, user_agent

#### Vues API

- **`generate_report_view`** : Génération backend (GET)
  - Génère le fichier Excel/PDF
  - Sauvegarde le fichier sur le serveur
  - Crée l'enregistrement en base de données

- **`create_report_metadata_view`** : Sauvegarde métadonnées (POST)
  - Crée un enregistrement sans fichier
  - Pour les rapports générés côté frontend

- **`download_report_view`** : Téléchargement (GET)
  - Télécharge un rapport sauvegardé
  - Met à jour les statistiques de téléchargement

- **`list_reports_view`** : Liste des rapports (GET)
  - Liste paginée avec filtres
  - Retourne les métadonnées complètes

#### Utilitaires

- **`reports.py`** :
  - `generate_xlsx_report()` : Génération Excel backend
  - `generate_pdf_report()` : Génération PDF (optionnel)
  - Formatage professionnel avec couleurs et styles

## 📝 Format du nom de fichier

### Convention de nommage

```
rapport_{type}_{date_debut}_{date_fin}_{timestamp}.xlsx
```

Exemples :
- `rapport_monthly_2025-01-01_2025-01-31_20250215_143022.xlsx`
- `rapport_custom_2025-01-15_2025-02-15_20250215_143022.xlsx`
- `rapport_daily_2025-02-15_2025-02-15_20250215_143022.xlsx`

### Structure interne

- **Feuille unique** : "Rapport"
- **Lignes figées** : 4 premières lignes (logo, titre, stats, en-têtes)
- **Largeurs de colonnes** : Ajustées automatiquement
- **Hauteurs de lignes** : Optimisées pour la lisibilité

## 🎨 Design et formatage

### Couleurs utilisées

- **Bleu principal** : #0B177C
  - En-têtes, totaux, titres
- **Bleu clair** : #F0F4FF
  - Fond des lignes de statistiques
- **Gris** : #B8B8B8
  - Bordures
- **Gris clair** : #F5F5F5
  - Alternance des lignes de données

### Polices

- **Famille** : Calibri
- **Tailles** :
  - Titre : 20pt
  - En-têtes : 12pt
  - Données : 11pt
  - Statistiques : 11pt

### Formatage monétaire

- **Format** : #,##0 " FCFA"
- **Exemples** :
  - 1500000 → "1 500 000 FCFA"
  - 50000 → "50 000 FCFA"
  - 1000 → "1 000 FCFA"

## 🔄 Workflow de génération

### Workflow Frontend (Excel immédiat)

1. **Sélection de la période** : Utilisateur choisit le type ou la période
2. **Récupération des données** : Requête API pour les transactions
3. **Calcul des statistiques** : Calculs côté frontend
4. **Génération Excel** : Utilisation d'ExcelJS
5. **Téléchargement** : Téléchargement automatique
6. **Sauvegarde DB** : Enregistrement des métadonnées en base

### Workflow Backend (Sauvegarde serveur)

1. **Requête API** : Appel à `/api/transactions/reports/generate/`
2. **Génération serveur** : Utilisation d'openpyxl
3. **Sauvegarde fichier** : Stockage sur le serveur
4. **Enregistrement DB** : Création de l'enregistrement Report
5. **Téléchargement** : Retour du fichier au client

## 📊 Exemple de rapport généré

### Structure complète

```
┌─────────────────────────────────────────────────────────┐
│ [LOGO]                                                   │
├─────────────────────────────────────────────────────────┤
│ RAPPORT MENSUEL - JANVIER 2025                          │
├─────────────────────────────────────────────────────────┤
│ 📊 Période: 01/01/2025 au 31/01/2025 | Total: 150 ...  │
├─────────────────────────────────────────────────────────┤
│ ID | DATE | TYPE | CATÉGORIE | ... | MONTANT | SOLDE  │
├─────────────────────────────────────────────────────────┤
│ 1  | ...  | ...  | ...       | ... | ...     | ...     │
│ 2  | ...  | ...  | ...       | ... | ...     | ...     │
│ ...                                                      │
├─────────────────────────────────────────────────────────┤
│ TOTAL | ... | ... | ... | ... | 1 500 000 FCFA | ...  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📊 STATISTIQUES                                         │
│ Total opérations    | 150                               │
│ Total recettes      | 2 500 000 FCFA                    │
│ Total dépenses      | 1 000 000 FCFA                    │
│ Solde               | 1 500 000 FCFA                    │
└─────────────────────────────────────────────────────────┘
```

## 🚨 Gestion des erreurs

### Erreurs possibles

1. **Période invalide**
   - Message : "Veuillez sélectionner une période valide"
   - Solution : Vérifier les dates

2. **Aucune transaction**
   - Message : "Aucune transaction trouvée pour la période"
   - Solution : Choisir une autre période

3. **Erreur de génération**
   - Message : "Erreur lors de la génération du rapport"
   - Solution : Vérifier les logs, réessayer

4. **Erreur de sauvegarde**
   - Message : "Le rapport a été téléchargé mais n'a pas pu être sauvegardé"
   - Solution : Le fichier est téléchargé, mais pas enregistré en DB

## 💡 Bonnes pratiques

### Pour les utilisateurs

1. **Générer régulièrement** : Créer des rapports mensuels pour la comptabilité
2. **Nommer clairement** : Les noms de fichiers sont automatiques mais descriptifs
3. **Consulter l'historique** : Utiliser les rapports sauvegardés plutôt que de régénérer
4. **Vérifier les périodes** : S'assurer que la période correspond aux besoins

### Pour les développeurs

1. **Validation** : Toujours valider les dates avant génération
2. **Gestion d'erreurs** : Gérer gracieusement les erreurs de génération
3. **Performance** : Utiliser la pagination pour les grandes listes
4. **Cache** : Mettre en cache les requêtes fréquentes

## 🔮 Évolutions futures

### Fonctionnalités prévues

1. **Export PDF** : Génération de rapports PDF
2. **Rapports programmés** : Génération automatique périodique
3. **Templates personnalisés** : Personnalisation du format des rapports
4. **Envoi par email** : Envoi automatique des rapports
5. **Comparaisons** : Comparaison entre périodes
6. **Graphiques dans Excel** : Ajout de graphiques dans les rapports
7. **Multi-devises** : Support de plusieurs devises
8. **Export CSV** : Format CSV pour intégration

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025  
**Module** : Rapports CashTrack

