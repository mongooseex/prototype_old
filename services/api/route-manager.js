
function addRoute(routeList, route) {
	routeList.push(route);
	return routeList;
}

function activateRoutes(routePrefix, routeList, restifyServer) {
	for (var i = 0, l = routeList.length; i < l; i += 1) {
		var r = routeList[i]
			, route = ''
			;

		route = routePrefix + r.suffix;

		switch (r.method) {
			case 'get': 
				restifyServer.get(route, r.handler);
				break;
			case 'post': 
				restifyServer.post(route, r.handler);
				break;
			case 'put': 
				restifyServer.put(route, r.handler);
				break;
			case 'delete': 
				restifyServer['delete'](route, r.handler)
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
	var routeList = []
		, routePrefix = ''
		;

	return {
		add: function instanceAddRoute(r) {

			if (!('suffix' in r)) {
				r.suffix = '';
			}

			addRoute(routeList, r);
			return this;
		},
		activate: function instanceActivateRoutes(server) {
			activateRoutes(routePrefix, routeList, server);
			return this;
		},
		prefix: function instanceSetRoutePrefix(route) {
			routePrefix = route;
			return this;
		}
	};	
};