
var appSettings = require('../lib/app-settings')
  , routes = require('./route-manager').createManager()
  , url = require('url')
  , neoConnectionString = appSettings.connectionStrings.neo4j.main
  , graphDb = require('seraph')(createSeraphConnObj(neoConnectionString))
  , User = require('../lib/users/user-model')
  , userRepo = User.build(graphDb)
  , Profile = require('../lib/profiles/profile-model')
  , profileRepo = Profile.build(graphDb)
  , _ = require('lodash')
  ;

// ---------
// helpers
// ---------

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

function completeRequest(res, code, desc, cont) {
  res.send(code, {
    description: desc,
    content: cont
  });
}

// --------------
// --------------

function makeUserFromInputObj(input) {

  var output
    , currentDate = new Date()
    ;

  output = _.reduce(User.model, function (result, v, key) {
    var value = input[key];

    if (_.isUndefined(value)) return result;

    result[key] = value;   
    return result;
  }, { });

  output.username = output.username.toLowerCase();
  output.email = output.email.toLowerCase();
  output.signupDate = currentDate;
  output.lastLoginDate = currentDate;
  output.isVerified = false;

  return output;
}

// --------------
// --------------

function alreadyExistsMsg(userInput, userNodes) {

  var existsMsg = ''
    ;

  if (_.some(userNodes, { username: userInput.username })) {
    existsMsg = 'username';
  }
  if (_.some(userNodes, { email: userInput.email })) {
    if (existsMsg.length > 0) {
      existsMsg += ' and ';
    }
    existsMsg += 'email';
  }

  return existsMsg + ' already registered';
}

// -------
// routes
// -------

routes
  .prefix('/api/users')
  .add({
    method: 'post',
    handler:  function (req, res, next) {

      // input = {
      //   username: '',
      //   password: '',
      //   email: ''
      // };

      var user = makeUserFromInputObj(req.body)
        , predicate
        ;

      predicate = { username: user.username, email: user.email };
      userRepo.where(predicate, { any: true }, 
        function whereUserExists (err, nodes) {

          var existsMsg = ''
            , badSaveMsg = ''
            ;

          if (err) {
            completeRequest(res, 500, 'error', err);
            return;
          }  

          if (nodes && nodes.length > 0) {
            existsMsg = alreadyExistsMsg(user, nodes);
            completeRequest(res, 409, 'conflict', existsMsg);
            return;
          }      

          userRepo.save(user, function saveNewUser (err, savedUser) {

            if (err) {
              completeRequest(res, 500, 'error', err);
              return;
            }

            if (!savedUser) {
              badSaveMsg = 'user creation could not be validated';
              completeRequest(res, 500, 'error', badSaveMsg);
              return;
            }

            completeRequest(res, 201, 'created', savedUser);
          });
        });

      return next();
    }
  })
  .add({
    method: 'post',
    suffix: '/auth',
    handler: function (req, res, next) {

      // input = {
      //   username: '',
      //   password: ''
      // };
    
      var input = req.body
        ;

      userRepo.where(input, function whereUserPWMatch (err, nodes) {

        var user
          ;

        if (err) {
          completeRequest(res, 500, 'error', err);
          return;
        }  

        if (!nodes || nodes.length < 1) {
          completeRequest(res, 401, 'unauthorized', null);
          return;
        }

        user = nodes[0];
        completeRequest(res, 200, 'authorized', user);
      });

      return next();
    }
  });

  // -----------
  // exports
  // -----------

  exports.activate = routes.activate;