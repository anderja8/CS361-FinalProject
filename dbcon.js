var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs361_seehafem',
  password        : 'group9it9md',
  database        : 'cs361_seehafem',
  dateStrings     : 'date'
});

module.exports.pool = pool;
