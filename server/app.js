const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const db = require('./models');
const multer = require('multer');
const sys = require('util');
const fs = require('fs');
const Op= require('sequelize').Op;
const sharp = require('sharp');



const spawn = require('child_process').spawn;

// Express init
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('./public'));

// Init db
db.sequelize.sync();

var dir = './uploads';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// Temp storage for pics
const multerStorage = multer.memoryStorage();
const multerUpload = multer({
    storage: multerStorage
});

function randString() {
    return Math.random().toString(36).substr(2);
}

function generatePassword(password) {
    return bcrypt.hashSync(password, saltRounds);
}

function getOrGenerateToken(username) {
    return Session.findOne({
        where: {
            username: username,
            valid: true
        }
    }).then(session => {
        if (!session) {
            return Session.create({
                username: username,
                token: randString(),
                valid: true
            }).then(session => {
                return session.token;
            })
        } else {
            return session.token;
        }
    });
}

function loginUser(username, password) {
    if (!username || !password)
        return Promise.resolve(false);
    return User.findOne({
        where: {
            username: username
        }
    }).then(user => {
        if (!user) {
            return false;
        } else {
            return bcrypt.compareSync(password, user.dataValues.password);
        }
    });
}

function registerUser(username, password) {
    if (!username || !password)
        return Promise.resolve(false);
    return User.findOne({
        where: {
            username: username
        }
    }).then(user => {
        if (!user) {
            return User.create({
                username: username,
                password: generatePassword(password)
            })
        } else {
            return false;
        }
    });
}

function authenticate(token) {
    if (!token)
        return Promise.resolve(false);
    return Session.findOne({
        where: {
            token: token,
            valid: true
        }
    }).then(session => {
        if (session)
            return session;
        else
            return false;
    });
}

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
})
var User = db.User;

app.post('/register', multerUpload.single('picture'), function (req, res) {
    console.log("Register request received from " + JSON.stringify(req.body));

    sharp(req.file.buffer)
        .resize(320, 240)
        .rotate(90)
        .toFile('./uploads/image2.jpeg');

    fs.writeFile("./uploads/" + "image.jpeg", req.file.buffer, "binary", function (err) {
        if (err) {
            res.send("Could not upload picture");
            console.log(err);
        } else {
            console.log("Saved picture");

            var encoder = spawn('python', ['encode.py', "./uploads/" + "image2.jpeg"]);

            encoder.on("exit", function () {
                var encoding = fs.readFileSync("./uploads/data.txt", "utf8");

                User.create({
                    name: req.body.name,
                    passwordHash: req.body.password,
                    picture: req.file.buffer,
                    faceEncoding: encoding
                }).then(function (user) {
                    fs.unlink("./uploads/" + "image2.jpeg", (err) =>{
                        if (err)
                            throw err;
                    });

                    fs.unlink("./uploads/" + "data.txt", (err) =>{
                        if (err)
                            throw err;
                    });

                    res.send("registered");
                    //res.json(user);
                    //res.json(JSON.stringify(req.file));
                    //res.type('jpeg');
                    //res.end(user.picture, 'binary');
                    //res.send(new Buffer(user.picture, 'binary'));
                });
            });
        }
    });
});

app.get('/encodings', function(req, res) {
    User.findAll({
        attributes: ['name', 'faceEncoding'],
        where: {
            faceEncoding: {
                [Op.ne]: null
            }
        }
    }).then(users => {
        res.json(users);
    });
});

app.post('/deleteUser', function(req, res) {
    console.log(JSON.stringify(req.body));
    User.destroy({
        where: {
            name: req.body.name
        }
    }).then(result => {
        res.json(result);
    })
});

app.post('/login', function (req, res) {
    console.log("Login received from " + req.body.username);
    loginUser(req.body.username, req.body.password).then(authenticated => {
        if (authenticated) {
            getOrGenerateToken(req.body.username).then(token => {
                res.send(token);
            });
        } else {
            res.status(404).send('Username/Password incorrect');
        }
    })
});

/*
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
*/

app.post('/storeFavourite', function (req, res) {
    console.log("Store fav request received from " + req.body.token);
    authenticate(req.body.token).then(session => {
        if (session) {
            storeHouse(req.body.mlsid, req.body.houseJson, session.username).then(stored => {
                res.send("stored");
            });
        } else {
            res.status(401).send("not authenticated");
        }
    })
});



module.exports = app;
