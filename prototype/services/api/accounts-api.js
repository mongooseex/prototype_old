
var appSettings = require('../lib/app-settings')
  , rMan = require('./route-manager').createManager()
  , users = require('../lib/users/users-table')
  , userProto = require('../lib/users/user-model')
  , mysql = require('mysql')
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

function getUserByUsernameQuery(username, password) {
  var q = users
    .select(
      users.id, users.username, users.email, users.isVerified
    )
    .from(users)
    .where(
      users.username.equals(username.toLowerCase())
    );

    if (password) {
      q.and(users.password.equals(password));
    }

    q = q.toQuery();  

  return q;
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

function createAndReturn(db, res, accInput) {

  var addUserCmd = getAddUserCmdQuery(new Date(), accInput)
    , getUserQuery = getUserByUsernameQuery(accInput.username.toLowerCase())
    ;

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
          result.isVerified = (result.isVerified.readInt8(0) == 0) 
            ? false 
            : true;  

          completeRequest(db, res, 201, 'created', result);
        });            
    });  
}

// ---------
// routes
// ---------

rMan
  .add({
    method: 'post',
    route: '/api/accounts/create',
    handler: function (req, res, next) {

      // takes: { username: '', password: '', email: '' }

      var accInput = req.body
        , newUser
        , existsQuery
        , db
        ;

      newUser = _.reduce(userProto, function (result, v, key) {
        var value = accInput[key];

        if (_.isUndefined(value)) return result;

        result[key] = value;   
        return result;
      }, { })

      existsQuery = getUserByUsernameOrEmailQuery(
        accInput.username, accInput.email
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
    route: 'api/accounts/authenticate',
    handler: function (req, res, next) { 

      // takes: { username: '', password: '' }

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
            result.isVerified = (result.isVerified.readInt8(0) == 0) 
              ? false 
              : true;  

            completeRequest(db, res, 200, 'authorized', result);
            return;
          });

      });               
  
      return next();
    }
  });

  // -----------
  // exports
  // -----------

  exports.activate = rMan.activate;