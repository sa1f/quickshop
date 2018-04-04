//#region Init
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
const Block = db.Block;
const ProductInCart = db.ProductInCart;
const Cart = db.Cart;


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
//#endregion

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
                            UserId: user.id,
                            Cart: {}
                        }, {
                            include: [Cart]
                        }


                    ).then(session => {
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
app.get('/test/:name/:product', (request, response) => {
    ProductInStore.findOne({
        where: {
            name: request.params.product
        }
    }).then(product => {
        response.json(product);
    });
    Cart.findOne({
        where: {},
        include: [{
            model: Session,
            attributes: [],
            include: [{
                model: User,
                attributes: [],
                where: {
                    name: request.params.name
                }
            }],
            where: {
                valid: true
            }
        }]
    }).then(user => {
        //response.json(user);
    })


});

function authenticate(name) {
    if (!name)
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

//#region Global endpoints
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
        .rotate()
        .toFile(uploadsDirectory + imageFilename)
        .then(() => {
            consola.success("Saved picture successfully");
            // Encode single face
            var encoder = spawn('python3', ['encode.py', uploadsDirectory + imageFilename]);
            encoder.stdout.on('data', (data) => {
                consola.error(data.toString().trim());
            });
            encoder.stderr.on('data', (data) => {
                consola.error(data.toString().trim());
            });
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
        })
        .catch(err => {
            return sendError(response, "Something happened while trying to resize image");
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
            .rotate()
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
                name: request.body.name
            }
        }).then(user => {
            if (!user) {
                return false;
            } else {
                /* DEBUG: disabling password for now
                if (bcrypt.compareSync(request.body.password, user.dataValues.passwordHash))
                    getOrGenerateSessionToken(request.body.name).then(token => {
                        response.json({'token': token});
                    });
                else
                    response.status(404).send("Username/Password incorrect");
                */
                getOrGenerateSessionToken(request.body.name).then(token => {
                    response.json({
                        'token': token
                    });
                });
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
            .rotate()
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

app.get('/needs_hashing', (request, response) => {

    let result = {
        block: 0,
        data: "lots of data that needs hashing omg keep hashing this",
        prev_hash: "0000000000000000000000000000000000000000000000000000000000000000"
    }
    response.json(result);

});

app.post('/register_hash', (request, response) => {
    response.json(request.body);
});

app.get('/blocks', (request, response) => {
    let result = [{
            block_num: 0,
            nonce: 23753,
            data: {
                name: "Saif",
                date: new Date(),
                products: [{
                        name: "jam",
                        quantity: 3,
                        price: 5
                    },
                    {
                        name: "chips",
                        quantity: 4,
                        price: 1
                    },
                    {
                        name: "pencil",
                        quantity: 1,
                        price: 3
                    }
                ]
            },
            prev_hash: '6B86B273FF34FCE19D6B804EFF5A3F5747ADA4EAA22F1D49C01E52DDB7875B4B',
            curr_hash: 'D4735E3A265E16EEE03F59718B9B5D03019C07D8B6C51F90DA3A666EEC13AB35'
        },
        {
            block_num: 1,
            nonce: 432342,
            data: {
                name: "John",
                date: new Date(),
                products: [{
                        name: "jam",
                        quantity: 2,
                        price: 5
                    },
                   
                    {
                        name: "pencil",
                        quantity: 3,
                        price: 3
                    }
                ]
            },
            prev_hash: '6B86B273FF34FCE19D6B804FFF5A3F5747ADA4EAA22F1D49C01E52DDB7875B4B',
            curr_hash: 'D4735E3A265E16EEE03F5971EE9B5D03019C07D8B6C51F90DA3A666EEC13AB35'
        },
        {
            block_num: 2,
            nonce: 325346,
            data: {
                name: "Jim",
                date: new Date(),
                products: [{
                        name: "Ball",
                        quantity: 3,
                        price: 5
                    },
                    {
                        name: "chips",
                        quantity: 4,
                        price: 1
                    }
                ]
            },
            prev_hash: '6B86B273FF34FCE19D6B804EFF5A3F5747ADA4EAA22F1D49C01E52DDB7875B4B',
            curr_hash: 'D4735E3A265E16EEE03F59718B9B5D03019C07D8B6C51F90DA3A666EEC13AB35'
        }
    ];
    response.json(result);
})
//#endregion

//#region User endpoints
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
});

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
});

app.get('/users/:name/cart', (request, response) => {
    let result = {
        products: [{
                name: "jam",
                quantity: 3,
                price: 5
            },
            {
                name: "chips",
                quantity: 4,
                price: 1
            },
            {
                name: "pencil",
                quantity: 1,
                price: 3
            }
        ]
    }
    response.json(result);
});

app.post('/users/:name/cart/add', function (request, response) {
    if (!request.body.product_name) {
        return sendError(response, "Please give a name for the product", 422)
    }
    if (!request.params.name) {
        return sendError(response, "Please give a name for the user", 422)
    }
    aur
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

//#endregion

//#region Shelf endpoints
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
            }).then(updatedProduct => {
                response.json("Successfully updated quantity of " + updatedProduct.name + " to " + updatedProduct.quanity);
            });
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

app.post('/shelf/update_in_front', (request, response) => {

});

//#endregion

module.exports = app;