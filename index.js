var util = require('util');
var url = require('url');
var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN;
var RiakIterator = require('./iterator');
var riakpbc = require('riakpbc');
var async = require('async');


function toKey(key) {
    return typeof key === 'string' ? key : JSON.stringify(key);
}

function RiakDOWN(location) {
    if (!(this instanceof RiakDOWN)) return new RiakDOWN(location);

    AbstractLevelDOWN.call(this, location);

    var parsed = url.parse(location);
    this._client = riakpbc.createClient({ host: parsed.hostname, port: parsed.port });
    this._bucket = parsed.path.split('/')[1];
}

util.inherits(RiakDOWN, AbstractLevelDOWN);

RiakDOWN.prototype._open = function (options, callback) {
    this._client.connect(callback);
};

RiakDOWN.prototype._close = function (callback) {
    this._client.disconnect();

    process.nextTick(function () {
        callback();
    });
};

RiakDOWN.prototype._put = function (key, value, options, callback) {
    var bucket = options.bucket || this._bucket;
    
    this._client.put({
        bucket: bucket,
        key: toKey(key),
        content: {
            value: value,
            content_type: 'application/octet-stream'
        }
    }, callback);
};

RiakDOWN.prototype._get = function (key, options, callback) {
    var bucket = options.bucket || this._bucket;

    this._client.get({ bucket: bucket, key: toKey(key) }, function (err, reply) {
        if (err || (!reply || !reply.content || !reply.content.length)) {
            return callback(new Error('NotFound'));
        }

        callback(null, options.asBuffer === false ? reply.content[0].value.toString() : reply.content[0].value);
    });
};

RiakDOWN.prototype._del = function (key, options, callback) {
    var bucket = options.bucket || this._bucket;

    this._client.del({ bucket: bucket, key: toKey(key) }, callback);
};

RiakDOWN.prototype._batch = function (array, options, callback) {
    var self = this;

    async.eachSeries(array, function (item, cb) {
        if (item.type === 'put') {
            self._put(toKey(item.key), item.value, options, cb);
        } else if (item.type === 'del') {
            self._del(toKey(item.key), options, cb);
        }
    }, callback);
};

RiakDOWN.prototype._iterator = function (options) {
    return new RiakIterator(this, options);
};

module.exports = RiakDOWN;
