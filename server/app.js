// -- Import modules --
const express = require('express'); // Web server
const bodyParser = require('body-parser') // Form data parsing
const bcrypt = require('bcrypt'); // Password hashing
const multer = require('multer'); // Process file uploads (used for image uploads)
const fs = require('fs'); // Filesystem access
const Op = require('sequelize').Op; // Used in db queries for 'not equal' etc. 
const sharp = require('sharp'); // Image manipulation (Used for resizing uploaded images)
const spawn = require('child_process').spawn; // Used to spawn the face encoding python process


// -- Initialize Express --
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('./public'));


// -- Initialize Database and sync models
const db = require('./models');
db.sequelize.sync();
const User = db.User;
const Session = db.Session;


// -- Temp storage for pics --
const multerStorage = multer.memoryStorage();
const upload = multer({
    storage: multerStorage
});
const uploadsDirectory = './uploads/';

// create folder if it doesn't exist
if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory);
}


// -- Password Hashing Helpers --
function randString() {
    return Math.random().toString(36).substr(2);
}

const saltRounds = 12;

function generatePasswordHash(password) {
    return bcrypt.hashSync(password, saltRounds);
}


// -- User Management Functions --
function getOrGenerateSessionToken(username) {
    return Session.findOne({
        where: {
            name: username,
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
            }).catch(err => {
                console.log("An error occurred while trying to create a new session token");
            })
        } else {
            return session.token;
        }
    }).catch(err => {
        console.log("An error occurred while trying to find an existing session token")
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


// -- Process Requests --
function sendError(res, message, errorCode) {
    // Default http code is internal server error (500)
    let code = errorCode || 500;
    console.log(message);
    res.status(code).json(message);
}

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
})

app.post('/register', upload.single('picture'), function (req, res) {
    if (!req.body.name) {
        return sendError(res, "Please enter a name", 422)
    }
    if (!req.body.password) {
        return sendError(res, "Please enter a password", 422)
    }
    if (!req.file || !req.file.mimetype.includes("image")) {
        return sendError(res, "You need to upload a jpeg image for the picture field", 422);
    }
    console.log(req.file.mimetype);
    console.log("Register request received from " + JSON.stringify(req.body));

    // Resize the image
    sharp(req.file.buffer)
        .resize(320, 240)
        .toFile(uploadsDirectory + 'image.jpeg')
        .then(() => console.log("Saved picture successfully"))
        .catch(err => {
            return sendError(res, "Something happened while trying to resize image");
        });

    // Encode single face 
    var encoder = spawn('python', ['encode.py', uploadsDirectory + "image.jpeg"]);
    encoder.on("exit", function () {
        if (!fs.existsSync(uploadsDirectory + "face_encoding.txt")) {
            fs.unlink(uploadsDirectory + "image.jpeg", (err) => {
                if (err)
                   return sendError(res, err);
            });

            return sendError(res, "Could not find face_encoding.txt file. Please make sure " + 
                            "encode.py and that a face exists in the image you uploaded.");
        }

        var encoding = fs.readFileSync(uploadsDirectory + "face_encoding.txt", "utf8");

        User.findOne({
            where: {
                name: req.body.name
            }
        }).then(user =>{
            if (user)
                return sendError(res, "User with name " + req.body.name + " already exists", 422);
            else {
                User.create({
                    name: req.body.name,
                    passwordHash: generatePasswordHash(req.body.password),
                    picture: req.file.buffer,
                    faceEncoding: encoding
                }).then(function (user) {
                    fs.unlink(uploadsDirectory + "image.jpeg", (err) => {
                        if (err)
                           return sendError(res, err);
                    });
        
                    fs.unlink(uploadsDirectory + "face_encoding.txt", (err) => {
                        if (err)
                            return sendError(res, err);
                    });
        
                    res.send("Successfully Registered User");
                }).catch(err => {
                    sendError(res, err);
                });
            }
        });
        
    });
});

app.get('/encodings', function (req, res) {
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

app.post('/deleteUser', function (req, res) {
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
    console.log("Login received from " + req.body.name);
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

module.exports = app;