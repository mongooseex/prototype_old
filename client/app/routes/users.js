var request = require('request');

var users = function (server) {

    server.get('/users/register', returnRegister);
    server.post('/users/register',register);
    server.get('/users/login', returnLogin)
    server.post('/users/login', login);

};


var register = function (req, res, next) {

    var options = {
        url: 'http://localhost:8888/api/users',
        json: req.body
    };

    request.post(options, function (error, response,body){

        console.log(response);

        if (!error && response.statusCode == 200) {
            res.render('register.ejs', {data : {message: "registration successful"}});
        }
        else {
            console.log('registration error');

            var message = response.body.content || "error registering";

            res.render('register.ejs', {data : {message: message}});
        }

    });

};

var login = function (req, res, next) {


    if (req.body.username == "" || req.body.password == "") {
        res.render('login.ejs', {data :{message: null, error: "please enter username / password"}});
    }

    var options = {
        url: 'http://localhost:8888/api/users/auth',
        json: req.body
    };

    request.post(options, function (error, response,body){


        if (!error && response.statusCode == 200) {
            res.render('index.ejs', {data : {message:null, error:null}});
        }
        else {
            if (response.statusCode == 401) {

                res.render('login.ejs', {data :{message: null, error: "invalid username / password"}});

            }
            else {

                res.render('login.ejs', {data : {message: null, error: "error logging in"}});

            }
        }

    });

};

var returnRegister = function (req, res, next) {

    res.render('register.ejs', {data : null});

};

var returnLogin = function (req, res, next) {

    res.render('login.ejs', {data : null});

};



module.exports = users;