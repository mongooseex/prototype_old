
var routeMan = require('./route-manager')
	;

routeMan
	.add({
		method: 'get',
		route: '/api/example/hello/:name',
		handler: function exampleHelloGetHandler(req, res, next) {
			res.send('hello, ' + req.params.name);
		}
	})
	.add({
		method: 'post',
		route: '/api/example/sayfrom/:from',
		handler: function exampleSayFromPostHandler(req, res, next) {
			var responseText = req.params.from + ': ' + req.body;
			res.send(responseText);
		}
	});

exports.activate = function activeExampleRoutes(server) {
	routeMan.activate(server);
};