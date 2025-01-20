var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let users = [];
  const conn = await req.pool.getConnection(); // Verwende den Pool aus der Anfrage

  try {
    const conn = await req.pool.getConnection(); // Verwende den Pool aus der Anfrage
    users = await conn.query("SELECT * FROM users");
    conn.release(); // Gib die Verbindung zurück in den Pool
  } catch (err) {
    console.error("Fehler bei der Datenbankabfrage:", err);
    return next(err); // Leite den Fehler an den Error-Handler weiter
  }

  res.render('users',
      { title: 'Users',
        users: users,
      });
});

module.exports = router;
