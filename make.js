/* AutoSamplerSorter / make.js
 * echo 'make script for AutoSamplerSorter' && node make
 * (c) 2015 David (daXXog) Volm ><> + + + <><
 * Released under Apache License, Version 2.0:
 * http://www.apache.org/licenses/LICENSE-2.0.html  
 */

var bitfactory = require('bitfactory'),
    UglifyJS = require("uglify-js"),
    stoptime = require('stoptime'),
    fs = require('fs');

var watch = stoptime(),
    header = '';

bitfactory.make({ //routes
    "": function(err, results) {
        console.log('built AutoSamplerSorter in ' + watch.elapsed() + 'ms.');
    }
}, { //dependencies
    "*": { //wildcard
        "header": function(cb) {
            fs.readFile('auto-sampler-sorter.h', 'utf8', function(err, data) {
                header = data;
                cb(err);
            });
        },
        "auto-sampler-sorter.min.js": ["header", function(cb) {
            fs.writeFileSync('auto-sampler-sorter.min.js', header + UglifyJS.minify('auto-sampler-sorter.js').code);
            cb();
        }],
        "cli.min.js": ["header", function(cb) {
            fs.writeFileSync('cli.min.js', header + UglifyJS.minify('cli.js').code);
            cb();
        }]
    }
});