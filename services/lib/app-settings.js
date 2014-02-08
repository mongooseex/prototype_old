// todo: there has to be a better way to deal with settings

var connStrings = { }
  ;

// connection strings
connStrings = {
  sql: {
    users: 'mysql://root:root@localhost/mongoosex'
  },
  neo4j: {
    events: 'http://mxsandbox.sb01.stations.graphenedb.com:24789/db/data/'
  }
}; 

// exports
module.exports = {
  connectionStrings: connStrings
};