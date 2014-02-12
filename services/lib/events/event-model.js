
var modelBuilder = require('../data/model-builder')
  ;

// exports

module.exports = modelBuilder.createModelNeo([
    'title',
    'location',
    'startDate',
    'endDate',
    'isPrivate'
  ],
  'event'
);