# BoxStorageAPI

### Introduction

Cette application est une API backend permettant de créer un système de cloud en ligne auto-hébergée.

Les fichiers envoyées sont stocker sur le serveur et ses informations sur une base de données MYSQL dont le schéma correspond au fichier box-storage.sql présent à la racine du dossier.

On utilise deux tables Users et Files pour l'enregistrement des utilisateurs de l'application et l'enregistrement des fichiers uploadée par eux-même !

Cette application est actuellement stateless, aucune session de connexion est établie cotée serveur. L'authentification est maintenue grace au jeton JWT.


### Installation
    npm install
    npm start
Editer le fichier .env présent à la racine
