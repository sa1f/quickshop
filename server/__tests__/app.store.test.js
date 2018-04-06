const request = require('supertest');
const app = require('../app');
const db = require('../models');
const fs = require('fs');

describe('Store tests', () => {
    it('Tries to login with a nonexisting user name', async() => {
        const response = await request(app)
            .post('/login')
            .field('name', 'nonexistent')
            .field('password', 'nonexistent');
        expect(response.statusCode).toBe(404);
        expect(response.text).toContain("does not exist");
        
    });
});