var request = require('supertest');
var app = require('../app');
describe('GET /root', function() {
    it("respond with hello world", function(done) {
        //navigate to root and check the the response is "Hello World!!"
        request(app).get('/root').expect("Hello World!!", done);
    });
});