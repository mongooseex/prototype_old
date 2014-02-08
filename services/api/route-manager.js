
function addRoute(routeList, route) {
	routeList.push(route);
	return routeList;
}

function activateRoutes(routeList, restifyServer) {
	for (var i = 0, l = routeList.length; i < l; i += 1) {
		var r = routeList[i];

		switch (r.method) {
			case 'get': 
				restifyServer.get(r.route, r.handler);
				break;
			case 'post': 
				restifyServer.post(r.route, r.handler);
				break;
			case 'put': 
				restifyServer.put(r.route, r.handler);
				break;
			case 'delete': 
				restifyServer.delete(r.route, r.handler)
				break;
			default:
				throw new Error('unsupported method specified');
		}
	}	

	return restifyServer;
}

// -------
// exports
// -------

exports.createManager = function createManager() {
	var routeList = [];

	return {
		add: function instanceAddRoute(r) {
			addRoute(routeList, r);
			return this;
		},
		activate: function instanceActivateRoutes(server) {
			activateRoutes(routeList, server);
			return this;
		}
	};	
};