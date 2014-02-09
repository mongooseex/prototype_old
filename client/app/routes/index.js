
var index = function (server) {

    server.get('/', function(req,res){

        res.render('index.html', {
            locals : {
                title : 'mongoosex'
                ,description: 'mongoosex'
                ,author: 'mongoosex'
                ,analyticssiteid: 'XXXXXXX'
            }
        });

    });

};


module.exports = index;

