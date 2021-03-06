// Main entry

// Use express backend framework
const express = require('express')
// Import middleware
const bodyParser = require('body-parser')
// Import packages
// config.js
const config = require('../../config')
// controller.js
const controller = require('./controller/controller')
// service.js
const service = require('./service/service')
// cors.js
const cors = require('cors')


// Initialize an express object
const app = express()
// CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, Content-Type')
    next();
})
// Use router management module
app.use(controller)
// Use cors
app.use(cors)


// Start to listen a port
app.listen(config.port, () => {
  console.log(`Server initializes on ${config.host}:${config.port} ...`)
})