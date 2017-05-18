var jwt = require('jsonwebtoken');

// route middleware to decode a token
module.exports = function (req, res, next) {
    if (typeof req.headers.authorization !== 'undefined') {
        var token = req.headers.authorization;
        if (token) {
            var decoded = jwt.decode(token);
            if (decoded) {
                req.json_op_userId = decoded._doc;
            }
        }
    }
    next();
};