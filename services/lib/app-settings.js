// todo: there has to be a better way to deal with settings

var connStrings = { }
  ;

// connection strings
connStrings = {
  sql: {
    users: 'mysql://root:root@localhost/mongoosex'
  }
}; 

// exports
module.exports = {
  connectionStrings: connStrings
};