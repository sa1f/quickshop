// -- Import modules --
const express = require('express'); // Web server
const bodyParser = require('body-parser') // Form data parsing
const bcrypt = require('bcrypt'); // Password hashing
const multer = require('multer'); // Process file uploads (used for image uploads)
const fs = require('fs'); // Filesystem access
const Op = require('sequelize').Op; // Used in db queries for 'not equal' etc. 
const sharp = require('sharp'); // Image manipulation (Used for resizing uploaded images)
const spawn = require('child_process').spawn; // Used to spawn the face encoding python process
const consola = require('consola') // Pretty console logging


// -- Initialize Express --
const app = express();

app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('./public'));


// -- Initialize Database and sync models
const db = require('./models');
db.sequelize.sync();
const User = db.User;
const Session = db.Session;
const ProductInStore = db.ProductInStore;


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


//#region -- Helper Functions --

// -- Password Hashing Helpers --
function randString() {
    return Math.random().toString(36).substr(2);
}

const saltRounds = 12;

function generatePasswordHash(password) {
    return bcrypt.hashSync(password, saltRounds);
}

// -- User Management --
function getOrGenerateSessionToken(name) {
    return new Promise((resolve, reject) => {
        User.findOne({
            where: {
                name: name
            }
        }).then(user => {
            Session.findOne({
                where: {
                    UserId: user.id,
                    valid: true
                },
                includes: [User]
            }).then(session => {
                if (!session) {
                    Session.create({
                        token: randString(),
                        valid: true,
                        UserId: user.id
                    }).then(session => {
                        resolve(session.token);
                    }).catch(err => {
                        consola.error("An error occurred while trying to create a new session token");
                        reject(err);
                    })
                } else {
                    resolve(session.token);
                }
            }).catch(err => {
                consola.error("An error occurred while trying to find an existing session token");
                reject(err);
            });
        });
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
function sendError(response, message, errorCode) {
    // Default http code is internal server error (500)
    let code = errorCode || 500;
    consola.error(message);
    response.status(code).json(message);
}
//#endregion

app.get("/", (request, response) => {
    response.render('index');
})

app.post('/register', upload.single('picture'), (request, response) => {
    if (!request.body.name) {
        return sendError(response, "Please enter a name", 422);
    }
    if (request.body.name.includes(' ')) {
        return sendError(response, "The name field cannot contain spaces");
    }
    if (!request.body.password) {
        return sendError(response, "Please enter a password", 422);
    }
    if (!request.file || !request.file.mimetype.includes("image")) {
        return sendError(response, "You need to upload a jpeg image for the picture field", 422);
    }

    consola.info("Register request received from " + JSON.stringify(request.body));

    let imageFilename = randString() + ".jpeg";

    // Resize the image
    sharp(request.file.buffer)
        .resize(320)
        .toFile(uploadsDirectory + imageFilename)
        .then(() => consola.success("Saved picture successfully"))
        .catch(err => {
            return sendError(response, "Something happened while trying to resize image");
        });

    // Encode single face 
    var encoder = spawn('python3', ['encode.py', uploadsDirectory + imageFilename]);
    encoder.on("exit", () => {
        if (!fs.existsSync(uploadsDirectory + imageFilename + "_encoding.txt")) {
            fs.unlink(uploadsDirectory + imageFilename, (err) => {
                if (err)
                    return sendError(response, err);
            });

            return sendError(response, "Could not find face_encoding.txt file. Please make sure " +
                "encode.py and that a face exists in the image you uploaded.");
        }

        var encoding = fs.readFileSync(uploadsDirectory + imageFilename + "_encoding.txt", "utf8");

        User.findOne({
            where: {
                name: request.body.name
            }
        }).then(user => {
            if (user)
                return sendError(response, "User with name " + request.body.name + " already exists", 422);
            else {
                User.create({
                    name: request.body.name,
                    passwordHash: generatePasswordHash(request.body.password),
                    picture: request.file.buffer,
                    faceEncoding: encoding
                }).then(function (user) {
                    fs.unlink(uploadsDirectory + imageFilename, (err) => {
                        if (err)
                            return sendError(response, err);
                    });

                    fs.unlink(uploadsDirectory + imageFilename + "_encoding.txt", (err) => {
                        if (err)
                            return sendError(response, err);
                    });

                    response.send("Successfully Registered User");
                }).catch(err => {
                    sendError(response, err);
                });
            }
        });

    });
});

app.post('/login', upload.single('picture'), (request, response) => {
    if (!request.body.password && !request.body.name && (!request.file || !request.file.mimetype.includes("image"))) {
        return sendError(response, "Please enter a username/password or upload a picture", 422);
    } else if (request.body.name && !request.body.password) {
        return sendError(response, "Please enter a password for the " + request.body.name, 422);
    } else if (request.body.password && !request.body.name) {
        return sendError(response, "Please enter a username along with the password", 422);
    }
    consola.info("Login received from " + request.body.name);

    let name = undefined;

    if (request.file) {
        let imageFilename = randString() + ".jpeg";

        // Resize the image
        sharp(request.file.buffer)
            .resize(320)
            .toFile(uploadsDirectory + imageFilename)
            .then(() => consola.success("Saved picture successfully"))
            .catch(err => {
                return sendError(response, "Something happened while trying to resize image");
            });

        let child = spawn('python3', ['login_face.py', uploadsDirectory + imageFilename]);
        child.stdout.on('data', (data) => {
            name = data.toString().trim();
        });
        child.on("exit", () => {
            fs.unlink(uploadsDirectory + imageFilename, (err) => {
                if (err)
                    return sendError(response, err);
            });

            if (name) {

                getOrGenerateSessionToken(name).then(token => {
                    response.send(token);
                })
            } else {
                response.status(404).send("Picture does not match any existing user");
            }
        });
    } else {
        User.findOne({
            where: {
                name: name
            }
        }).then(user => {
            if (!user) {
                return false;
            } else {
                if (bcrypt.compareSync(password, user.dataValues.password))
                    response.json(getOrGenerateSessionToken(name));
                else
                    response.status(404).send("Username/Password incorrect");
            }
        });
    }
});

app.post('/logout', upload.single('picture'), (request, response) => {
    if (!request.body.name && (!request.file || !request.file.mimetype.includes("image"))) {
        return sendError(response, "Please enter a username or upload a picture to logout", 422);
    }

    if (request.file) {
        let imageFilename = randString() + ".jpeg";

        // Resize the image
        sharp(request.file.buffer)
            .resize(320)
            .toFile(uploadsDirectory + imageFilename)
            .then(() => consola.success("Saved picture successfully"))
            .catch(err => {
                return sendError(response, "Something happened while trying to resize image");
            });

        let child = spawn('python3', ['login_face.py', uploadsDirectory + imageFilename]);
        child.stdout.on('data', (data) => {
            name = data.toString().trim();
        });
        child.on("exit", () => {
            fs.unlink(uploadsDirectory + imageFilename, (err) => {
                if (err)
                    return sendError(response, err);
            });

            if (name) {
                getOrGenerateSessionToken(name).then(token => {
                    if (token) {
                        User.findOne({
                            where: {
                                name: name
                            }
                        }).then(user => {
                            Session.findAll({
                                where: {
                                    UserId: user.id,
                                    valid: true
                                }
                            }).then(sessions => {
                                for (let session of sessions) {
                                    session.update({
                                        valid: false
                                    });
                                }
                                response.redirect("/");
                                //response.json("Logged out", name, "successfully");
                            })
                        })
                    } else {
                        reponse.status(404).json("User is not logged in")
                    }
                })
            } else {
                response.status(404).send("Picture does not match any existing user");
            }
        });
    } else {
        let name = request.body.name;
        getOrGenerateSessionToken(name).then(token => {
            if (token) {
                User.findOne({
                    where: {
                        name: name
                    }
                }).then(user => {
                    Session.findAll({
                        where: {
                            UserId: user.id,
                            valid: true
                        }
                    }).then(sessions => {
                        for (let session of sessions) {
                            session.update({
                                valid: false
                            });
                        }
                        response.redirect("/");
                        //response.json("Logged out", name, "successfully");
                    })
                })
            } else {
                reponse.status(404).json("User is not logged in")
            }
        })
    }
});

app.get('/users', (request, response) => {
    User.findAll({
            attributes: ['name'],
            include: [{
                model: Session,
                where: {
                    valid: true
                },
                required: false
            }]
        })
        .then(users => {
            if (users.length >= 1) {
                response.json(users);
            } else {
                response.status(404).json("There are no users to be found");
            }
        });
})

app.get('/users/:name/picture', (request, response) => {
    User.findOne({
            where: {
                name: request.params.name
            },
            attributes: ['picture']
        })
        .then(user => {
            response.end(user.picture);
        });
})

app.post('/shelf/update_in_front', (request, response) => {

});
app.get('/shelf', (request, response) => {
    ProductInStore.findAll({}).then(products => {
        response.json(products);
    });
});

app.post('/shelf/add', function (request, response) {
    if (!request.body.name) {
        return sendError(response, "Please give a name for the product", 422)
    }
    ProductInStore.findOne({
        where: {
            name: request.body.name
        }
    }).then(productInStore => {
        if (productInStore) {
            productInStore.updateAttributes({
                quantity: productInStore.quantity + 1
            })
        } else {
            ProductInStore.create({
                name: request.body.name,
                quantity: 1,
            }).then(function (user) {
                response.send("Successfully Added Product");
            }).catch(err => {
                sendError(response, err);
            });
        }
    });
});

app.post('/shelf/remove', function (request, response) {
    if (!request.body.name) {
        return sendError(response, "Please give a name for the product", 422)
    }
    /*
    if (!request.body.lastXCoordinate) {
        return sendError(response, "Please give the last known x-coord for " + request.body.name, 422)
    }*/

    ProductInStore.findOne({
        where: {
            name: request.body.name
        }
    }).then(productInStore => {
        if (productInStore) {
            if (productInStore.quantity > 0) {
                productInStore.updateAttributes({
                    quantity: productInStore.quantity - 1
                });
            } 
            response.json(productInStore.quantity);
        } else {
            sendError(response, "The following product is not in the shelf: " + request.body.name);
        }
    });


});

app.post('/users/:name/cart/add', function (request, response) {
    if (!request.body.product_name) {
        return sendError(response, "Please give a name for the product", 422)
    }
    if (!request.body.name) {
        return sendError(response, "Please give a name for the product", 422)
    }

});

app.post('/users/:name/cart/remove', function (request, response) {
    if (!request.body.product_name) {
        return sendError(response, "Please give a name for the product", 422)
    }
    if (!request.body.name) {
        return sendError(response, "Please give a name for the product", 422)
    }

});

app.post('/users/:name/checkout', function (request, response) {
    if (!request.body.name) {
        return sendError(response, "Please give a name for the product", 422)
    }

});

app.get('/users/:name/purchases', function (request, response) {
    if (!request.params.name) {
        return sendError(response, "Please give a name for the user", 422)
    }


});



app.get('/face_encodings', (request, response) => {
    User.findAll({
        attributes: ['name', 'faceEncoding'],
        where: {
            faceEncoding: {
                [Op.ne]: null
            }
        }
    }).then(users => {
        response.json(users);
    });
});

app.post('/delete_user', (request, response) => {
    consola.info("Deleting user " + request.body.name);
    User.destroy({
        where: {
            name: request.body.name
        }
    }).then(affectedRows => {
        if (affectedRows > 1) {
            response.json(affectedRows + " rows were deleted")
        }
    })
});


module.exports = app;