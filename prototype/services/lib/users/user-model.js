
var modelBuilder = require('../data/model-builder')
  ;

// exports

module.exports = modelBuilder.createModelSql([
    'id',
    'username',
    'password',
    'email',
    'signupDate',
    'lastLoginDate',
    'verifiedDate',
    'isVerified'  
  ],
  'users'
);