/* AutoSamplerSorter
 * Sort Mainstage 3 auto-samples for use in Ableton Live
 * (c) 2015 David (daXXog) Volm ><> + + + <><
 * Released under Apache License, Version 2.0:
 * http://www.apache.org/licenses/LICENSE-2.0.html  
 */

/* UMD LOADER: https://github.com/umdjs/umd/blob/master/returnExports.js */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals (root is window)
        root.AutoSamplerSorter = factory();
  }
}(this, function() {
    var AutoSamplerSorter;

    var sh = require('shelljs'),
        S = require('string'),
        path = require('path'),
        fs = require('fs');

    var noteOrder = [
        'C',
        'C#',
        'D',
        'D#',
        'E',
        'F',
        'F#',
        'G',
        'G#',
        'A',
        'A#',
        'B'
    ];

    var haystacks = [];

    noteOrder.forEach(function(v, i, a) {
        var haystack = [];

        for(var j = 0; j < 10; j++) {
            haystack.push(v + (j-2));
        }

        haystacks.push(haystack);
    });

    var msnpf = function(haystacks, needle) { //Multi-Stack Needle Position Finder
        var position = [];

        haystacks.forEach(function(haystack, i, a) {
            haystack.forEach(function(v, j, b) {
                if(v === needle) {
                    position = [i, j];
                };
            });
        });

        return position;
    };

    var twodigits = function(n) {
        return ('0' + n).slice(-2);
    };

    AutoSamplerSorter = function() {
        var pwd = sh.pwd().toString(),
            patchName = path.basename(pwd),
            roundRobin = haystacks.map(function(v) { //make a matrix for roundRobin values
                return v.map(function(v) {
                    return 0;
                });
            }),
            madeRobin  = {};

        fs.readdir(pwd, function(err, items) {
            if(!err) {
                if(items.length >= 120) { //only really does one velocity right now
                    console.log('# ' + patchName);
                    console.log('# ' + (items.length / 10) + ' octaves');

                    items.forEach(function(v, i, a) { //remove hidden items like .DS_Store
                        if(S(v).startsWith('.')) {
                            a.splice(i, 1);
                        }
                    });

                    items.map(function(v) {
                        var tags = S(v).replaceAll(patchName + '-', '').split('-'),
                            hayneedle = [],
                            octave = -1,
                            note = -1;
                            velocity = -1,
                            rrobin = -1;
                            ext = '';

                        if(tags.length === 3) {
                            hayneedle = msnpf(haystacks, tags[0]);
                            octave = hayneedle[1];
                            note = hayneedle[0];
                            velocity = parseInt(tags[1], 10);
                            ext = tags[2];
                        } else if(tags.length === 4) { //negative octave values
                            hayneedle = msnpf(haystacks, tags[0] + '-' + tags[1]);
                            octave = hayneedle[1];
                            note = hayneedle[0];
                            velocity = parseInt(tags[2], 10);
                            ext = tags[3];
                        } else {
                            console.error('# # !error! #:# invalid filename scheme!');
                            console.log('# # !error! #:# ' + v + ' | ' + tags.length + ' | ' + tags);
                        }

                        if((velocity === -1 && note === -1 && octave === -1) || isNaN(velocity) || isNaN(note) || isNaN(octave)) {
                            return - 1;
                        } else {
                            console.log(velocity, note, octave);
                            rrobin = roundRobin[note][octave] += 1; //figure out how many robins

                            //some messy return line login ;)
                            return [v, ((rrobin > 1) ? 'round-robin-' + rrobin : -1), ((rrobin > 1) ? './round-robin-' + rrobin + '/' : '') + [octave, twodigits(note), noteOrder[note], velocity, 'SORTED-', ext].join('-')];
                        }
                    }).forEach(function(v, i, a) {
                        if(v !== -1) {
                            if((v[1] !== -1) && !madeRobin[v[1]]) { //make round robin directory
                                console.log('mkdir ' + v[1]);
                                madeRobin[v[1]] = true;
                            }

                            console.log('mv ' + v[0] + ' ' + v[2]);
                        }
                    });
                }
            } else {
                console.error('# # !error! #:# ' + err);
            }
        });
    }
    
    return AutoSamplerSorter;
}));
