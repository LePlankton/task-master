# Task Master — Application de gestion de tâches full-stack

> Application web complète de gestion de tâches personnelles avec authentification JWT, catégories, sous-tâches et filtres dynamiques.

**Status : 🟡 En développement**

---

## Aperçu

Task Master est une application web full-stack complète de gestion de tâches personnelles. Elle couvre l'intégralité d'un cycle de développement moderne : API REST Express sécurisée par JWT, base de données PostgreSQL gérée avec Prisma ORM, et interface React avec gestion d'état, filtres dynamiques et modales. Conçue pour démontrer la maîtrise d'un stack PERN (PostgreSQL, Express, React, Node.js) dans un cas d'usage concret et déployable.

---

## Fonctionnalités prévues

- [x] Authentification complète (inscription / connexion) avec JWT
- [x] Création, modification et suppression de tâches
- [x] Catégories personnalisées avec couleurs
- [x] Sous-tâches avec toggle de complétion
- [x] Priorités (haute, moyenne, basse) et date d'échéance
- [x] Filtres par statut, priorité et catégorie
- [ ] Drag & drop pour réorganiser les tâches
- [ ] Notifications de rappel (due date)
- [ ] Déploiement cloud (Railway / Render)

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 19, TypeScript, Vite, React Router v6 |
| Backend | Node.js, Express, TypeScript |
| Base de données | PostgreSQL 18, Prisma ORM 7 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| HTTP Client | Axios |

---

## Pourquoi ce projet ?

Task Master répond au besoin classique de démontrer la maîtrise d'un stack full-stack cohérent, de la base de données à l'interface. Il illustre la gestion de l'authentification sécurisée, des relations de données (utilisateurs → tâches → sous-tâches), et d'une UI réactive avec filtrage côté serveur. C'est un projet ancré dans des problèmes réels que tout développeur web rencontre en production.

---

## Contact

Zahcaria KERRAS — [krsv2v.officiel@gmail.com](mailto:krsv2v.officiel@gmail.com)

> Le code source est privé. Ce repo documente le projet publiquement.
