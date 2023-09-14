class AuthValidator {
    constructor (email, password) {
        this.email = email;
        this.password = password;
    }

    /**
     * Si il y a une erreur on renvoie true sinon pas d'erreur on renvoie false !
     * @Return { object }
     */
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

        return {
            status: false,
            message: 'Email et adresse Valide'
        }
    }

}

module.exports = AuthValidator