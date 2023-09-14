const mysql = require('mysql')

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
})

try {
    connection.connect();
} catch (error) {
    throw new Error('Error during Database connection : ' + error)
}

module.exports = connection