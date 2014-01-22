
var appSettings = require('../lib/app-settings')
  , rMan = require('./route-manager').createManager()
  , users = require('../lib/users/users-table')
  , userProto = require('../lib/users/user-model')
  , mysql = require('mysql')
  , _ = require('lodash')
  ;

function completeRequest(db, res, code, desc, cont) {
  res.send(code, {
    description: desc,
    content: cont
  });
  db.end();
}

function createAndReturn(db, res, accInput) {

  var signupDate = new Date();
  var addUserCmd = users
    .insert(
      users.username.value(accInput.username.toLowerCase()),
      users.password.value(accInput.password),
      users.email.value(accInput.email.toLowerCase()),
      users.signupDate.value(signupDate),
      users.lastLoginDate.value(signupDate),
      users.isVerified.value(false)
    )
    .toQuery();

  var getUserQuery = users
    .select(
      users.id, users.username, users.email, users.isVerified
    )
    .from(users)
    .where(
      users.username.equals(accInput.username.toLowerCase())
    )
    .toQuery();

  db.query(addUserCmd.text, addUserCmd.values, 
    function execInsert (err) {
      if (err) {
        completeRequest(db, res, 500, 'error', err);
        return;
      }

      db.query(getUserQuery.text, getUserQuery.values,
        function execQuery (err, rows) {

          if (err) {
            completeRequest(db, res, 500, 'error', err);
            return;
          }    

          var result = rows[0];
          result.isVerified = (result.isVerified.readInt8(0) == 0) ? false : true;  
          completeRequest(db, res, 201, 'created', result);

        });            
    });  
}


rMan
  .add({
    method: 'post',
    route: '/api/accounts/create',
    handler: function (req, res, next) {

      // takes: { username: '', password: '', email: '' }

      var accInput = req.body
        , db
        ;

      var newUser = _.reduce(userProto, function (result, v, key) {
        var value = accInput[key];

        if (_.isUndefined(value)) return result;

        result[key] = value;   
        return result;
      }, { })

      console.log(newUser);

      var existsQuery = users.select(users.username, users.email)
        .from(users)
        .where(
          users.username.equals(newUser.username.toLowerCase())
        )
        .or (
          users.email.equals(newUser.email.toLowerCase())
        )
        .toQuery();

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

              var u = rows[0].username.toLowerCase()
                , e = rows[0].email.toLowerCase()
                , msg = 'unknown conflict'
                ;

              if (u === newUser.username.toLowerCase()) {
                msg = 'this username already exists';
              } else if (e === newUser.email.toLowerCase()) {
                msg = 'a user already had this email account';
              }

              completeRequest(db, res, 409, 'conflict', msg);
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
    route: 'api/accounts/authenticate',
    handler: function (req, res, next) { 

      // takes: { username: '', password: '' }

      var authQuery
        , db
        , credentials = req.body
        , 

      authQuery = users
        .select(
          users.id, users.username, users.email, users.isVerified
        )
        .from(users)
        .where(
          users.username.equals(credentials.username.toLowerCase()),
          users.password.equals(credentials.password)
        )
        .toQuery(); 

      db = mysql.createConnection(appSettings.connectionStrings.sql.users);
      db.connect(function connectDb(err) {

        if (err) {
          completeRequest(db, res, 500, 'error', err);
          return;
        }

        db.query(authQuery.text, authQuery.values,
          function authQuery(err, rows) {

            if (err) {
              completeRequest(db, res, 500, 'error', err);
              return;
            }

            if (!rows || rows.length === 0) {
              completeRequest(db, res, 401, 'unauthorized', null);
              return;
            }

            var result = rows[0];
            result.isVerified = (result.isVerified.readInt8(0) == 0) ? false : true;  
            completeRequest(db, res, 200, 'authorized', result);
            return;
          });

      });               
  
      return next();
    }
  });

  exports.activate = function activateAccRoutes(server) {
    rMan.activate(server);
  };