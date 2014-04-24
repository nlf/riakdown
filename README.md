# RiakDOWN

**A drop in replacement for [LevelDOWN](https://github.com/rvagg/node-leveldown) that works with Riak as its storage. Can be used as a back-end for [LevelUP](https://github.com/rvagg/node-levelup) rather than an actual LevelDB store.**

As of version 0.7, LevelUP allows you to pass a `'db'` option when you create a new instance. This will override the default LevelDOWN store with a LevelDOWN API compatible object. RiakDOWN conforms exactly to the LevelDOWN API but performs operations against a Riak database.

## Example

```js
var levelup = require('levelup');
var db = levelup('riak://localhost:8087/somebucket', { db: require('riakdown') });

db.put('name', 'Yuri Irsenovich Kim');
db.put('dob', '16 February 1941');
db.put('spouse', 'Kim Young-sook');
db.put('occupation', 'Clown');

db.readStream()
  .on('data', console.log)
  .on('close', function () { console.log('Show\'s over folks!'); db.close(); });
```

Running our example gives:

```
{ key: 'dob', value: '16 February 1941' }
{ key: 'name', value: 'Yuri Irsenovich Kim' }
{ key: 'occupation', value: 'Clown' }
{ key: 'spouse', value: 'Kim Young-sook' }
Show's over folks!
```

## Notes

Database actions are performed using the [riakpbc](https://github.com/nlf/riakpbc) library, so all actions are performed over protocol buffers.

RiakDOWN currently resolves siblings in a very naive manner, by simply using whichever sibling it recieves first as the authoritative answer. This is entirely possibly not what you want. Luckily, it's simple to override this behavior with something like the following:

```js
var levelup = require('levelup');
var riakdown = require('riakdown');
riakdown._siblingResolver = function (key, siblings, options, callback) {
  // the default resolver looks like this:
  callback(null, siblings[0].value);
};
var db = levelup('riak://localhost:8087/somebucket', { db: riakdown });
```

The parameters passed in to the `_siblingResolver` method are

- key: the key that contains siblings
- siblings: an array of siblings, each of which will have at least the following properties:
  - value: depending on content_type, this will be a string (text/*), an object (application/json) or a buffer
  - content_type: the content_type stored in riak
  - vtag: the riak-generated vtag for this sibling
  - last_mod: the timestamp of the last modification to this sibling
  - last_mod_usecs: the microseconds associated with the last modification
- options: the options object passed through from the get request (with the bucket property set)
- callback: the callback for when sibling resolution is complete, it has the signature `(err, resolved)`, where `resolved` is a string, buffer, or object representing the correct state of the sibling. this value will be persisted to the database and returned to the original `get` request's callback. if an error is passed to the callback, no resolution will be performed and the error will be passed through to the `get` request.

Additionally, since riak supports buckets you may pass one in your options object to override the default bucket set when instantiating the client, as in:

```js
var db = levelup('riak://localhost:8087/somebucket', { db: riakdown }); // default bucket is now 'somebucket'
db.get('test', { bucket: 'someotherbucket' }, function (err, value) { console.log(value); }); // will use bucket 'someotherbucket'
```

You may also explicitly pass a vclock option for `put` and `del` operations, though it is recommended you allow RiakDOWN to manage this for you.

## Licence

RiakDOWN is Copyright (c) 2014 Nathan LaFreniere [@quitlahok](https://twitter.com/quitlahok) and licensed under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.

