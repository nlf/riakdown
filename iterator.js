var util = require('util');
var utils = require('./utils');
var async = require('async');
var Transform = require('stream').Transform;
var AbstractIterator = require('abstract-leveldown').AbstractIterator;

function RiakIterator(db, options) {
    AbstractIterator.call(this, db);

    options = JSON.parse(JSON.stringify(options));

    this._bucket = options.bucket || db._bucket;
    this._reverse = !!options.reverse;
    this._keyAsBuffer = !!options.keyAsBuffer;
    this._valueAsBuffer = !!options.valueAsBuffer;

    var low, high;

    if (options.hasOwnProperty('lt') && options.lt !== null && options.lt !== '') {
        high = utils.decrement(options.lt);
    } else if (options.hasOwnProperty('lte') && options.lte !== null && options.lte !== '') {
        high = utils.roundDown(options.lte);
    }

    if (typeof high === 'undefined' || high === null || high === '') {
        high = utils.roundDown(this._reverse ? options.start : options.end);
    }

    if (typeof high === 'undefined' || high === null || high === '') {
        high = '~';
    }

    if (options.hasOwnProperty('gt') && options.gt !== null && options.gt !== '') {
        low = utils.increment(options.gt);
    } else if (options.hasOwnProperty('gte') && options.gte !== null && options.gte !== '') {
        low = utils.roundUp(options.gte);
    }

    if (typeof low === 'undefined' || low === null || low === '') {
        low = utils.roundUp(this._reverse ? options.end : options.start);
    }

    if (typeof low === 'undefined' || low === null || low === '') {
        low = '!';
    }

    var query = {
        bucket: this._bucket,
        qtype: 1,
        pagination_sort: true
    };

    if (options.index) {
        query.index = this._reverse ? '_reverse_' + options.index : options.index;
    } else {
        query.index = this._reverse ? '_reverse_key_bin' : '$key';
    }

    if (options.limit > 0) {
        query.max_results = options.limit;
    }

    var keyIsString = (/_bin$/.test(query.index) || query.index === '$key') ? true : false;

    if (this._reverse) {
        if (keyIsString) {
            while (low.length < high.length) {
                low += '!';
            }
        }

        query.range_min = keyIsString ? utils.reverseString(high) : -1 * high;
        query.range_max = keyIsString ? utils.reverseString(low) : -1 * low;
    } else {
        if (keyIsString) {
            while (high.length < low.length) {
                high += '~';
            }
        }

        query.range_max = high;
        query.range_min = low;
    }

    var keyTransform = new Transform({ objectMode: true });
    keyTransform._transform = function (chunk, encoding, next) {
        if (!chunk.keys) {
            return next();
        }

        for (var i = 0, l = chunk.keys.length; i < l; i++) {
            this.push(chunk.keys[i]);
        }
        next();
    };

    var self = this;

    this._results = new Transform({ objectMode: true });
    this._results._transform = function (chunk, encoding, next) {
        db._client.get({ bucket: self._bucket, key: chunk }, function (err, res) {
            if (err || !res.content) {
                return next();
            }

            this.push({ key: chunk, value: res.content[0].value });
            next();
        }.bind(this));
    };

    this._results.once('end', function () {
        this._endEmitted = true;
    }.bind(this));

    db._client.getIndex(query).pipe(keyTransform).pipe(this._results);
}

util.inherits(RiakIterator, AbstractIterator);

RiakIterator.prototype._next = function (callback) {
    var self = this;

    var onEnd = function () {
        self._results.removeListener('readable', onReadable);
        callback();
    };

    var onReadable = function () {
        self._results.removeListener('end', onEnd);
        self._next(callback);
    };

    var obj = this._results.read();

    if (self._endEmitted) {
        callback();
    } else if (obj === null) {
        this._results.once('readable', onReadable);
        this._results.once('end', onEnd);
    } else {
        callback(null, this._keyAsBuffer ? new Buffer(obj.key) : obj.key, this._valueAsBuffer ? obj.value : obj.value.toString());
    }
};

RiakIterator.prototype._end = function (callback) {
    callback();
};

module.exports = RiakIterator;
