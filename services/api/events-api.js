
var appSettings = require('../lib/app-settings')
  , url = require('url')
  , neoConnectionString = appSettings.connectionStrings.neo4j.main
  , graphDb = require('seraph')(createSeraphConnObj(neoConnectionString))
  , Profile = require('../lib/profiles/profile-model.js')  
  , profileRepo = Profile.build(graphDb)
  , Event = require('../lib/events/event-model.js')  
  , eventRepo = Event.build(graphDb)
  , mysql = require('mysql')
  , users = require('../lib/users/user-model').table    
  , routes = require('./route-manager').createManager()
  , _ = require('lodash')
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
        , newEvent
        , username = req.username
        , getUserQuery = getUserByUsernameQuery(username.toLowerCase())
        , db
        ;

      if (!username || username === 'anonymous') {
        completeRequest(db, res, 400, 'error', 'missing username');
        return;
      }

      newEvent = _.reduce(Event.model, function (result, v, k) {
        var value = eventInput[k];

        if (_.isUndefined(value)) return result;

        result[k] = value;
        return result;
      }, { });

      db = mysql.createConnection(appSettings.connectionStrings.sql.main);
      db.connect(function connectDb(err) {
        
        if (err) {
          completeRequest(db, res, 500, 'error', err);
          return;
        }

        db.query(getUserQuery.text, getUserQuery.values, function (err, rows) { 

          if (err) {
            completeRequest(db, res, 500, 'error', err);
            return;
          }

          if (!rows || rows.length === 0) {
            completeRequest(db, res, 400, 'error', 'user not found');
          }

          profileRepo.where({ username: username }, function (err, nodes) {

            if (err) {
              completeRequest(db, res, 500, 'error', err);
              return;
            }

            if (!nodes && nodes.length === 0) {
              completeRequest(db, res, 400, 'error', 'user not found');
              return;
            }

            var userProfile = nodes[0];
            
            eventRepo.save(newEvent, function (err, node) {
              
              if (err) {
                completeRequest(db, res, 500, 'error', err);
                return;
              }

              if (!node) {
                completeRequest(
                  db, res, 500, 'error', 'problem creating event node');
                return;
              }

              graphDb.relate(node.id, 'attending', userProfile.id, 
                { role: 'owner' }, function (err, relationship) {

                  if (err) {
                    completeRequest(db, res, 500, 'error', err);
                    return;
                  }

                  if (!relationship) {
                    completeRequest(
                      db, res, 500, 'error', 'problem creating event node');
                    return;
                  }

                  completeRequest(db, res, 201, 'created', newEvent); 
              });
            }); 
          });   
        });
      });

      return next();
    }
  });

  exports.activate = routes.activate;
  