// Controller module

// Import body-parser
const bodyParser = require('body-parser')
// Import express
const express = require('express')
// Import service module
const service = require('../service/service')

// Define JSON parser
const jsonParser = bodyParser.json()
// Define controller
const controller = express.Router()

// Mapping request url and methods

controller.post('/register', jsonParser, service.register)

controller.post('/login', jsonParser, service.login)

controller.get('/api/userList', service.getUserList)




controller.get('/api/analysis', service.getAnalysis)

controller.get('/api/orderList', service.getOrderList)

controller.get('/api/productList', service.getProductList)

controller.get('/api/profile', service.auth, service.profile)

module.exports = controller