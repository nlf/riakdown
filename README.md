# RiakDOWN

**A drop in replacement for [LevelDOWN](https://github.com/rvagg/node-leveldown) that works with Riak as its storage. Can be used as a back-end for [LevelUP](https://github.com/rvagg/node-levelup) rather than an actual LevelDB store.**

As of version 0.7, LevelUP allows you to pass a `'db'` option when you create a new instance. This will override the default LevelDOWN store with a LevelDOWN API compatible object. RiakDOWN conforms exactly to the LevelDOWN API but performs operations against a Riak database.

## Example

```js
var levelup = require('levelup')
  , db = levelup('riak://localhost:8087/somebucket', { db: require('riakdown') })

db.put('name', 'Yuri Irsenovich Kim')
db.put('dob', '16 February 1941')
db.put('spouse', 'Kim Young-sook')
db.put('occupation', 'Clown')

db.readStream()
  .on('data', console.log)
  .on('close', function () { console.log('Show\'s over folks!') })
```

Running our example gives:

```
{ key: 'dob', value: '16 February 1941' }
{ key: 'name', value: 'Yuri Irsenovich Kim' }
{ key: 'occupation', value: 'Clown' }
{ key: 'spouse', value: 'Kim Young-sook' }
Show's over folks!
```

## Caveats

RiakDOWN currently does *not* resolve siblings. This means that I would recommend setting allow_mult to false and last_write_wins to true in your Riak configuration, otherwise you may get unexpected results.

## Licence

RiakDOWN is Copyright (c) 2014 Nathan LaFreniere [@quitlahok](https://twitter.com/quitlahok) and licensed under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.

