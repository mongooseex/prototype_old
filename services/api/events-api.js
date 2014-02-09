
var appSettings = require('../lib/app-settings')
  , eventsConnectionString = appSettings.connectionStrings.neo4j.events
  , routes = require('./route-manager').createManager()
  , url = require('url')
  , graphDb = require('seraph')(createSeraphConnObj(eventsConnectionString))
  ;

function createSeraphConnObj(endpoint) {
  var parsedUrl = url.parse(endpoint)
    , urlProto = parsedUrl.protocol
    , urlAuth = parsedUrl.auth
    , urlHost = parsedUrl.host
    , urlPath = parsedUrl.pathname
    , connObj
    ;

  connObj = (urlPath.length > 1)
    ? { server: urlProto + '//' + urlAuth + urlHost, endpoint: urlPath }
    : endpoint;

  return connObj;
}


// todo: refactor, duplicated (almost)
function completeRequest(res, code, desc, cont) {
  res.send(code, {
    description: desc,
    content: cont
  });
}

routes
  .add({
    method: 'post',
    route: '/api/events',
    handler: function (req, res, next) {
      var eventInput = req.body
        ;

      // temporary: echo back submitted input + interesting data

      eventInput.connectionData = {
        raw: eventsConnectionString,
        obj: createSeraphConnObj(eventsConnectionString)
      };

      completeRequest(res, 201, 'created', eventInput);
      return next();
    }
  });

  exports.activate = routes.activate;