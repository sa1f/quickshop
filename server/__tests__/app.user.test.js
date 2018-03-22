const request = require('supertest');
const app = require('../app');
const db = require('../models');
const fs = require('fs');

describe('User login tests', () => {
    it('Tries to register without a name or password', async () => {
        const response = await request(app).post('/register');
        expect(response.statusCode).toBe(422);
        expect(response.text).toContain("name");
    });

    it('Tries to register without a password', async () => {
        const response = await request(app)
            .post('/register')
            .field('name', 'jim');
        expect(response.statusCode).toBe(422);
        expect(response.text).toContain("password");
    });

    it('Tries to register without a picture', async () => {
        const response = await request(app)
            .post('/register')
            .field('name', 'jim')
            .field('password', 'jim');
        expect(response.statusCode).toBe(422);
        expect(response.text).toContain("picture");
    });

    it('Tries to register with a non image upload', async () => {
        const response = await request(app)
            .post('/register')
            .field('name', 'jim')
            .field('password', 'jim')
            .attach('picture', './__tests__/nonimageupload');
        expect(response.statusCode).toBe(422);
        expect(response.text).toContain("picture");
    });

    it('Successfully register', async () => {
        db.User.destroy({where: {}});
        const response = await request(app)
            .post('/register')
            .field('name', 'jim')
            .field('password', 'jim')
            .attach('picture', './__tests__/face.png');
        expect(response.statusCode).toBe(200);
    });

    it('Tries to register with same name as before', async () => {
        const response = await request(app)
            .post('/register')
            .field('name', 'jim')
            .field('password', 'kim')
            .attach('picture', './__tests__/face.png');
        expect(response.statusCode).toBe(422);
        expect(response.text).toContain("already exists");

    });

    it('Tries to register with same face as before but different name', async () => {
        const response = await request(app)
            .post('/register')
            .field('name', 'kim')
            .field('password', 'kim')
            .attach('picture', './__tests__/face.png');
        expect(response.statusCode).toBe(422);
        expect(response.text).toContain("The uploaded image of the face matches an existing record");

    });

    it('Tries to register with an image with too many faces', async () => {
        const response = await request(app)
            .post('/register')
            .field('name', 'test')
            .field('password', 'kim')
            .attach('picture', './__tests__/face.png');
        expect(response.statusCode).toBe(422);
        expect(response.text).toContain("The uploaded image of the face matches an existing record");

    });    
});