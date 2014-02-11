var request = require('request')
    , q = require('q')
    ;


var usersClient = {

    register: function (body) {

        var options = {
            url: 'http://localhost:8888/api/users',
            json: body
        };

        var callback = function (error, response, body) {

            console.log('in callback');
            console.log(error);
            console.log(response.statusCode);

            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);

                console.log('success' + response.statusCode);

            }
            else {
                console.log('error' + response.statusCode);
            };

        };

        request.post(options, callback);

    }

};




module.exports = usersClient;