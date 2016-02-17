'use strict';

var glob = require('glob');
var _ = require('lodash');
var async = require('async');
var fs = require('fs');


//console.log('FOLDER IS', folder);
var krawl = {};

krawl.searchFiles = function(folder, next) {
    var options = {};
    glob(folder + '/**/*.js', options, function (err, files) {
        next(files);
    });
};

krawl.getFileName = function(path) {
    return _.last(path.split('/'));
};

krawl.loadFiles = function(files, next) {
    var module = {};
    async.each(files, function(file, cb) {
        var fileName = _.first(krawl.getFileName(file).split('.'));
        module[fileName] = require(file);
        cb();
    }, function() {
        next(module);
    });
};

krawl.constructMetaData = function(modules) {
    var keys = _.keys(modules);
    var meta = [];

    _.forEach(keys, function(name) {
        //console.log('Module is', _.keys(modules[name]));
        var moduleKeys = _.keys(modules[name]);

        var obj = modules[name];

        var functions = [];
        _.forEach(moduleKeys, function(attr) {
            if (typeof obj[attr] === 'function') {
                functions.push(attr);
            }
        });

        meta.push({ 'name': name, functions: functions});
        //console.log('Meta is', meta);
    });


    return meta;

};

krawl.writeDump = function(path, name, json) {
    fs.writeFile('meta.json', JSON.stringify(json, null, 4), function(err) {
          if (err) throw err;
          console.log('Metadata has been saved under \'meta.json\'');
    });
};

krawl.generate = function(path, next) {
    krawl.searchFiles(path, function(files) {
        krawl.loadFiles(files, function(modules) {
                next(krawl.constructMetaData(modules));
        });
    });
};

module.exports = krawl;
