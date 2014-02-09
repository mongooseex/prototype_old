
// i wrote this so i didn't have to use a view engine (ejs or jade) with express.
// there's probably a reason why express almost forces you to use one, but i'm fighting it
// unless proven wrong.

var viewEngine = {

    compile: function (html, options) {

        return function (locals) {
            return html;
        }

    }

};

module.exports = viewEngine;