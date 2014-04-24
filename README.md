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
  // key: the key that was requested when siblings were found
  // siblings: an array of siblings, each of which have at least the following properties:
  //   value: depending on your content_type this will be a string (text/*), an object (application/json), or a buffer (everything else)
  //   content_type: the content_type
  //   vtag: the riak-generated vtag for this sibling
  //   last_mod: the timestamp of the last modification to this sibling
  //   last_mod_usecs: microseconds associated with the last modification to the sibling
  // options: the options object as passed to the original get request
  // callback: the method to call once you've completed resolution, with the signature (err, resolved)
  // where err is any error that may have occurred and will be passed on to the user, and resolved
  // is the string, buffer, or object representing your resolved sibling. this data will be automatically
  // saved to riak, resolving the siblings, and then returned to your original get callback.
  //
  // the default resolver looks like this:
  callback(null, siblings[0].value);
};
var db = levelup('riak://localhost:8087/somebucket', { db: riakdown });
```

Additionally, since riak supports buckets you may pass one in your options object to override the default bucket set when instantiating the client, as in:

```js
var db = levelup('riak://localhost:8087/somebucket', { db: riakdown }); // default bucket is now 'somebucket'
db.get('test', { bucket: 'someotherbucket' }, function (err, value) { console.log(value); }); // will use bucket 'someotherbucket'
```

You may also explicitly pass a vclock option for `put` and `del` operations, though it is recommended you allow RiakDOWN to manage this for you.

## Licence

RiakDOWN is Copyright (c) 2014 Nathan LaFreniere [@quitlahok](https://twitter.com/quitlahok) and licensed under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.

