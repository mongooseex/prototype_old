
var restify = require('restify')
	, exampleApi = require('./api/example-api')
  , usersApi = require('./api/users-api')
  ;

var server = restify.createServer({
  name: 'mongoosex prototype services',
  version: '0.0.0'
})

// setup server
server.use(restify.bodyParser());

// active routes
exampleApi.activate(server);
usersApi.activate(server);


server.listen(8888);