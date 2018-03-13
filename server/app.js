const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const db = require('./models');
const app = express();

app.use( bodyParser.json() );

db.sequelize.sync();

function randString() {
    return Math.random().toString(36).substr(2);
}

function generatePassword(password) {
    return bcrypt.hashSync(password, saltRounds);
}

function getOrGenerateToken(username) {
    return Session.findOne({where: {username: username, valid: true}}).then(session => {
        if (!session) {
            return Session.create({
                username: username,
                token: randString(),
                valid: true
            }).then(session => {
                return session.token;
            })
        }
        else {
            return session.token;
        }
    });
}

function loginUser(username, password) {
    if (!username || !password)
        return Promise.resolve(false);
    return User.findOne({where: {username: username}}).then(user => {
        if (!user) {
            return false;
        }
        else {
            return bcrypt.compareSync(password, user.dataValues.password);
        }
    });
}

function registerUser(username, password) {
    if (!username || !password)
        return Promise.resolve(false);
    return User.findOne({where: {username: username}}).then(user => {
        if (!user) {
            return User.create({
                username: username,
                password: generatePassword(password)
            })
        }
        else {
            return false;
        }
    });
}

function authenticate(token) {
    if (!token)
        return Promise.resolve(false);
    return Session.findOne({where: {token: token, valid: true}}).then(session =>{
        if (session)
            return session;
        else
            return false;
    });
}

app.post('/login', function(req, res) {
    console.log("Login received from " + req.body.username);
    loginUser(req.body.username, req.body.password).then(authenticated => {
        if (authenticated) {
            getOrGenerateToken(req.body.username).then(token => {
                res.send(token);
            });
        }
        else {
            res.status(404).send('Username/Password incorrect');
        }
    })
});

app.post('/register', function(req, res) {
    console.log("Register request received from " + req.body.username);
    registerUser(req.body.username, req.body.password).then(authenticated => {
        if (authenticated != null) {
            getOrGenerateToken(req.body.username).then(token => {
                res.send(token);
            });
        }
        else {
            res.status(401).send('Couldn\'t register that account');
        }
    })
});

app.post('/storeFavourite', function(req, res) {
    console.log("Store fav request received from " + req.body.token);
    authenticate(req.body.token).then(session => {
        if (session) {
            storeHouse(req.body.mlsid, req.body.houseJson, session.username).then(stored => {
                res.send("stored");
            });
        }
        else {
            res.status(401).send("not authenticated");
        }
    })
});



module.exports = app;