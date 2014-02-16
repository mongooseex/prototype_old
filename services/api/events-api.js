
var appSettings = require('../lib/app-settings')
  , routes = require('./route-manager').createManager()
  , url = require('url')
  , neoConnectionString = appSettings.connectionStrings.neo4j.main
  , graphDb = require('seraph')(createSeraphConnObj(neoConnectionString))
  , User = require('../lib/users/user-model.js')  
  , userRepo = User.build(graphDb)
  , Event = require('../lib/events/event-model.js')  
  , eventRepo = Event.build(graphDb) 
  , _ = require('lodash')
  ;

// -------
// helpers
// -------

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

// --------------
// --------------

function makeEventFromInputObj(input) {
  var output
    ;

  output = _.reduce(Event.model, function (result, v, k) {
    var value = input[k];

    if (_.isUndefined(value)) return result;

    result[k] = value;
    return result;
  }, { });

  output.createDate = new Date();

  return output;
}

// --------------
// --------------

// todo: refactor, duplicated
function completeRequest(res, code, desc, cont) {
  res.send(code, {
    description: desc,
    content: cont
  });
}

// -------
// routes
// -------

routes
  .prefix('/api/events')
  .add({
    method: 'post',
    handler:  function (req, res, next) {

      // input = {
      //   title: '',
      //   description: '',
      //   location: '',
      //   startDate: [Date],
      //   endDate: [Date],
      //   isPrivate: [true|false]
      // };

      var ev = makeEventFromInputObj(req.body)
        , username = req.username
        , user
        , badSaveMsg
        , badEventSaveMsg
        ;

      if (!username || username === 'anonymous') {
        completeRequest(res, 400, 'error', 'missing username');
        return next();
      }

      userRepo.where({ username: username }, function (err, nodes) {

        if (err) {
          completeRequest(res, 500, 'error', err);
          return;
        }  

        if (!nodes || nodes.length === 0) {
          completeRequest(res, 400, 'no matching user', null);
          return;
        }  

        user = nodes[0];
        eventRepo.save(ev, function (err, savedEvent) {

          if (err) {
            completeRequest(res, 500, 'error', err);
            return;
          }

          if (!savedEvent) {
            badSaveMsg = 'event creation could not be validated';
            completeRequest(res, 500, 'error', badSaveMsg);
            return;
          }

          graphDb.relate(user.id, 'participating', savedEvent.id, 
            { as: 'owner' }, function (err, relationship) {

              if (err) {
                completeRequest(res, 500, 'error', err);
                return;
              }

              if (!relationship) {
                badEventSaveMsg = 'problem creating event node';
                completeRequest(res, 500, 'error', badEventSaveMsg);
                return;
              }

              completeRequest(res, 201, 'created', savedEvent);
            });        
        });
      });

      return next();
    }
  });

  // -------
  // exports
  // -------

  exports.activate = routes.activate;
  