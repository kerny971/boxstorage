const nodemailer = require('nodemailer')


module.exports = class SendEmail {

    constructor (user, subject, text, html) {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })

        this.msg = {
            from: `'${process.env.FROM_NAME_EMAIL_CONFIRMATION}' <${process.env.FROM_EMAIL_EMAIL_CONFIRMATION}>`,
            to: `'${user.pseudo}' <${user.email}>`,
            subject: subject,
            text: text,
            html: html
        }
    }

    async send () {
        return await this.transporter.sendMail(this.msg)
    }

}