
var viewEngine = {

    compile: function (html, options) {

        return function (locals) {
            return html;
        }

    }

};

module.exports = viewEngine;