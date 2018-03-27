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
const registerPictureFilePath = uploadsDirectory + "register.jpg";

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
            name: username
        }
    }).then(user => {
        if (!user) {
            return false;
        } else {
            // RUI: dataValues only store passwordHash. Unable to check password. Needs fixing
            // user.dataValues: {"id":26,"name":"rui2","passwordHash":"$2a$12$DL/i0usfGjzfez1OuENDSOP0xAqhbZrFJanfLQWdRDbU/5NDdztF2","picture":null,"faceEncoding":null,"createdAt":"2018-03-27T04:07:43.505Z","updatedAt":"2018-03-27T04:07:43.505Z"}
            // return bcrypt.compareSync(password, user.dataValues.password);
            // Return true for now. 
            return true;
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
    console.log("Register request received from " + JSON.stringify(req.body));

    // Resize the image
    sharp(req.file.buffer)
        .resize(320, 240)
        .toFile(registerPictureFilePath)
        .then(() => console.log("Saved picture successfully at " + registerPictureFilePath))
        .catch(err => {
            return sendError(res, "Something happened while trying to resize image");
        });

    // Note from Rui: The client app is able to send picture data to server during registration and is able to save the picture in ./uploads successfully. However,
    // when the server calls unlink(), it throws error and the picture file in ./uploads is lost. To ensure the client app could support picture upload,
    // I commented this part of code. Uncomment this once this is fixed. 
    // Encode single face
    // var encoder = spawn('python', ['encode.py', registerPictureFilePath]);
    // encoder.on("exit", function () {
    //     if (!fs.existsSync(uploadsDirectory + "face_encoding.txt")) {
    //         fs.unlink(registerPictureFilePath, (err) => {
    //             if (err)
    //                return sendError(res, err);
    //         });

    //         return sendError(res, "Could not find face_encoding.txt file. Please make sure " + 
    //                         "encode.py and that a face exists in the image you uploaded.");
    //     }

    //     var encoding = fs.readFileSync(uploadsDirectory + "face_encoding.txt", "utf8");

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
                    faceEncoding: null,
                    // TODO: Uncomment once the issue above is fixed.
                    // faceEncoding: encoding
                }).then(function (user) {
                    // TODO: Uncomment once the issue above is fixed.
                    // fs.unlink(registerPictureFilePath, (err) => {
                    //     if (err)
                    //        return sendError(res, err);
                    // });
        
                    // fs.unlink(uploadsDirectory + "face_encoding.txt", (err) => {
                    //     if (err)
                    //         return sendError(res, err);
                    // });
        
                    res.json({ "message" : "Successfully Registered User"});
                }).catch(err => {
                    sendError(res, err);
                });
            }
        });
        
    });
// });

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
    console.log("Login received from " + req.body.username);
    loginUser(req.body.username, req.body.password).then(authenticated => {
        if (authenticated) {
            console.log("Login successfully");
            res.json({"token" : "Success"});

            // TODO: getOrGenerateToken is not defined. Return sucess for now.
            // getOrGenerateToken(req.body.username).then(token => {
            //     console.log("token " + token);
            //     res.json({"token" : token});
            // });
        } else {
            console.log("Login failed");
            res.status(404).json({"token" : "Failed"});
        }
    })
});

module.exports = app;