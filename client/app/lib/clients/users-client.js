var request = require('request');


var usersClient = {

    register: function (body) { register(body); },
    login: function (body) {login(body); }

};

var register = function (body) {

    var options = {
        url: 'http://localhost:8888/api/users',
        json: body
    };

    request.post(options, callback);
};

var login = function (body) {

    var options = {
        url: 'http://localhost:8888/api/users/auth',
        json: body
    };

    request.post(options, callback);

};

var callback = function (error, response, body) {

    if (!error && response.statusCode == 200) {
        console.log('success' + response.statusCode);
    }
    else {
        console.log('error' + response.statusCode);
    };

};

module.exports = usersClient;