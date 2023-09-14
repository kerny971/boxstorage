const express = require('express')
const fs = require('fs')
const { expressjwt: jwt } = require('express-jwt')
const router = express.Router()

/**
 * Autorisée le téléchargement du fichiers à l'utilisateur qui l'à mis en ligne
 */
router.use('/users', (req, res, next) => {
    if (req.auth) {
        const userId = +req.auth.sub ?? 0
        const urlId = +req.originalUrl.split("/")[3]
        if (userId === urlId) {
            next();
        } else {
            res.status(401).send("Unauthorized Access !")
        }
    } else {
        res.status(401).send("Vous devez être authentifiée pour accéder à ce contenu !")
    }
})

module.exports = router
