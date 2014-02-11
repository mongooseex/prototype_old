
var appSettings = require('../lib/app-settings')
  , url = require('url')
  , eventsConnectionString = appSettings.connectionStrings.neo4j.events
  , graphDb = require('seraph')(createSeraphConnObj(eventsConnectionString))
  , mysql = require('mysql')
  , users = require('../lib/users/user-model').table    
  , routes = require('./route-manager').createManager()
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

// todo: refactored, duplicated
function getUserByUsernameQuery(username, password) {
  var q = users
    .select(users.id, users.username, users.email, users.isVerified)
    .from(users)
    .where(users.username.equals(username.toLowerCase()));

    if (password) {
      q.and(users.password.equals(password));
    }

    return q.toQuery();  
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
  