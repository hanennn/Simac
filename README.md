# SIMAC

Application web de gestion budgétaire par département, développée dans le cadre d'un stage d'immersion en entreprise chez SIMAC Tunisie.

## Table des matières

- [Fonctionnalités principales](#fonctionnalités-principales)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Cloner le projet](#cloner-le-projet)
- [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
- [Lancer le projet en local (sans Docker)](#lancer-le-projet-en-local-sans-docker)
- [Lancer le projet avec Docker](#lancer-le-projet-avec-docker)
- [Déploiement](#déploiement)
- [Limitation connue](#limitation-connue)
- [Auteur](#auteur)

## Fonctionnalités principales

- Authentification sécurisée avec vérification en deux étapes (OTP par email)
- Gestion des départements, budgets, dépenses et catégories
- Circuit de validation des dépenses (validation / rejet) avec notification par email
- Estimation budgétaire et prédiction de risque de dépassement assistées par intelligence artificielle
- Intégration avec un ERP pour la gestion du catalogue produits et des commandes d'achat
- Tableau de bord en temps réel (WebSocket)

## Stack technique

| Composant | Technologie |
|---|---|
| Backend | Spring Boot (Java) |
| Frontend | Angular |
| Base de données | PostgreSQL |
| Intelligence artificielle | Ollama (modèle Qwen2.5) via Spring AI |
| ERP | Intégration via WebServices |
| Envoi d'emails | SMTP (local) / Resend (production) |
| Conteneurisation | Docker |

## Prérequis

Avant de lancer le projet, assure-toi d'avoir installé :

- **Java 17** ou supérieur
- **Maven** (ou utilise le wrapper `./mvnw` inclus dans le projet)
- **Node.js** (version 18 ou supérieure) et **npm**
- **PostgreSQL** (version 14 ou supérieure)
- **Docker** et **Docker Compose** (si tu préfères lancer le projet en conteneurs)
- **Ollama**, avec le modèle `qwen2.5` téléchargé (pour les fonctionnalités d'IA)

## Cloner le projet

```bash
git clone https://github.com/<ton-nom-utilisateur>/SIMAC.git
cd SIMAC
```

## Configuration des variables d'environnement

Le backend nécessite les variables d'environnement suivantes. Crée un fichier `.env` (ou configure-les directement dans ton environnement / IDE) à la racine du dossier backend :

```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/simac
SPRING_DATASOURCE_USERNAME=<ton_utilisateur_postgres>
SPRING_DATASOURCE_PASSWORD=<ton_mot_de_passe_postgres>

JWT_SECRET=<une_cle_secrete_longue_et_aleatoire>

SPRING_MAIL_USERNAME=<ton_adresse_email>
SPRING_MAIL_PASSWORD=<mot_de_passe_application_email>

ODOO_URL=<url_de_ton_instance_odoo>
ODOO_DB=<nom_de_la_base_odoo>
ODOO_USERNAME=<compte_technique_odoo>
ODOO_PASSWORD=<mot_de_passe_compte_technique_odoo>

SPRING_AI_OLLAMA_BASE_URL=http://localhost:11434

CORS_ALLOWED_ORIGINS=http://localhost:4200
```

⚠️ Ne commite jamais ce fichier `.env` — il est déjà exclu via `.gitignore`.

## Lancer le projet en local (sans Docker)

### 1. Créer la base de données PostgreSQL

```bash
psql -U postgres
CREATE DATABASE simac;
\q
```

### 2. Lancer Ollama et télécharger le modèle

```bash
ollama serve
ollama pull qwen2.5
```

### 3. Lancer le backend

Depuis la racine du projet backend :

```bash
./mvnw clean install
./mvnw spring-boot:run
```

Le backend démarre par défaut sur **http://localhost:8080**.

### 4. Lancer le frontend

Dans un nouveau terminal, depuis la racine du projet frontend :

```bash
npm install
ng serve
```

Le frontend est accessible sur **http://localhost:4200**.

## Lancer le projet avec Docker

Le projet inclut un `Dockerfile` pour le backend, un `Dockerfile` pour le frontend, ainsi qu'un fichier `docker-compose.yml` à la racine, orchestrant l'ensemble des services (backend, frontend, base de données).

Assure-toi d'avoir renseigné les variables d'environnement nécessaires (voir section précédente), puis lance :

```bash
docker compose up --build
```

L'application sera accessible sur **http://localhost:4200** (frontend) et **http://localhost:8080** (backend), une fois les conteneurs démarrés.

Pour arrêter les services :

```bash
docker compose down
```

## Déploiement

L'application est déployée en production sur trois plateformes distinctes :

| Composant | Plateforme |
|---|---|
| Backend | Render |
| Frontend | Vercel |
| Base de données | Neon (PostgreSQL managé) |

Le déploiement du backend et du frontend s'appuie sur les `Dockerfile` respectifs présents dans le projet. La base de données a été migrée vers une instance PostgreSQL managée sur Neon, configurée via la variable `SPRING_DATASOURCE_URL` pointant vers l'URL de connexion fournie par Neon.

L'envoi d'emails en production utilise l'API HTTP de Resend plutôt que le protocole SMTP, ce dernier étant bloqué par défaut sur la plupart des hébergeurs gratuits.

⚠️ Odoo et Ollama continuent de tourner en local et ne sont pas exposés en production (voir la limitation ci-dessous).

## Limitation connue

Odoo et Ollama tournant en local, les fonctionnalités liées (achats, estimation par IA) ne sont pas accessibles depuis la version déployée sans exposer ces services via un tunnel (par exemple ngrok).

## Auteur

Hanen Ben Naceur — Stage d'immersion en entreprise, ESPRIT, 2026
