const request = require('supertest');
const app = require('../app');
const db = require('../models');
const fs = require('fs');

describe('Blockchain tests', () => {
    it('Returns a list of blocks and their data that needs hashing', async() => {
        const response = await request(app)
            .post('/needs-hashing')
        expect(response.statusCode).toBe(200);        
    });

});