

var users = function (app) {

    app.get('/users/register', returnPage);
    app.post('/users/register',logInfo, returnPage);

};


var logInfo = function (req, res, next) {
    console.log(req.body);

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