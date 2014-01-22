
var routeMan = require('./route-manager').createManager()
	;

routeMan
	.add({
		method: 'get',
		route: '/api/example/hello/:name',
		handler: function exampleHelloGetHandler(req, res, next) {
			res.send('hello, ' + req.params.name);
			return next();
		}
	})
	.add({
		method: 'post',
		route: '/api/example/sayfrom/:from',
		handler: function exampleSayFromPostHandler(req, res, next) {
			var responseText = req.params.from + ': ' + req.body;
			res.send(responseText);
			return next();
		}
	});

exports.activate = function activeExampleRoutes(server) {
	routeMan.activate(server);
};