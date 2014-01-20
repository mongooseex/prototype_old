
var restify = require('restify')
	, exampleApi = require('./api/example-api')
  , userApi = require('./api/user-api')
  ;

var server = restify.createServer({
  name: 'mongoosex prototype services',
  version: '0.0.0'
})

// setup server

server.use(restify.bodyParser({ mapParams: false }));

// example
// server.get(exampleApi.hello.route, exampleApi.hello.handler);
exampleApi.activate(server);

// user
//server.get(userApi

server.listen(8888);