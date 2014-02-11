var usersClient = require('./../lib/clients/users-client')
    , q = require('q')
    ;

var users = function (server) {

    server.get('/users/register', returnPage);
    server.post('/users/register',makeRequest, returnPage);

};


var makeRequest = function (req, res, next) {

    console.log('make request');
    console.log(req.body);

    usersClient.register(req.body);

    next();

};

var returnPage = function (req, res, next) {

    res.render('register.html', {
        locals : {
            title : 'mongoosex'
            ,description: 'mongoosex'
            ,author: 'mongoosex'
            ,analyticssiteid: 'XXXXXXX'
        }
    });

};



module.exports = users;