
function createModelFromProperties(properties) {

  var model = {};

  properties.forEach(function propForEach(p) {
    model[p] = '';
  });

  return model;
}

exports.createModelSql = function createModelSql(properties, tableName) {
	
  var sql = require('sql').create('mysql')
    ;

  return {
    name: tableName,
    table: sql.define({
      name: tableName,
      columns: properties
    }),
    model: createModelFromProperties(properties)
  };
};

exports.createModelNeo = function createModelNeo4j(properties, nodeLabel) {

  var seraphModel = require('seraph-model')
    ;

  return {
    label: nodeLabel,
    build: function (neoDb) {
      return seraphModel(neoDb, nodeLabel);
    },
    model: createModelFromProperties(properties)
  }
};