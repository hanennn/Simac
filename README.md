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
git clone https://github.com/hanennn/SIMAC.git
cd SIMAC
```

## Configuration des variables d'environnement

Le backend nécessite les variables d'environnement suivantes :

spring.application.name=SIMAC

# Configuration PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/db_Simac
spring.datasource.username=postgres
spring.datasource.password=123456789

# Driver PostgreSQL
spring.datasource.driver-class-name=org.postgresql.Driver

# Configuration JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

server.port=8081


# JWT
jwt.secret=ZmFrZUtleUZvckRldkVudmlyb25tZW50T25seU5vdEZvclByb2R1Y3Rpb25Vc2FnZQ==
jwt.expiration=86400000


# Email (SMTP Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=hanen.bennaceur@esprit.tn
spring.mail.password=etrj ocsw ltkb hpwq
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true


odoo.url=http://localhost:8069
odoo.db=simac
odoo.username=hanenbennaceur115@gmail.com
odoo.password=123456789

#ia
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.model=qwen2.5

# Email (via Resend API)
resend.api-key=${RESEND_API_KEY}
resend.from-email=onboarding@resend.dev

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
| Base de données | Neon  |

Le déploiement du backend et du frontend s'appuie sur les `Dockerfile` respectifs présents dans le projet. La base de données a été migrée vers Neon, configurée via la variable `SPRING_DATASOURCE_URL` pointant vers l'URL de connexion fournie par Neon.

L'envoi d'emails en production utilise l'API HTTP de Resend plutôt que le protocole SMTP, ce dernier étant bloqué par défaut sur la plupart des hébergeurs gratuits.

 Odoo et Ollama continuent de tourner en local et ne sont pas exposés en production (voir la limitation ci-dessous).

## Limitation connue

Odoo et Ollama tournant en local, les fonctionnalités liées (achats, estimation par IA) ne sont pas accessibles depuis la version déployée sans exposer ces services via un tunnel (par exemple ngrok).



Hanen Ben Naceur — Stage d'immersion en entreprise, ESPRIT, 2026
