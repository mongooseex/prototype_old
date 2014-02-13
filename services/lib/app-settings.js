// todo: there has to be a better way to deal with settings

var connStrings = { }
  ;

// connection strings
connStrings = {
  sql: {
    main: 'mysql://root:root@localhost/mongoosex'
  },
  neo4j: {
    main: 'http://mx-sandbox:864O3dzgEkLdy7NO0AFH' + '@' +
      'mxsandbox.sb01.stations.graphenedb.com:24789',
  }
}; 

// exports
module.exports = {
  connectionStrings: connStrings
};