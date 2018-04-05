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
const apicache = require('apicache') // Caching for endpoints
const superagent = require('superagent');



// -- Initialize Express --
const app = express();

app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('./public'));

let cache = apicache.middleware;

// -- Initialize Database and sync models
const db = require('./models');
db.sequelize.sync();
const User = db.User;
const Session = db.Session;
const ProductInStore = db.ProductInStore;
const Block = db.Block;
const ProductInCart = db.ProductInCart;
const Cart = db.Cart;
const Purchase = db.Purchase;


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

function sendSuccess(response, message) {
    consola.success(message);
    response.json(message);
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

    const user_name = request.body.name;
    const password = request.body.password;

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
                        name: user_name
                    }
                }).then(user => {
                    if (user)
                        return sendError(response, "User with name " + user_name + " already exists", 422);
                    else {
                        User.create({
                            name: user_name,
                            passwordHash: generatePasswordHash(password),
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

    const user_name = request.body.name;
    const password = request.body.password;

    consola.info("Login received from " + user_name);

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
                name: user_name
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
                getOrGenerateSessionToken(user_name).then(token => {
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

    const user_name = request.body.name;
    consola.info(`Logout request received from ${user_name}`);

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
                                return sendSuccess(response, `Logged out ${user_name} successfully`);
                                //response.json("Logged out", name, "successfully");
                            })
                        })
                    } else {
                        reponse.status(404).json("User is not logged in")
                    }
                })
            } else {
                return sendError(response, `Picture doesn't match any existing user`, 404);
            }
        });
    } else {
        getOrGenerateSessionToken(user_name).then(token => {
            if (token) {
                User.findOne({
                    where: {
                        name: user_name
                    },
                    attributes: ['id'],
                    include: [{
                        model: Session,
                        attributes: ['id', 'valid'],
                        where: {
                            valid: true
                        },
                        include: [{
                            model: Cart,
                            attributes: ['id'],
                            include: [{
                                model: ProductInCart,
                                attributes: ['id'],
                                include: [{
                                    model: ProductInStore,
                                    attributes: ['id', 'quantity']
                                }]
                            }]
                        }]
                    }]
                }).then(user => {
                    if (!user) {
                        return sendError(response, `Could not find any user record in the db for username: ${user_name}`);
                    }

                    if (user.Sessions.length < 1) {
                        return sendError(response, `Could not find a valid logged in session for ${user_name}`);
                    }

                    for (let session of user.Sessions) {
                        session.update({
                            valid: false
                        }).then(killedSession => {
                            for (let product of killedSession.Cart.ProductInCarts) {
                                product.ProductInStore.update({
                                    quantity: product.ProductInStore.quantity + 1
                                })
                                product.destroy({});
                            }
                        });
                    }
                    sendSuccess(response, `Successfully logged out `)
                });
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
    const user_name = request.body.name;
    User.destroy({
        where: {
            name: user_name
        }
    }).then(affectedRows => {
        if (affectedRows > 1) {
            response.json(affectedRows + " rows were deleted")
        }
    })
});

app.get('/needs_hashing', (request, response) => {
    Block.findAll({
        limit: 1,
        attributes: [
            ['block_num', 'block'], 'data', 'prev_hash'
        ],
        where: {
            nonce: null
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(blocks => {
        response.json(blocks[0]);
    });
});

app.post('/register_hash', (request, response) => {
    if (!request.body.block) {
        return sendError(response, "Please send block id");
    }
    if (!request.body.nonce) {
        return sendError(response, "Please send a nonce value");
    }
    if (!request.body.curr_hash) {
        return sendError(response, "Please send the current hash value");
    }

    const block_num = request.body.block;
    const nonce = request.body.nonce;
    const curr_hash = request.body.curr_hash;

    Block.findOne({
        where: {
            block_num: block_num
        }
    }).then(block => {
        if (!block) {
            return sendError(response, `Block not found: ${block_num}`)
        }
        block.update({
            curr_hash: curr_hash,
            nonce: nonce
        }).then(updatedBlock => {
            if (!updatedBlock) {
                return sendError(response, `Block not updated: ${block_num}`)
            } else if (!updatedBlock.nonce) {
                return sendError(response, `Block nonce not updated: ${block_num}`)
            }
            sendSuccess(response, "Successfully registered hash");
        })
    });
});

app.get('/blocks', (request, response) => {
    Block.findAll({}).then(blocks => {
        let result = [];
        for (block of blocks) {
            result.push({
                block_num: block.block_num,
                nonce: block.nonce,
                data: JSON.parse(block.data),
                curr_hash: block.curr_hash,
                prev_hash: block.prev_hash
            });
        }
        response.json(result);
    })
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

app.get('/users/:name/picture', cache('1 hour'), (request, response) => {
    const user_name = request.params.name;
    User.findOne({
            where: {
                name: user_name
            },
            attributes: ['picture']
        })
        .then(user => {
            response.end(user.picture);
        });
});

app.get('/users/:name/cart', cache('5 seconds'), (request, response) => {
    const user_name = request.params.name;


    Cart.findOne({
        where: {},
        attributes: [],
        include: [{
            model: Session,
            attributes: [],
            include: [{
                model: User,
                attributes: [],
                where: {
                    name: user_name
                }
            }],
            where: {
                valid: true
            }
        }, {
            model: ProductInCart,
            include: [
                ProductInStore
            ]
        }]
    }).then(cart => {
        if (!cart) {
            return sendError(response, `Cart seems to be empty for user ${user_name}`);
        }
        let products = {};
        let productQuantity = [];
        for (item of cart.ProductInCarts) {
            let product = item.ProductInStore;
            products[product.name] = {};
            products[product.name]['name'] = product.name;
            products[product.name]['price'] = 5;
            productQuantity.push(product.name);
            var count = 0;
            for (var i = 0; i < productQuantity.length; ++i) {
                if (productQuantity[i] == product.name)
                    count++;
            }

            products[product.name]['quantity'] = count;
        }
        response.json(Object.values(products));

    });
});

app.post('/users/:name/cart/add', function (request, response) {
    if (!request.body.product_name) {
        return sendError(response, "Please give a name for the product", 422)
    }
    if (!request.params.name) {
        return sendError(response, "Please give a name for the user", 422)
    }

    const user_name = request.params.name;
    const product_name = request.body.product_name;

    consola.info(`Add to cart recieved for user: ${user_name} with product: ${product_name}`)
    Cart.findOne({
        where: {},
        include: [{
            model: Session,
            attributes: [],
            include: [{
                model: User,
                attributes: [],
                where: {
                    name: user_name
                }
            }],
            where: {
                valid: true
            }
        }]
    }).then(cart => {
        if (!cart) {
            return sendError(response, `Sorry, the user ${user_name} is not logged in`);
        }
        ProductInStore.findOne({
            where: {
                name: product_name
            }
        }).then(productInStore => {
            if (!productInStore || productInStore.quantity < 1) {
                return sendError(response, `Sorry, the product ${product_name} either doesn't exist or has quantity of 0`);
            }

            productInStore.update({
                quantity: productInStore.quantity - 1
            }).then(updatedProductInStore => {
                consola.info(`Updated quantity of ${productInStore.name} to ${productInStore.quantity}`)
            });

            ProductInCart.create({
                ProductInStoreId: productInStore.id,
                CartId: cart.id
            }, {
                include: [ProductInStore, Cart]
            }).then(productInCart => {
                if (productInCart) {
                    return sendSuccess(response, `Successfully added product ${product_name} in the cart for user ${user_name}`);
                }
            });

        });
    });

});


app.post('/users/:name/cart/remove', function (request, response) {
    if (!request.body.product_name) {
        return sendError(response, "Please give a name for the product", 422)
    }
    if (!request.params.name) {
        return sendError(response, "Please give a name for the user", 422)
    }

    const user_name = request.params.name;
    const product_name = request.body.product_name;

    consola.info(`Remove from cart recieved for user: ${user_name} with product: ${product_name}`)

    Cart.findOne({
        where: {},
        attributes: [],
        include: [{
            model: Session,
            attributes: [],
            include: [{
                model: User,
                attributes: [],
                where: {
                    name: user_name
                }
            }],
            where: {
                valid: true
            }
        }, {
            model: ProductInCart,
            include: [{
                model: ProductInStore,
                where: {
                    name: product_name
                }
            }]
        }]
    }).then(cart => {
        if (!cart) {
            return sendError(response, `Couldn't find a cart for ${user_name}`);
        }
        if (cart.ProductInCarts.length < 1) {
            return sendError(response, `Couldn't find any ${product_name} in the cart for ${user_name}`);
        }

        cart.ProductInCarts[0].ProductInStore.update({
            quantity: cart.ProductInCarts[0].ProductInStore.quantity + 1
        }).then(() => {
            cart.ProductInCarts[0].destroy().then(() => {
                response.json(cart);
            });
        });
    })
});


app.get('/users/:name/checkout', function (request, response) {
    if (!request.params.name) {
        return sendError(response, "Please give a name for the user", 422)
    }

    const user_name = request.params.name;
    consola.info(`Checkout request received for user: ${user_name}`);
    User.findOne({
        where: {
            name: user_name
        },
        attributes: ['id', 'name'],
        include: [{
            model: Session,
            attributes: ['id'],
            where: {
                valid: true
            },
            include: [{
                model: Cart,
                attributes: ['id']
            }]
        }]
    }).then(user => {
        if (!user) {
            return sendError(response, `Checkout process aborted. Could not find user: ${user_name} in db`);
        }
        if (user.Sessions.length < 1) {
            return sendError(response, `Checkout process aborted. Could not find valid session for : ${user_name} in db`);
        }
        if (!user.Sessions[0].Cart) {
            return sendError(response, `Checkout process aborted. Could not find cart for : ${user_name} in db`);
        }


        Block.findAll({
            limit: 1,
            order: [
                ['createdAt', 'DESC']
            ]
        }).then(blocks => {
            let block_num = (blocks.length) == 1 ? blocks[0].block_num + 1 : 0;
            let prev_hash = (blocks.length) == 1 ? blocks[0].curr_hash : Array(64).join("0");
            let curr_hash = (blocks.length) == 1 ? null : Array(64).join("0");

            superagent.get(`localhost:3000/users/${user_name}/cart`)
                .end((err, res) => {
                    let data = {
                        name: user.name,
                        date: new Date(),
                        products: JSON.parse(res.text)
                    }

                    Purchase.create({
                        UserId: user.id,
                        SessionId: user.Sessions[0].id,
                        CartId: user.Sessions[0].Cart.id,
                        Block: {
                            block_num: block_num,
                            data: JSON.stringify(data),
                            prev_hash: prev_hash,
                            curr_hash: curr_hash
                        }
                    }, {
                        include: [User, Session, Cart, Block]
                    }).then(purchase => {
                        user.Sessions[0].update({
                            valid: false
                        }).then(killedSession => {
                            response.json(user);

                        });

                    });
                })
        });

    });
});

// TODO
app.get('/users/:name/purchases', function (request, response) {
    if (!request.params.name) {
        return sendError(response, "Please give a name for the user", 422)
    }

    const user_name = request.params.name;

    Purchase.findAll({
        attributes: ['id', 'createdAt'],
        include: [{
            model: User,
            attributes: ['id', 'name'],
            where: {
                name: user_name
            },
        }, {
            model: Cart,
            attributes: ['id'],
            include: [{
                model: ProductInCart,
            }]
        }]
    }).then(purchases => {
        let result = purchases.map(purchase => {
            return {
                name: purchase.User.name,
                date: purchase.createdAt,
                products: purchase.Cart.ProductInCarts
            }
        })
        response.json(result);
    })

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

    const product_name = request.body.name;
    consola.info(`Add to shelf request received for ${product_name}`);

    ProductInStore.findOne({
        where: {
            name: product_name
        }
    }).then(productInStore => {
        if (productInStore) {
            productInStore.updateAttributes({
                quantity: productInStore.quantity + 1
            }).then(updatedProduct => {
                return sendSuccess(response, `Successfully updated quantity of ${updatedProduct.name} to ${updatedProduct.quantity}`);
            });
        } else {
            ProductInStore.create({
                name: product_name,
                quantity: 1,
            }).then(function (user) {
                consola.success(response, "Successfully Added Product");
                response.redirect('/');
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
    const product_name = request.body.name;

    consola.info(`Remove request received for ${product_name}`);
    ProductInStore.findOne({
        where: {
            name: product_name
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
            sendError(response, "The following product is not in the shelf: " + product_name);
        }
    });


});

// TODO
app.post('/shelf/update_in_front', (request, response) => {

});

//#endregion

module.exports = app;