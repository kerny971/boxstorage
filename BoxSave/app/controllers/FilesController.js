const express = require('express')
const { expressjwt: jwt } = require('express-jwt')
const fs = require('fs')
const connection = require('../functions/Database')
const moment = require('moment');
const router = express.Router()

const RSA_PUBLIC_KEY = fs.readFileSync(process.cwd() + process.env.PUBLIC_KEY_PATH)

const queryGetMediaById = "SELECT * FROM files WHERE id = ?"
const queryGetMediaByCode = "SELECT * FROM files WHERE code = ?"
const queryUpdateMediaById = "UPDATE files SET code = ?, updated_code = ? WHERE id = ?"

const checkIfAuthenticated = jwt({
    algorithms: [process.env.JWT_ALGORITHM],
    secret: RSA_PUBLIC_KEY,
    credentialsRequired: false
})

const checkUserMedia = (req, res, next) => {
    const code = req.query.code
    connection.query(queryGetMediaByCode, [code], (error, results, fields) => {
        if (error) throw Error
        if (results.length >= 1) {
            if (!results[0].updated_code) {
                res.status(401).send("Unauthorized Access")
            } else {
                if (moment().isBefore(moment(results[0].updated_code))) {
                    connection.query(queryUpdateMediaById, [null, null,results[0].id], (error, results, fields) => {
                        if (error) throw Error
                    })
                    next()
                } else {
                    res.send("Unauthorized Access !")
                }
            }
        } else {
            res.status(403).send("Unauthorized Access !")
        }
    })
}

const verifyUserIsConfirmed = (req, res, next) => {
    const queryCheckUserIsConfirmed = "SELECT is_confirmed FROM users WHERE id = ?"
    const userId = +req.auth.sub
    connection.query(queryCheckUserIsConfirmed, [userId], (error, results, fields) => {
        if (error) throw Error
        if (Array.from(results).length > 0) {
            const user = results[0];
            if (user.is_confirmed) {
                next()
            } else {
                res.status(403).send('Accès non autorisée')
            }
        } else {
            res.status(403).send('Accès non autorisée')
        }
    })
}

/**
 * Vérifier que l'utilisateur et connecté et son compte est valide
 */
router.use('/download', checkIfAuthenticated)
router.use('/download', verifyUserIsConfirmed)

/**
 * Vérifier l'accès au lien partager garce à un hash dans l'url
 */
router.use('/users', checkUserMedia)

/**
 * Générer le hash d'accès au lien de l'utilisateur
 */
router.post('/download/:id', (req, res) => {
    const id = +req.params.id
    if (!id) {
        res.status(404).send({
            errors: {
                status: true,
                message: "l'id de votre fichier doit être indiquée"
            }
        })
    }

    connection.query(queryGetMediaById, [id], (error, results, fields) => {
        if (error) throw Error
        if (results.length >= 1) {
            if (results[0].user_id === +req.auth.sub) {
                const code = makeid(process.env.CODE_MEDIA_SIZE)
                const time = moment().add(process.env.DURATION_CODE_MEDIA_VALIDATION, 'm').format("YYYY-MM-DD HH:mm:ss")
                connection.query(queryUpdateMediaById, [code, time, id], (errorUp, results, fields) => {
                    if (errorUp) throw Error
                    res.status(200).send({
                        errors: {
                            status: false,
                            message: "Tables des fichiers mis à jour !"
                        },
                        data: {
                            mediaId: id,
                            code: code,
                        }
                    })
                })
            } else {
                res.status(403).send({
                    errors: {
                        status: true,
                        message: "Vous ne posséder pas les droits sur ce fichier"
                    }
                })
            }
        } else {
            res.status(404).send({
                errors: {
                    status: true,
                    message: "Ce fichier n'existe pas !"
                }
            })
        }
    })
})



function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

module.exports = router