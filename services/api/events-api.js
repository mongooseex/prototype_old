
var appSettings = require('../lib/app-settings')
  , url = require('url')
  , eventsConnectionString = appSettings.connectionStrings.neo4j.events
  , graphDb = require('seraph')(createSeraphConnObj(eventsConnectionString))
  , graphModel = require('seraph-model')
  , Event = graphModel(graphDb, 'event')
  , Profile = graphModel(graphDb, 'profile')
  , mysql = require('mysql')
  , users = require('../lib/users/user-model').table    
  , routes = require('./route-manager').createManager()
  ;

// todo: refactor, duplicated (sorta)
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


// todo: refactor, duplicated
function completeRequest(db, res, code, desc, cont) {
  res.send(code, {
    description: desc,
    content: cont
  });

  if (db) {
    db.end();
  }
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
        , username = req.username
        , getUserQuery = getUserByUsernameQuery(username.toLowerCase())
        , db
        ;

      if (!username || username === 'anonymous') {
        completeRequest(db, res, 400, 'error', 'missing username');
        return;
      }

      db = mysql.createConnection(appSettings.connectionStrings.sql.users);
      db.connect(function connectDb(err) {
        
        if (err) {
          completeRequest(db, res, 500, 'error', err);
          return;
        }

        db.query(getUserQuery.text, getUserQuery.values, 
          function execCount(err, rows) { 

            if (err) {
              completeRequest(db, res, 500, 'error', err);
              return;
            }

            if (!rows || rows.length === 0) {
              completeRequest(db, res, 400, 'error', 'user not found');
            }

            // temporary: echo back submitted input + interesting data

            eventInput.connectionData = {
              raw: eventsConnectionString,
              obj: createSeraphConnObj(eventsConnectionString)
            };

            completeRequest(db, res, 201, 'created', eventInput);            
          });
      });

      return next();
    }
  });

  exports.activate = routes.activate;
  