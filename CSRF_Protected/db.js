var mysql = require('mysql');

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

function executeRead(sql, callback){
  var result = con.query(sql, function (err, res) {
      if (err){
        if (err.code === 'ER_DUP_ENTRY') {
          console.log('Entry already exists! UNIQUE_KEY');
        } else {
          throw err;
        }
      }

      callback(res); //Call Given function with result
  });
}

con.connect(function(err) {
  if (err) throw err;
  console.log('Connected!');
});

con.query('USE csrf;', function (err, result) {
    if (err) throw err;
    console.log('Using database');
});

module.exports = {
  con: con,
  executeRead: executeRead
};
