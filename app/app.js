//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8080);

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });

    // temporary -- using .html instead of ejs or jade.

    server.register('.html', {
        compile: function(str, options){
            return function(locals){
                return str;
            };
        }
    });

    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "SECRETshhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

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
        res.render('500.html', { locals: {
            title : 'The Server Encountered an Error'
            ,description: ''
            ,author: ''
            ,analyticssiteid: 'XXXXXXX'
            ,error: err
        },status: 500 });
    }
});

server.listen(port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function(socket){
    console.log('Client Connected');
    socket.on('message', function(data){
        socket.broadcast.emit('server_message',data);
        socket.emit('server_message',data);
    });
    socket.on('disconnect', function(){
        console.log('Client Disconnected.');
    });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////


server.get('/', function(req,res){
    res.render('index.html', {
        locals : {
            title : 'mongoosex'
            ,description: 'mongoosex'
            ,author: 'mongoosex'
            ,analyticssiteid: 'XXXXXXX'
        }
    });
});



server.get('/register', function(req,res){
    res.render('register.html', {
        locals : {
            title : 'mongoosex'
            ,description: 'mongoosex'
            ,author: 'mongoosex'
            ,analyticssiteid: 'XXXXXXX'
        }
    });
});

server.post('/register', function(req,res){

    console.log(req.body);

    res.render('register.html', {
        locals : {
            title : 'mongoosex'
            ,description: 'mongoosex'
            ,author: 'mongoosex'
            ,analyticssiteid: 'XXXXXXX'
        }
    });
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


console.log('Listening on http://localhost' + port );
