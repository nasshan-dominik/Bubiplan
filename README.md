# BubiPlan

Application de planogrammes Bubimex. Un seul fichier, aucune installation serveur,
fonctionne hors ligne une fois ajoutée à l'écran d'accueil de l'iPad.

## Mettre à jour l'application

Remplace `index.html` puis valide. C'est tout : la publication et le numéro de cache
sont gérés automatiquement, l'iPad prendra la nouvelle version à la prochaine
ouverture.

## Ajouter des visuels produits

Dépose les images dans le dossier `photos/`, nommées par référence : `9070.jpg`.
Voir `photos/README.md`.

## Corriger le catalogue sans republier l'application

Crée un fichier `catalogue.json` à la racine :

```json
{
  "corrections": [
    { "ref": "9099", "w": 23, "h": 8, "d": 16, "df": 1, "st": 2 }
  ]
}
```

Les cotes sont en centimètres, vues de face. `df` est le nombre de boîtes de face par
défaut, `st` le nombre de boîtes superposées. L'application applique ces corrections au
démarrage.

## Suivre les idées et les anomalies

L'onglet **Issues** du dépôt tient lieu de carnet : une idée, une anomalie, un ticket.
Rien à installer.
