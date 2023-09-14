export const environment = {
    production: true,
    apiUrl: '',  // API endpoints : htpps://api.my-app.com/
    host: '', // Domain of front-end angular app : https://my-app.com
    // Url API CALL
    uploadUrl: 'test/test-uploading-file',
    loginUrl: 'auth/login',
    signupUrl: 'auth/signup',
    fileUrl: 'test/files',
    deleteFileUrl: 'test/file',
    downloadUrl: 'files/download/',
    checkPseudoUrl: 'auth/check-pseudo',
    checkEmailUrl: 'auth/check-email',
    sendConfirmEmailUrl: 'users/set-confirm-email',
    maxFilesSize: (2147483648), // La taille maxiximal des fichiers enregistrés en octets
    fileLinkTimeDisplayed: 60000, // La durée en millisecondes de la disponibilitée du lien de partage générer
    timeCodeEmailConfirmation: 7200, // Le nombre de secondes durant lequel est valide le code envoyée par mail
    // Name route
    dashboardRoute: 'dashboard'
};
