var levelup = require('levelup');
var db = levelup('riak://localhost:8087/somebucket', { db: require('./') });

db.put('name', 'Yuri Irsenovich Kim');
db.put('dob', '16 February 1941');
db.put('spouse', 'Kim Young-sook');
db.put('occupation', 'Clown');

db.readStream()
  .on('data', console.log)
  .on('close', function () { console.log('Show\'s over folks!'); db.close(); });
