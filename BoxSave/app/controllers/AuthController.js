const express = require('express')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const bcrypt = require("bcrypt")
const moment = require('moment')
const crypto = require('crypto')

const AuthValidator = require('../functions/AuthValidator')
const SignUpValidator = require('../functions/SignUpValidator')
const connection = require('../functions/Database')
const SendCodeConfirmation = require('../functions/SendCodeConfirmation')
const generateRandomString = require('../functions/tools/GenerateRandomString')

const salt = +process.env.BCRYPT_SALT
const router = express.Router()
const RSA_PRIVATE_KEY = fs.readFileSync(process.cwd() + process.env.PRIVATE_KEY_PATH)
const RSA_PUBLIC_KEY = fs.readFileSync(process.cwd() + process.env.PUBLIC_KEY_PATH)

/**
 * Connexion de l'utilisateur
 */
router.post('/login', (req, res) => {

    const email = req.body.email ?? ''
    const password = req.body.password ?? ''
    const queryGetUser = "SELECT * FROM users WHERE email = ?"

    // Validate Email Rules
    const errors = new AuthValidator(email, password).checkIfErrorExist()

    if (errors.status === false) {

        connection.query(queryGetUser, [email], (error, results, fields) => {
            if (error) throw error;
            if (results.length >= 1) {
                bcrypt.compare(password, results[0].password)
                .then(boolean => {
                    if (boolean) {

                        delete results[0].password
                        const jwtBearerToken = jwt.sign({data: results[0]}, RSA_PRIVATE_KEY, {
                            algorithm: process.env.JWT_ALGORITHM,
                            expiresIn: process.env.JWT_EXPIRE_IN,
                            subject: String(results[0].id)
                        })

                        jwt.verify(jwtBearerToken, RSA_PUBLIC_KEY, (err, decoded) => {
                            if (err) throw err
                            res.status(200).send({
                                errors: {
                                    status: false,
                                    message: "Email et mot de passe authentifié"
                                },
                                idToken: jwtBearerToken,
                                expiresIn: decoded.exp,
                                data: { results: results[0] }
                            })
                        })

                    } else {
                        res.status(401).send({
                            errors: {
                                status: true,
                                message: "Email et mot de passe incorrecte"
                            }
                        })
                    }
                })
                .catch(err => {
                    res.status(500).send({
                        errors: {
                            status: true,
                            message: "Une erreur système s'est produite"
                        }
                    })
                })
            } else {
                res.status(404).send({
                    errors: {
                        status: true,
                        message: "Email et mot de passe incorrecte"
                    }
                })
            }
        })

    } else {
        res.status(401).send(errors)
    }

})

/**
 * Inscription de l'utilisateur
 */
router.post('/signup', (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const pseudo = req.body.pseudo
    const queryGetUserByEmail = "SELECT * FROM users WHERE email = ?"
    const queryGetUserByPseudo = "SELECT * FROM users WHERE UPPER(pseudo) = ?"
    const querySaveUser = "INSERT INTO users SET ?"
    const querySaveCode = "UPDATE users SET code_confirmation = ?, expired_at_code_confirmation = ? WHERE id = ?"

    const errors = new SignUpValidator(email, password, pseudo).checkIfErrorExist()

    if (errors.status === false) {

        connection.query(queryGetUserByEmail, [email], (error, resultsGetEmail, fields) => {
            if (error) throw error
            if (resultsGetEmail.length === 0) {
                connection.query(queryGetUserByPseudo, [pseudo.toUpperCase()], (error, results, fields) => {
                    if (error) throw Error
                    if (results.length === 0) {
                        bcrypt.genSalt(salt).then(salt => {
                            return bcrypt.hash(password, salt)
                        })
                        .then(hash => {
                            const code = generateRandomString(process.env.CODE_CONFIRMATION_SIZE)
                            const expired_at = moment().add(+process.env.CODE_CONFIRMATION_EXPIRATION, 's').format("YYYY-MM-DD HH:mm:ss")
                            connection.query(querySaveUser, {
                                pseudo: pseudo,
                                email: email,
                                password: hash,
                            }, (error, results, field) => {
                                if (error) throw error;
                                const idUser = results.insertId
                                /**
                                 * Sending code confirmation
                                 */
                                let emailErrors
                                const sendCodeConfirmation = new SendCodeConfirmation({id: idUser, pseudo, email}, code)
                                sendCodeConfirmation.send().then((response) => {
                                    emailErrors = {
                                        status: false,
                                        message: 'Le message à bien été envoyer'
                                    } 
                                    connection.query(querySaveCode, [code, expired_at, idUser], (error, results, fields) => {
                                        if (error) throw Error
                                    })
                                }).catch((error) => {
                                    emailErrors = {
                                        status: true,
                                        message: "Une erreur s'est produite lors de l'envoi du message..."
                                    } 
                                }).finally((response) => {
                                    res.status(200).send({
                                        errors: {
                                            status: false,
                                            message: "L'utilisateur " + pseudo + " à bien été enregistrer !",
                                        },
                                        emailErrors,
                                        data: { result: {
                                            pseudo: pseudo,
                                            email: email,
                                        }}
                                    })
                                })
                            })
                        })
                        .catch(err => {
                            res.status(500).send({
                                status: true,
                                message: "Erreur lors du hashage du mot de passe",
                                err: err
                            })
                        })
                    } else {
                        res.status(400).send({
                            status: true,
                            message: "Ce pseudo n'est pas disponible !"
                        })
                    }
                })
            } else {
                res.status(400).send({
                    status: true,
                    message: "Un utilisateur est déja enregistrer avec cet email"
                })
            }
        })

    } else {
        res.status(400).send(errors)
    }

})

/**
 * Vérification pseudo disponible lors de l'inscription
 */
router.post('/check-pseudo', (req, res) => {
    const getUserByPseudo = "SELECT pseudo FROM users WHERE UPPER(pseudo) = ?"
    const pseudo = req.body.pseudo
    if (pseudo) {
        connection.query(getUserByPseudo, [pseudo.toUpperCase()], (error, results, fields) => {
            if (results.length > 0) {
                res.status(200).send({
                    statusCode: 1,
                    message: "Un utilisateur avec le pseudo " + pseudo + " est déja enregistrée"
                })
            } else if (results.length === 0) {
                res.status(200).send({
                    statusCode: 0
                })
            } else {
                res.status(500).send({
                    status: true,
                    message: "une erreur est présente..."
                })
            }
        })
    } else {
        res.status(400).send({
            status: true,
            message: "Pseudo vide !"
        })
    }
})

/**
 * Vérification email disponible lors de l'inscription
 */
router.post('/check-email', (req, res) => {
    const getUserByEmail = "SELECT email FROM users WHERE LOWER(email) = ?"
    const email = req.body.email
    if (email) {
        connection.query(getUserByEmail, [email.toLowerCase()], (error, results, fields) => {
            if (results.length > 0) {
                res.status(200).send({
                    statusCode: 1,
                    message: "Un utilisateur avec l'email " + email + " est déja enregistrée"
                })
            } else if (results.length === 0) {
                res.status(200).send({
                    statusCode: 0
                })
            } else {
                res.status(500).send({
                    status: true,
                    message: "une erreur est présente..."
                })
            }
        })
    } else {
        res.status(400).send({
            status: true,
            message: "email vide !"
        })
    }
})

/**
 * Vérification de l'adresse email
 */
router.get('/confirm-email', (req, res) => {
    const code = req.query.code
    const userId = +req.query.id
    const queryGetUser = "SELECT * FROM users WHERE id = ?"
    const queryUpdateUserConfirmation = "UPDATE users SET is_confirmed = ?, code_confirmation = NULL, expired_at_code_confirmation = NULL WHERE id = ?"

    if (code && userId) {
        connection.query(queryGetUser, [userId], (error, results, field) => {
            if (error) throw Error
            if (Array.from(results).length > 0) {
                const user = results[0]
                if (user.code_confirmation === code && moment().isBefore(moment(user.expired_at_code_confirmation))) {
                    connection.query(queryUpdateUserConfirmation, [true, userId], (error, results, fields) => {
                        if (error) throw Error
                        res.status(200).send("L'adresse électronique: " + user.email + " à bien été validée !")
                    })
                } else {
                    res.status(401).send("Erreur lors de la validation de votre email")
                }
            } else {
                res.status(401).send("Erreur...")
            }
        })
    } else {
        res.status(401).send("Url non valide !")
    }
})



module.exports = router