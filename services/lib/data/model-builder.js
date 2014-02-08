
exports.createModelSql = function createModelSql(properties, tableName) {
	
  var sql = require('sql').create('mysql')
    ;

  function createModelFromPropertiesList() {

    var model = {};

    properties.forEach(function propForEach(p) {
      model[p] = '';
    });

    return model;
  }

  return {
    name: tableName,
    table: sql.define({
      name: tableName,
      columns: properties
    }),
    model: createModelFromPropertiesList()
  };
};

exports.createModelNeo4j = function createModelNeo4j() {
  return {};
};