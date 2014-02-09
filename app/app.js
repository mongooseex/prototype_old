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
    server.register('.html', { compile: compilehtml });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "SECRETshhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);

});

server.listen(port);

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////


require('./routes/index')(server);
require('./routes/users')(server);
require('./routes/errors')(server); // errors should be the last in this list (contains catchall routes).


///////////////////////////////////////////
//          temp html module             //
///////////////////////////////////////////

function compilehtml(str, options){
    return function(locals){
        return str;
    };
};

console.log('Listening on http://localhost' + port );
