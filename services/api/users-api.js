
var appSettings = require('../lib/app-settings')
  , routes = require('./route-manager').createManager()
  , url = require('url')
  , users = require('../lib/users/user-model').table
  , userModel = require('../lib/users/user-model').model
  , mysql = require('mysql')
  , eventsConnectionString = appSettings.connectionStrings.neo4j.events
  , graphDb = require('seraph')(createSeraphConnObj(eventsConnectionString))
  , graphModel = require('seraph-model')
  , Profile = graphModel(graphDb, 'profile')
  , _ = require('lodash')
  ;

// -----------------
// query creation
// -----------------

function getAddUserCmdQuery(currentDate, acc) {
  var q = users
    .insert(
      users.username.value(acc.username.toLowerCase()),
      users.password.value(acc.password),
      users.email.value(acc.email.toLowerCase()),
      users.signupDate.value(currentDate),
      users.lastLoginDate.value(currentDate),
      users.isVerified.value(false)
    )
    .toQuery();  

    return q;
}

function getUserByIdQuery(id) {
  var q = users
    .select(users.id, users.username, users.email, users.isVerified)
    .from(users)
    .where(users.id.equals(id))
    .toQuery();

    return q;
}

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

function getUserByUsernameOrEmailQuery(username, email) {
  var q = users.select(users.username, users.email)
    .from(users)
    .where(
      users.username.equals(username.toLowerCase())
    )
    .or (
      users.email.equals(email.toLowerCase())
    )
    .toQuery();

  return q;
}

// -------------
// api heplers
// -------------

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

function completeRequest(db, res, code, desc, cont) {
  res.send(code, {
    description: desc,
    content: cont
  });
  db.end();
}

function getSignupErrorMsg(row, user) {
  var u = row.username.toLowerCase()
    , e = row.email.toLowerCase()
    , msg = 'unknown conflict'
    ;

  if (u === user.username.toLowerCase()) {
    msg = 'this username already exists';
  } else if (e === user.email.toLowerCase()) {
    msg = 'a user already had this email account';
  }  

  return msg;
}

function createAndReturn(db, res, userInput) {

  var addUserCmd = getAddUserCmdQuery(new Date(), userInput)
    , getUserQuery = getUserByUsernameQuery(userInput.username.toLowerCase())
    ;

  db.query(addUserCmd.text, addUserCmd.values, 
    function execInsert (err) {
      if (err) {
        completeRequest(db, res, 500, 'error', err);
        return;
      }

      db.query(getUserQuery.text, getUserQuery.values,
        function execQuery (err, rows) {
          
          var p = {
            username: userInput.username.toLowerCase()
          }
          
          if (err) {
            completeRequest(db, res, 500, 'error', err);
            return;
          }    

          Profile.save(p, function (err, node) {

            if (err) {
              completeRequest(db, res, 500, 'error', err);
              return;
            }

            var result = rows[0];
            result.isVerified = (result.isVerified.readInt8(0) == 0) 
              ? false 
              : true;  

            completeRequest(db, res, 201, 'created', result);
          });
        });            
    });  
}

// ---------
// routes
// ---------

routes
  .add({
    method: 'post',
    route: '/api/users',
    handler: function (req, res, next) {

      // takes: { username: '', password: '', email: '' }

      var userInput = req.body
        , newUser
        , existsQuery
        , db
        ;

      newUser = _.reduce(userModel, function (result, v, key) {
        var value = userInput[key];

        if (_.isUndefined(value)) return result;

        result[key] = value;   
        return result;
      }, { })

      existsQuery = getUserByUsernameOrEmailQuery(
        userInput.username, userInput.email
      );

      db = mysql.createConnection(appSettings.connectionStrings.sql.users);
      db.connect(function connectDb(err) {
        
        if (err) {
          completeRequest(db, res, 500, 'error', err);
          return;
        }

        db.query(existsQuery.text, existsQuery.values, 
          function execCount(err, rows) {

            if (err) {
              completeRequest(db, res, 500, 'error', err);
              return;
            }

            if (rows && rows.length > 0) {
              completeRequest(
                db, res, 409, 'conflict', getSignupErrorMsg(rows[0], newUser)
              );
              return;
            }

            createAndReturn(db, res, newUser);            
          });

      });

      return next();
    }
  })
  .add({
    method: 'post',
    route: 'api/users/auth',
    handler: function (req, res, next) { 

      // takes: { username: '', password: '' }

      // FOR PROTOTYPE JUST USE BASIC HTTP AUTH
      completeRequest(db, res, 410, 'discontinued', 'use basic http auth');

      var getUserQuery
        , db
        , credentials = req.body
        ; 

      getUserQuery = getUserByUsernameQuery(
        credentials.username, credentials.password
      );

      db = mysql.createConnection(appSettings.connectionStrings.sql.users);
      db.connect(function connectDb(err) {

        if (err) {
          completeRequest(db, res, 500, 'error', err);
          return;
        }

        db.query(getUserQuery.text, getUserQuery.values,
          function getUserQuery(err, rows) {

            if (err) {
              completeRequest(db, res, 500, 'error', err);
              return;
            }

            if (!rows || rows.length === 0) {
              completeRequest(db, res, 401, 'unauthorized', null);
              return;
            }

            var result = rows[0];
            result.isVerified = (result.isVerified.readInt8(0) === 0) 
              ? false 
              : true;  

            completeRequest(db, res, 200, 'authorized', result);
            return;
          });
      });               
  
      return next();
    }
  })
  .add({
    method: 'get',
    route: 'api/users/:id',
    handler: function (req, res, next) {

      // takes id in route

      var getUserQuery = getUserByIdQuery(req.params.id)
        , user
        ;

      db = mysql.createConnection(appSettings.connectionStrings.sql.users);
      db.connect(function connectDb(err) {

        if (err) {
          completeRequest(db, res, 500, 'error', err);
          return;
        }

        db.query(getUserQuery.text, getUserQuery.values,
          function getUserQuery(err, rows) {

            if (err) {
              completeRequest(db, res, 500, 'error', err);
              return;
            }

            if (!rows || rows.length < 1) {
              completeRequest(db, res, 404, 'user not found', null);
              return;
            }

            user = rows[0];
            user.isVerified = (user.isVerified.readInt8(0) === 0)
              ? false
              : true;

            completeRequest(db, res, 200, 'user found', user);
            return;
          });
      });

      return next();
    }
  });

  // -----------
  // exports
  // -----------

  exports.activate = routes.activate;