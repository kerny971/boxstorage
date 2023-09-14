const moment = require('moment')
const express = require('express')
const crypto = require('crypto')
const { expressjwt: jwt } = require('express-jwt')
const fs = require('fs')

const SendEmail = require('../functions/SendEmail')
const generateRandomString = require('../functions/tools/GenerateRandomString')
const connection = require('../functions/Database')

const router = express.Router()

const RSA_PUBLIC_KEY = fs.readFileSync(process.cwd() + process.env.PUBLIC_KEY_PATH)

/**
 * Envoyer la confirmation d'email à l'utilisateur pré-inscrit
 */
router.post('/set-confirm-email', (req, res) => {
    const userId = +req.auth.sub
    const queryGetUser = "SELECT * FROM users WHERE id = ?"
    const queryUpdateUserCodeConfirmation = 'UPDATE users SET code_confirmation = ?, expired_at_code_confirmation = ? WHERE id = ?'
    let code = generateRandomString(128)
    const hash = crypto.createHash('sha256')
    hash.update(code)
    code = hash.digest('hex')
    const expired_date = moment().add(process.env.CODE_CONFIRMATION_EXPIRATION, 's').format("YYYY-MM-DD HH:mm:ss")

    connection.query(queryGetUser, [userId], async (error, results, fields) => {
        if (Array.from(results).length > 0) {
            const user = results[0]
            if (!user.is_confirmed) {
                if (user.expired_at_code_confirmation && moment().isBefore(moment(user.expired_at_code_confirmation))) {
                    res.status(200).send({
                        status: false,
                        message: "Utilisateur mis à jour",
                        created: false,
                        date: moment(user.expired_at_code_confirmation).diff(moment(), 's')
                    })
                } else {
                    // On envoie l'email
                    const subject = process.env.SUBJECT_EMAIL_CONFIRMATION
                    const link = process.env.CONFIRMATION_EMAIL_LINK + "?id=" + user.id + "&code=" + code
                    const text = `
                        Chèr(e) ${user.pseudo}, \n
                        \n
                        Vérifiez votre adresse email afin de valider votre inscription sur BoxStorage.  \n
                        Confirmez que l'adresse ${user.email} est bien la vôtre en accédant au lien ci-dessous valable les deux prochaines heures suivant la réception de ce mail : \n
                        ${link} 
                        \n \n 
                        Si vous n'êtes pas à l'origine de ce message, veuillez ne pas prendre en compte les instructions indiquée.
                    `
                    const html = `
                        <head>
                            <style>
                                .btn-email {
                                    display: block;
                                    margin: 2em auto;
                                    padding: 1em;
                                }
            
                                div {
                                    max-width: 300px;
                                    padding: 1em;
                                    margin: 1em auto;
                                    text-align: center;
                                }
                            </style>
                        </head>
                        <body>
                            <div>
                                <h1>BoxStorage</h1>
                                Chèr(e) ${user.pseudo},
                                <p>
                                    Vérifiez votre adresse électronique afin de valider votre inscription sur BoxStorage.<br/>
                                    Confirmez que l'adresse ${user.email} est bien la vôtre en accédant au lien ci-dessous valable les deux prochaines heures suivant la réception de ce mail :<br/>
                                    <a href='${link}' class="btn-email">
                                        Je valide mon adresse électronique
                                    </a>
                                <p>
                                <small>Si vous n'êtes pas à l'origine de ce message, veuillez ne pas prendre en compte les instructions indiquée.</small>
                            </div>
                        </body>
                    `
                    const sendEmail = new SendEmail(user, subject, text, html)
                    sendEmail.send().then((response) => {
                        connection.query(queryUpdateUserCodeConfirmation, [code, expired_date, userId], (error, results, fields) => {
                            if (error) throw Error
                            res.status(200).send({
                                status: false,
                                message: "Utilisateur mis à jour",
                                created: true,
                                date: moment(expired_date).diff(moment(), 's')
                            })
                        })
                    }).catch((error) => {
                        res.status(500).send({
                            status: false,
                            message: "Une erreur s'est produite..."
                        })
                    })
                    res.status(200)
                }
            } else {
                res.status(403).send()
            }
        } else {
            res.status(403).send()
        }
    })
})

module.exports = router