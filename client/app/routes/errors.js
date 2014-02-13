

var errors = function (server) {

    //setup the errors
    server.error(function(err, req, res, next){
        if (err instanceof NotFound) {
            res.render('404.html', { locals: {
                title : '404 - Not Found'
                ,description: ''
                ,author: ''
                ,analyticssiteid: 'XXXXXXX'
            },status: 404 });
        } else {
            console.log(err);
            res.render('500.html', { locals: {
                title : 'The Server Encountered an Error'
                ,description: ''
                ,author: ''
                ,analyticssiteid: 'XXXXXXX'
                ,error: err
            },status: 500 });
        }
    });

    //A Route for Creating a 500 Error
    server.get('/500', function(req, res){
        throw new Error('This is a 500 Error');
    });

    //The 404 Route (ALWAYS Keep this as the last route)
    server.get('/*', function(req, res){
        throw new NotFound;
    });

    function NotFound(msg){
        this.name = 'NotFound';
        Error.call(this, msg);
        Error.captureStackTrace(this, arguments.callee);
    }

};

module.exports = errors;