class UploadsRequierements {

    _files;
    _maxSize;
    _mimeType;
    
    /**
     * @param {Array} files 
     */
    constructor (file) {
        this.file = file;
    }

    /**
     * @Return { object }
     */
    checkFiles () {
        Array.from(this.files).forEach(f => {
            if (f.size > maxSize) {
            }
        })
    }

}

module.exports = UploadsRequierements