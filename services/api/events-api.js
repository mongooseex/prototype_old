
var appSettings = require('../lib/app-settings')
  , routes = require('./route-manager').createManager()
  , url = require('url')
  , graphDb = require('seraph')
  ;

function createSeraphConnectionObj(endpoint) {
  var parsedUrl = url.parseUrl(endpoint)
    , urlHost = parsedUrl.protocol + '//' + parsedUrl.host
    , urlPath = parsedUrl.pathname
    ;

  return {
    server: urlHost,
    endpoint: urlPath
  };
}


// todo: refactor, duplicated (almmost)
function completeRequest(res, code, desc, cont) {
  res.send(code, {
    description: desc,
    content: cont
  });
}

routes
  .add({
    method: 'post',
    route: '/api/events',
    handler: function (req, res, next) {
      var eventInput = req.body
        ;

      // temporary: echo back submitted input

      completeRequest(res, 201, 'created', eventInput);
      return next();
    }
  });

  exports.activate = routes.activate;