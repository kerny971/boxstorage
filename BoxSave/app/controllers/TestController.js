const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const { v4: uuidv4 } = require("uuid")
const mime = require('mime')
const meter = require('stream-meter')

const connection = require('../functions/Database')
const router = express.Router()
const upload = multer({dest: './uploads'})
const uploadPath = process.cwd() + "/uploads"

const queryGetFiles = "SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC"
const queryFiles = "SELECT * FROM files WHERE id = ?"
const queryDeleteFile = "DELETE FROM files WHERE id = ?"

/**
 * Uploader les fichiers sur le serveur
 */
router.post('/test-uploading-file', (req, res) => {

    const reqSize = req.headers['content-length'] ? Number(req.headers['content-length']) : 0
    const userId = Number(req.auth.sub)

    if (reqSize === 0) {
        res.status(411).send({
            status: true,
            message: "Une erreur s'est produite..."
        })
    } else {
        if (reqSize > process.env.MAX_SIZE_FILE_UPLOAD) {
            res.status(400).send({
                status: true,
                message: "La taille de votre fichier semble dépasser la limite..."
            })
        } else {
            if (req.busboy) {

                const files = []
                let totalSizeUpload = 0
                let n = 0

                req.busboy.on('file', (fieldname, file, filename) => {
                    filename.extension = mime.getExtension(filename.mimeType)
                    filename.filenameCode = uuidv4() + filename.filename.replaceAll(' ', '-')
                    const f = filename
                    f.id = ++n
                    f.size = 0
                    const upPath = path.join(uploadPath, filename.filenameCode)
                    const fstream = fs.createWriteStream(upPath)
                    const m = meter()

                    file.on('data', (data) => {
                        f.size += data.length
                    })

                    file.on('error', () => {})

                    file.on('close', () => {
                        f.path = upPath
                        files.push(f)
                        totalSizeUpload += f.size
                    })
    
                    file.pipe(fstream)

    
                    fstream.on('close', () => {
                    })
                })

                req.busboy.on('close', () => {

                    if (files.length <= 0) {
                        res.status(400).send({
                            status: true,
                            message: "Aucun fichier n'à été trouvée..."
                        })
                    } else {

                        const queryGetFilesByUser = "SELECT * FROM files WHERE user_id = ?"

                        if (totalSizeUpload < 0 || totalSizeUpload > process.env.totalSizeUpload) {
                            res.send({
                                status: true,
                                message: "La taille de vos fichiers dépasse la limite...",
                                error: {
                                    name: 'total_size_upload',
                                    value: totalSizeUpload
                                }
                            })
                        } else {
                            connection.query(queryGetFilesByUser, [userId], (error, results, fields) => {
                                if (error) throw Error
                                let sizeMediaOnServer = 0

                                if (Array.from(results).length > 0) {
                                    Array.from(results).forEach((r) => {
                                        sizeMediaOnServer += r.size;
                                    })
                                }

                                const currentSizeMediaServerAndUpload = sizeMediaOnServer + totalSizeUpload;

                                if (currentSizeMediaServerAndUpload > process.env.MAX_SIZE_FILE_UPLOAD) {

                                    files.forEach((f) => {
                                        fs.unlink(f.path, (err) => {})
                                    })
                            
                                    res.status(403).send({
                                        status: true,
                                        message: "Votre espace en ligne sera saturée..."
                                    })
                                } else {

                                    const saveAllFilesPromises = files.map((f) => {

                                        const uri = process.env.FILE_DIR + req.auth.sub + "/"
                                        const uriWeb = process.env.FILE_URI_DIR + req.auth.sub + "/"
                                        const dir = process.cwd() + "/" + uri

                                        if (!fs.existsSync(dir)){
                                            fs.mkdirSync(dir, { recursive: true })
                                        }

                                        const oldPath = f.path
                                        const newPath = dir + f.filenameCode
                                        const host = process.env.FILE_HOST

                                        fs.rename(oldPath, newPath, (err) => {
                                            fs.unlink(oldPath, (err) => {})
                                        })

                                        // Save in google file store

                                        const queryInsertFileUpload = "INSERT INTO files SET ?"

                                        return new Promise((resolve, reject) => {
                                            connection.query(queryInsertFileUpload, {
                                                original_name: f.filename,
                                                extension: f.extension,
                                                type: f.mimeType,
                                                size: f.size,
                                                uri: uriWeb + f.filenameCode,
                                                uri_download: uri + f.filenameCode,
                                                user_id: req.auth.sub,
                                                path: newPath,
                                                host: host
                                            }, (error, results) => {
                                                if (error) return reject(error)
                                                const queryGetFileById = "SELECT * FROM files WHERE id = ?"
                                                return resolve(new Promise((resolve, reject) => {
                                                    connection.query(queryGetFileById, [results.insertId], (error, r) => {
                                                        if (error) return reject(error)
                                                        return resolve(r[0]);
                                                    })
                                                }))
                                            })
                                        })
                
                                    })

                                    Promise.all(saveAllFilesPromises).then((results) => {
                                        res.status(200).send({
                                            status: false,
                                            message: "Fichiers enregistrés !",
                                            files: Array.from(results)
                                        })
                                    }).catch((error) => {
                                        res.status(500).send({
                                            status: true,
                                            message: "Une erreur s'est produite..."
                                        })
                                    })
                                }
                            })
                        }

                    }
                })

                req.pipe(req.busboy)
            }
        }
    }
})

// Renvoyer les informations des fichiers sur le serveur
router.get('/files', (req, res) => {

    connection.query(queryGetFiles, [req.auth.data.id], (error, result, fields) => {
        if (error) throw Error
        res.send({
            result: result
        });
    })
})

// Supprimer un fichier
router.delete('/file/:id', (req, res) => {
    const idFile = req.params.id
    const idUser = +req.auth.sub

    connection.query(queryFiles, [idFile], (error, results, fields) => {
        if (results.length > 0) {
            const file = results[0]
            if (+file.user_id === idUser) {
                connection.query(queryDeleteFile, [file.id], (error, results, fields) => {
                    if (error) throw Error
                    
                    res.status(200).send({
                        errors: {
                            status: false,
                            message: `Le fichier ${file.original_name} avec l'id ${file.id} appartenant à l'utilisateur ${req.auth.data.pseudo} + (${req.auth.data.email}) à bien été supprimé`
                        },
                        data: {
                            file: file
                        }
                    })
                })
                fs.unlink(file.path, (err) => {
                    // LOGS DATA
                })
            } else {
                res.status(401).send('Unauthorized Access')
            }
        } else {
            res.status(404).send({
                errors: {
                    status: true,
                    message: "File not found !"
                }
            })
        }
    })
})

module.exports = router
