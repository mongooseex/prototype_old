
var _ = require('lodash') 
	, routeList = []
  ;

exports.add = function addRoute(r) {
	routeList.push(r);
	return this;
};

exports.activate = function activateRoutes(server) {
	_(routeList).forEach(function (r) {
		switch (r.method) {
			case 'get': server.get(r.route, r.handler);
				break;
			case 'post': server.post(r.route, r.handler);
				break;
			case 'put': server.put(r.route, r.handler);
				break;
			case 'delete': server.delete(r.route, r.handler)
				break;
		}
	});

	return this;
};