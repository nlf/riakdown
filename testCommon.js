var dbidx = 0;
var riak = require('riakpbc').createClient();
var async = require('async');

exports.location = function () {
    return 'riak://localhost:8087/_db_test_' + dbidx++;
};

exports.lastLocation = function () {
    return 'riak://localhost:8087/_db_test_' + dbidx;
};

exports.cleanup = function (callback) {
    riak.getBuckets(function (err, buckets) {
        if (!buckets.buckets) buckets.buckets = [];
        async.each(buckets.buckets, function (bucket, cb) {
            riak.getKeys({ bucket: bucket }, function (err, reply) {
                async.each(reply.keys, function (key, icb) {
                    riak.del({ bucket: bucket, key: key }, icb);
                }, cb);
            });
        }, callback);
    });
};

exports.setUp = function (t) {
    riak.connect(function () {
        exports.cleanup(function (err) {
            t.notOk(err, 'cleanup returned an error');
            t.end();
        });
    });
};

exports.tearDown = function (t) {
    riak.disconnect();
    riak = require('riakpbc').createClient();
    t.end();
};

exports.collectEntries = function (iterator, callback) {
    var data = [];
    var next = function () {
        iterator.next(function (err, key, value) {
            if (err) return callback(err);
            if (!arguments.length) {
                return iterator.end(function (err) {
                    callback(err, data);
                });
            }

            data.push({ key: key, value: value });
            process.nextTick(next);
        });
    };
    next();
};
