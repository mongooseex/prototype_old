
var modelBuilder = require('../data/model-builder')
  ;

// exports

module.exports = modelBuilder.createModelNeo([
    'title',
    'description',
    'location',
    'createdDate',
    'startDate',
    'endDate',
    'isPrivate'
  ],
  'Event'
);