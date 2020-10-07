var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var db = require('./models/db.js');
var cors = require('cors');
var token = require('./middleware/token.js');
var index = require('./routes/index');

var app = express();

app.listen(9000);

app.set('views', path.join(__dirname, 'view'));
app.engine('html', require('ejs').renderFile);
//app.use(express.static(__dirname + '/public'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(db());
app.use(cors());
app.use(token);

app.use('/', index);
//Respond with "hello world" for requests that hit our root "/"
app.get('/root', function(req, res) {
    res.send("Hello World!!");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    if (typeof req.json_op_status !== 'undefined') {
        if (req.json_op_status === 0) {
            res.json({
                'status': req.json_op_status,
                'message': req.json_op_message
            });
        } else {
            res.json({
                'status': req.json_op_status,
                'message': req.json_op_message,
                'data': req.json_op_data
            });
        }
    }
    next();
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({ status: 500, message: 'error' });
});

module.exports = app;