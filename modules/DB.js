const sql = require('sqlite3');

const db = new sql.Database(process.cwd() + "/database.db")

module.exports = db
