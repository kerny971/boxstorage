export const environment = {
    production: false,
    apiUrl: '',  // API endpoints : http://localhost:3000/
    host: '', // http://localhost:4200/
    uploadUrl: 'test/test-uploading-file',
    loginUrl: 'auth/login',
    signupUrl: 'auth/signup',
    fileUrl: 'test/files',
    deleteFileUrl: 'test/file',
    downloadUrl: 'files/download/',
    checkPseudoUrl: 'auth/check-pseudo',
    checkEmailUrl: 'auth/check-email',
    sendConfirmEmailUrl: 'users/set-confirm-email',
    maxFilesSize: 2147483648, // La taille maxiximal des fichiers enregistrés en octets
    fileLinkTimeDisplayed: 60000, // La durée en millisecondes de la disponibilitée du lien de partage générer
    timeCodeEmailConfirmation: 7200, // Le nombre de secondes durant lequel est valide le code envoyée par mail
    // Name route
    dashboardRoute: 'dashboard'
};
