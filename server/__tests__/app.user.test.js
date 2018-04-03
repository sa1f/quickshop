const request = require('supertest');
const app = require('../app');
const db = require('../models');
const fs = require('fs');

describe('User registration tests', () => {
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

    it('Successfully registers', async () => {
        db.User.destroy({where: {}});
        const response = await request(app)
            .post('/register')
            .field('name', 'jim')
            .field('password', 'jim')
            .attach('picture', './__tests__/face.png');
        expect(response.statusCode).toBe(200);
    });

    it('Tries to register with same name as before but different password', async () => {
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

    it('Tries to login with no fields', async() => {
        const response = await request(app)
            .post('/login')
        expect(response.statusCode).toBe(422);
        expect(response.text).toContain("Need username");
        
    });

    it('Tries to login with no picture or password field', async() => {
        const response = await request(app)
            .post('/login')
            .field('name', 'nonexistent')
        expect(response.statusCode).toBe(422);
        expect(response.text).toContain("Need password or picture");
        
    });

    it('Tries to login with a nonexisting user name', async() => {
        const response = await request(app)
            .post('/login')
            .field('name', 'nonexistent')
            .field('password', 'nonexistent');
        expect(response.statusCode).toBe(404);
        expect(response.text).toContain("does not exist");
        
    });

    it('Tries to login with an existing user name, but wrong password', async() => {
        const response = await request(app)
            .post('/login')
            .field('name', 'nonexistent')
            .field('password', 'nonexistent');
        expect(response.statusCode).toBe(401);
        expect(response.text).toContain("wrong password");
        
    });

    it('Tries to login with an existing user name, but wrong picture ', async() => {
        const response = await request(app)
            .post('/login')
            .field('name', 'nonexistent')
            .attach('picture', './__tests__/face.png');
        expect(response.statusCode).toBe(401);
        expect(response.text).toContain("face did not match");
        
    });

    it('Tries to login with an existing user name, correct password, but wrong picture ', async() => {
        const response = await request(app)
            .post('/login')
            .field('name', 'nonexistent')
            .attach('picture', './__tests__/noface.png');
        expect(response.statusCode).toBe(200);
        expect(response.text).not.toHaveLength(0);
        
    });

    it('Tries to login with an existing user name, wrong password, but correct picture ', async() => {
        const response = await request(app)
            .post('/login')
            .field('name', 'nonexistent')
            .attach('picture', './__tests__/face.png');
        expect(response.statusCode).toBe(200);
        expect(response.text).not.toHaveLength(0);
        
    });

    it('Successfully logins with password ', async() => {
        const response = await request(app)
            .post('/login')
            .field('name', 'nonexistent')
            .field('password', 'nonexistent');
        expect(response.statusCode).toBe(404);
        expect(response.text).toContain("does not exist");
        
    });

    it('Successfully logins with picture ', async() => {
        const response = await request(app)
            .post('/login')
            .field('name', 'nonexistent')
            .field('password', 'nonexistent');
        expect(response.statusCode).toBe(404);
        expect(response.text).toContain("does not exist");
        
    });
});