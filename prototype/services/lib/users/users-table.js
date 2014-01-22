var sql = require('sql').create('mysql')
  ;

module.exports = sql.define({
  name: 'users',
  columns: [
    'id',
    'username',
    'password',
    'email',
    'signupDate',
    'lastLoginDate',
    'verifiedDate',
    'isVerified'
  ]
});