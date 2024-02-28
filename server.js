const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const { expressjwt: jwtMiddleware } = require("express-jwt");

const application = express();

application.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

application.use(bodyParser.json());
application.use(bodyParser.urlencoded({ extended: true }));

const SERVER_PORT = 3000;

const JWT_SECRET = 'My super secret key';
const jwtCheck = jwtMiddleware({
    secret: JWT_SECRET,
    algorithms: ['HS256']
});

let registeredUsers = [
    {
        userId: 1, 
        userLogin:'Sravya',
        userPassword:'164'
    },
    {
        userId: 2,
        userLogin:'Vemuri',
        userPassword:'389'
    }
];

application.post('/api/authenticate', (request, response) => {
    const { user, pass } = request.body;
    const users = registeredUsers.find(u => u.userLogin === user && u.userPassword === pass);
    if (users) {
        let authToken = jwt.sign({ userId: users.userId, userLogin: users.userLogin }, JWT_SECRET, { expiresIn: '3m' });
        response.json({
        
            success: true,
            error: null,
            authToken
        });
    } else {
        response.status(401).json({
            success: false,
            authToken: null,
            error: 'Invalidate credentials'
        });
    }
});

application.get('/api/dashboard', jwtCheck, (request, response) => {
    response.json({
        success: true,
        dashboardData: 'Secret content that only logged in people can see!!!'
    });
});

application.get('/api/prices', jwtCheck, (request, response) => {
    response.json({
        success: true,
        pricingInfo: 'This is the price $52.99'
    });
});

application.get('/api/settings', jwtCheck, (request, response) => {
    response.json({
        success: true,
        settingsData: 'Settings content can be seen once JWT authentication is done'
    });
});

application.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'index.html'));
});

application.use(function (error, request, response, next) {
    if (error.name === 'UnauthorizedError') {
        response.status(401).json({
            success: false,
            officialError: error,
            error: 'Invalid token provided'
        });
    } else {
        next(error);
    }
});

application.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
});
