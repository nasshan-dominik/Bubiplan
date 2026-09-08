# BubiPlan — Déploiement PWA

## Fichiers nécessaires

- `index.html` — L'application principale (service worker auto-enregistré)
- `sw.js` — Service worker pour cache hors-ligne
- `manifest.webmanifest` — Manifest PWA (installation native)
- `icon-192.png` — Icône 192×192 px
- `icon-512.png` — Icône 512×512 px
- `icon-1024.png` — Icône 1024×1024 px

## Activation du service worker

L'enregistrement du SW se fait automatiquement au premier chargement :

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
```

## Stratégies de cache

1. **Assets applicatifs** (HTML, manifest, icônes) — Cache-first
2. **Photos produits externes** (weserv.nl, etc.) — Cache puis réseau
3. **Photos déposées en local** (/photos/) — Cache avec fallback réseau

## Mode hors-ligne

Une fois la première visite complétée, l'app fonctionne entièrement hors-ligne :
- Consultation des projets existants ✓
- Édition des planogrammes ✓
- Accès aux photos en cache ✓
- Sync des données à la reconnexion (IndexedDB)

## Déploiement

Servir via HTTPS (le SW est rejeté en HTTP).

```bash
# Vérifier le SW dans DevTools
# Appareils → Onglet Application → Service Workers
```

## Version cache

Mise à jour du SW : changer `const CACHE = 'bubiplan-v59'` → `'bubiplan-v60'`

Le SW nettoie les anciennes versions automatiquement à l'activation.
