// Connection to MySQL
const mysql = require('mysql')

// Define and config connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Linhao01',
  database: 'ec'
})

// Start to connect mysql
connection.connect()

module.exports = connection