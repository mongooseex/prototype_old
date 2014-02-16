var modelBuilder = require('../data/model-builder')
  ;

// exports

module.exports = modelBuilder.createModelNeo([
    'id',
    'username',
    'password',
    'email',
    'signupDate',
    'lastLoginDate',
    'verifiedDate',
    'isVerified'  
  ],
  'User'
);
