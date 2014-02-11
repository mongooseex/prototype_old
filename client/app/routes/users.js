var usersClient = require('./../lib/clients/users-client')
    , q = require('q')
    ;

var users = function (server) {

    server.get('/users/register', returnRegister);
    server.post('/users/register',register, returnRegister);
    server.get('/users/login', returnLogin)

};


var register = function (req, res, next) {

    usersClient.register(req.body);

    next();

};

var returnRegister = function (req, res, next) {

    res.render('register.html', {
        locals : {
            title : 'mongoosex'
            ,description: 'mongoosex'
            ,author: 'mongoosex'
            ,analyticssiteid: 'XXXXXXX'
        }
    });

};

var returnLogin = function (req, res, next) {

    res.render('login.html', {
        locals : {
            title : 'mongoosex'
            ,description: 'mongoosex'
            ,author: 'mongoosex'
            ,analyticssiteid: 'XXXXXXX'
        }
    });

};



module.exports = users;