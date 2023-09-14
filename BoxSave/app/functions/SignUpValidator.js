module.exports = class SignUpValidator {

    constructor (email, password, pseudo) {
        this.email = email;
        this.password = password;
        this.pseudo = pseudo;
        this.regexEmail = new RegExp(process.env.REGEX_EMAIL);
        this.regexPassword = new RegExp(process.env.REGEX_PASSWORD);
        this.regexPseudo = new RegExp(process.env.REGEX_PSEUDO);
    }

    checkIfErrorExist () {
        if (this.email === '') {
            return {
                status: true,
                message: "Renseigner l'adresse email"
            }
        }

        if (this.password === '') {
            return {
                status: true,
                message: "Renseigner le mot de passe"
            }
        }

        if (this.pseudo === '') {
            return {
                status: true,
                message: "Renseigner le pseudo"
            }
        }

        if (this.regexEmail.test(this.email) === false) {
            return {
                status: true,
                message: 'Email non valide'
            }
        }

        if (this.regexPassword.test(this.password) === false) {
            return {
                status: true,
                message: 'Le Mot de Passe doit contenir au minimum 8 caractères, 1 lettre majuscule, 1 lettre minuscule et 1 chiffre'
            }
        }

        if (this.regexPseudo.test(this.pseudo) === false) {
            return {
                status: true,
                message: 'Le pseudo ne peut comprendre que les caractères suivants [A-Za-z0-9_]'
            }
        }

        return {
            status: false,
            message: 'Email et adresse Valide'
        }
    }

}