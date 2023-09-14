const generateRandomString = require('./tools/GenerateRandomString')
const moment = require('moment')
const SendEmail = require('./SendEmail')

module.exports = class SendCodeConfirmation {


    constructor (user, code) {
        this._user = user
        this._code = code
        this._subject = process.env.SUBJECT_EMAIL_CONFIRMATION
        this._link = process.env.CONFIRMATION_EMAIL_LINK + "?id=" + user.id + "&code=" + code
        
        this._text = `
            Chèr(e) ${user.pseudo}, \n
            \n
            Vérifiez votre adresse email afin de valider votre inscription sur BoxStorage.  \n
            Confirmez que l'adresse ${user.email} est bien la vôtre en accédant au lien ci-dessous valable les deux prochaines heures suivant la réception de ce mail : \n
            ${this._link} 
            \n \n 
            Si vous n'êtes pas à l'origine de ce message, veuillez ne pas prendre en compte les instructions indiquée.
        `;
        this._html = `
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
                        <a href='${this._link}' class="btn-email">
                            Je valide mon adresse électronique
                        </a>
                    <p>
                    <small>Si vous n'êtes pas à l'origine de ce message, veuillez ne pas prendre en compte les instructions indiquée.</small>
                </div>
            </body>
        `;
    }

    send () {
        const sendEmail = new SendEmail(this._user, this._subject, this._text, this._html)
        return sendEmail.send()
    }

}