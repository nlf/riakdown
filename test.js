var test = require('tape');
var testCommon = require('./testCommon');
var testBuffer = require('fs').readFileSync('./testdata.bin');
var RiakDOWN = require('./');

require('abstract-leveldown/abstract/leveldown-test').args(RiakDOWN, test, testCommon);

require('abstract-leveldown/abstract/open-test').args(RiakDOWN, test, testCommon);
require('abstract-leveldown/abstract/open-test').open(RiakDOWN, test, testCommon);

require('abstract-leveldown/abstract/put-test').all(RiakDOWN, test, testCommon);

require('abstract-leveldown/abstract/del-test').all(RiakDOWN, test, testCommon);

require('abstract-leveldown/abstract/get-test').all(RiakDOWN, test, testCommon);

require('abstract-leveldown/abstract/put-get-del-test').all(RiakDOWN, test, testCommon, testBuffer, process.browser && Uint8Array);

require('abstract-leveldown/abstract/batch-test').all(RiakDOWN, test, testCommon);
require('abstract-leveldown/abstract/chained-batch-test').all(RiakDOWN, test, testCommon);

require('abstract-leveldown/abstract/close-test').close(RiakDOWN, test, testCommon);

require('abstract-leveldown/abstract/ranges-test').all(RiakDOWN, test, testCommon);
