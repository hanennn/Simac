**SIMAC**
c'est une plateforme web de gestion budgétaire par département, développée dans le cadre d'un projet de stage

**À propos du projet**
SIMAC est née d'un constat simple : dans beaucoup d'organisations, le suivi budgétaire par département repose encore sur des fichiers Excel dispersés, des échanges d'emails, et une visibilité limitée sur l'état réel des dépenses en cours. Le projet propose une alternative centralisée, où chaque département dispose de son propre budget suivi en temps réel, où chaque dépense passe par un circuit de validation clair, et où les décisions budgétaires peuvent s'appuyer sur une estimation assistée par intelligence artificielle plutôt que sur de simples intuitions.
Au-delà du simple suivi financier, SIMAC va plus loin en intégrant directement un ERP (Odoo) pour la gestion des achats : un chef de département peut parcourir un catalogue de produits, passer commande, et voir automatiquement la dépense correspondante remonter dans son suivi budgétaire
Le projet a été développé dans le cadre d'un projet de stage, avec une attention particulière portée à la sécurité, à l'expérience utilisateur et à une architecture propre, pensée pour être maintenable et évolutive

**Fonctionnalités**

**Authentification et sécurité.** Connexion en deux étapes (mot de passe puis code OTP par email), verrouillage du compte après plusieurs tentatives échouées, et verrouillage automatique de session en cas d'inactivité.

**Gestion multi-rôles.** Quatre profils avec des permissions dédiées : Administrateur (utilisateurs, départements), Responsable financier (budgets, validation des dépenses), Chef de département (dépenses, achats) et Gestionnaire de produits (catalogue Odoo).

**Suivi budgétaire.** Budgets définis par département et par période, avec montant alloué et consommé mis à jour automatiquement, et alertes en cas de dépassement.

**Circuit de validation des dépenses.** Chaque dépense passe par un statut "en attente" jusqu'à validation ou rejet par un responsable financier, avec notification par email au chef de département concerné.

**Estimation budgétaire par IA.** Un modèle Qwen2.5 exécuté localement (via Ollama) propose une estimation de budget et une prédiction de dépassement, basées sur l'historique réel des dépenses.

**Intégration ERP Odoo.** Catalogue produits et commandes d'achat gérés directement via Odoo (XML-RPC), avec synchronisation automatique des dépenses correspondantes.

**Tableau de bord temps réel.** Graphiques mis à jour automatiquement via WebSocket, sans rechargement de page, dès qu'une dépense change de statut.

**Architecture**
L'application suit une architecture client-serveur en trois couches principales. Le frontend, développé en Angular avec des composants standalone et des signals pour la gestion d'état, communique avec le backend Spring Boot par des appels REST pour l'ensemble des opérations métier, et maintient une connexion WebSocket persistante pour les mises à jour du tableau de bord en temps réel.
Le backend centralise toute la logique métier et la sécurité. Il persiste ses propres données — utilisateurs, départements, budgets, dépenses, codes de vérification — dans une base PostgreSQL via Spring Data JPA et Hibernate. Pour tout ce qui concerne les produits et les achats, il ne stocke rien localement : chaque requête est traduite en appel XML-RPC vers une instance Odoo externe, qui reste la source de vérité unique pour le catalogue. Pour les fonctionnalités d'intelligence artificielle, le backend prépare et transmet les données pertinentes à un modèle Qwen2.5 exécuté localement via Ollama.
La sécurité repose sur des jetons JWT pour authentifier chaque requête après la connexion initiale, avec un intercepteur dédié qui valide également ces jetons lors de l'établissement des connexions WebSocket.
En production, cette architecture se répartit sur trois plateformes distinctes : le backend tourne dans un conteneur Docker sur Render, le frontend est servi statiquement par Vercel, et la base de données PostgreSQL est hébergée sur Neon.


**Installation**
Prérequis
Le projet nécessite Java 17 avec Maven pour le backend, Node.js 20 ou supérieur pour le frontend, une instance PostgreSQL 15 ou supérieure, Docker Desktop pour faire tourner Odoo localement, et Ollama pour exécuter le modèle d'intelligence artificielle.
Base de données
Crée une base PostgreSQL dédiée au projet : CREATE DATABASE db_Simac;
Backend
Configure src/main/resources/application.properties avec tes propres identifiants (base de données, JWT, email, Odoo, IA, CORS) 
Lancer le backend depuis la racine du projet : mvn spring-boot:run
Un compte Administrateur est créé automatiquement au tout premier lancement.

**ERP Odoo**
Odoo tourne dans deux conteneurs Docker distincts :
docker start odoo-simac
docker start odoo-db

L'interface Odoo devient accessible sur http://localhost:8069. Il faut y configurer au préalable une base nommée simac, un utilisateur administrateur correspondant aux identifiants renseignés côté backend, des groupes pour les utilisateurs, des catégories de produits alignées avec les départements SIMAC, une catégorie supplémentaire nommée All pour les produits partagés, au moins un fournisseur, et un champ personnalisé x_categorie_depense sur le modèle produit.

**Lancement avec Docker Compose**
Le projet backend contient un Dockerfile, qui construit l'image de l'application Spring Boot :
**dockerfile**
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]


Ainsi qu'un **docker-compose.yml**, qui orchestre l'ensemble des services (backend, PostgreSQL, Odoo et sa base). Ce dernier n'est pas versionné sur le dépôt car il contient des identifiants sensibles.
yaml
services:

  postgres:
    image: postgres:15-alpine
    container_name: simac-postgres
    environment:
      POSTGRES_DB: db_Simac
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 123456789
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: simac-backend
    depends_on:
      postgres:
        condition: service_healthy
      odoo:
        condition: service_started
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/db_Simac
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: "123456789"
      JWT_SECRET: "ZmFrZUtleUZvckRldkVudmlyb25tZW50T25seU5vdEZvclByb2R1Y3Rpb25Vc2FnZQ=="
      SPRING_MAIL_USERNAME: hanen.bennaceur@esprit.tn
      SPRING_MAIL_PASSWORD: "etrj ocsw ltkb hpwq"
      ODOO_URL: http://odoo:8069
      ODOO_DB: simac
      ODOO_USERNAME: hanenbennaceur115@gmail.com
      ODOO_PASSWORD: "123456789"
      SPRING_AI_OLLAMA_BASE_URL: "http://host.docker.internal:11434"
      CORS_ALLOWED_ORIGINS: http://localhost:4200
    ports:
      - "8081:8081"

  odoo-db:
    image: postgres:15-alpine
    container_name: odoo-db
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: odoo
    volumes:
      - odoo_db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U odoo"]
      interval: 5s
      timeout: 5s
      retries: 5

  odoo:
    image: odoo:17
    container_name: odoo-simac
    depends_on:
      odoo-db:
        condition: service_healthy
    environment:
      HOST: odoo-db
      USER: odoo
      PASSWORD: odoo
    ports:
      - "8069:8069"
    volumes:
      - odoo_data:/var/lib/odoo

volumes:
  postgres_data:
  odoo_db_data:
  odoo_data:

Lancement de l'ensemble des services : docker-compose up --build
Cette commande construit l'image du backend et démarre tous les services : le backend sur http://localhost:8081, la base de données SIMAC, ainsi qu'Odoo sur http://localhost:8069 avec sa propre base. Ollama continue de tourner en dehors de Docker, sur la machine hôte. Pour tout arrêter proprement : docker-compose down

**Intelligence artificielle**
Télécharger le modèle utilisé par l'application : ollama pull qwen2.5
Ollama expose ensuite ce modèle sur http://localhost:11434, sans configuration supplémentaire.

**Frontend**
Installer les dépendances puis lance le serveur de développement :
npm install
ng serve

Le frontend devient accessible sur http://localhost:4200.
**Utilisation**
L'ordre de démarrage recommandé : Docker Desktop, puis les conteneurs Odoo, une vérification qu'Ollama répond correctement, puis le backend, et enfin le frontend.
docker start odoo-simac odoo-db
ollama list
mvn spring-boot:run
ng serve
Les comptes autres qu'Administrateur sont créés depuis l'interface de gestion des utilisateurs, avec un mot de passe temporaire envoyé par email au nouvel utilisateur.

**Déploiement**
Le backend est packagé sous forme d'image Docker et déployé sur Render, le frontend est compilé puis hébergé statiquement sur Vercel, et la base de données PostgreSQL tourne sur Neon. Pour l'envoi d'emails en production, le projet bascule de SMTP vers l'API de Resend, la plupart des hébergeurs gratuits bloquant par défaut les connexions SMTP sortantes.
Odoo et Ollama ne sont pas déployés et continuent de tourner exclusivement en local. Pour rendre les fonctionnalités qui en dépendent accessibles depuis la version déployée, il faut exposer temporairement ces services via un tunnel comme ngrok.

Projet réalisé dans le cadre d'un projet de stage — 2025/2026
