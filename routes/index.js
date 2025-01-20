var express = require('express');
const multer = require("multer");
var router = express.Router();
const upload = multer({ dest: "public/uploads/" });

router.post('/delete', upload.none(), async function (req, res, next) {
  const user = await req.login.loggedInUser(req);
  if (!user) {
    // <--
    res.redirect("/"); // <--
    return; // <--
  }
  try {
    const conn2 = await req.meinprojekt_pool;

    await conn2.query('delete from posts where user_id = $1 and id = $2', [user[0].id, req.body.id]);
    res.redirect('/dashboard');
  } catch (err) {
    console.error("Fehler bei der Datenbankabfrage:", err);
    return next(err); // Leite den Fehler an den Error-Handler weiter
  }
});

router.post('/', upload.single('bild'), async function (req, res, next) {
  const user = await req.login.loggedInUser(req);
  if (!user) {
    // <--
    res.redirect("/"); // <--
    return; // <--
  }
  try {
    const conn2 = await req.meinprojekt_pool;
    if(req.body.id){
      if(req.file) {
        await conn2.query('UPDATE posts set titel = $1, inhalt = $2, bild = $3 where id = $4 and user_id = $5',
            [req.body.titel, req.body.inhalt, req.file.filename, req.body.id, user[0].id]);
      }else{
        await conn2.query('UPDATE posts set titel = $1, inhalt = $2 where id = $3 and user_id = $4',
            [req.body.titel, req.body.inhalt, req.body.id, user[0].id]);
      }
    }else {
      await conn2.query('INSERT INTO posts (user_id, titel, inhalt, bild) VALUES ($1, $2, $3, $4)', [user[0].id, req.body.titel, req.body.inhalt, req.file.filename]);
    }
    res.redirect('/dashboard');
  } catch (err) {
    console.error("Fehler bei der Datenbankabfrage:", err);
    return next(err); // Leite den Fehler an den Error-Handler weiter
  }
});

router.get('/:id', async function(req, res, next) {

  let posts = [];
  const user = await req.login.loggedInUser(req);
  if (!user) {
    // <--
    res.redirect("/"); // <--
    return; // <--
  }
  try {
    const conn2 = await req.meinprojekt_pool;

    //posts = await conn2.query("SELECT * FROM posts where user_id = $1", [user[0].id]);
    post_edit = await conn2.query("SELECT *, user_id = $1 as is_mine FROM posts where id = $2", [user[0].id, req.params.id]);
    posts = await conn2.query("SELECT *, user_id = $1 as is_mine FROM posts", [user[0].id]);

  } catch (err) {
    console.error("Fehler bei der Datenbankabfrage:", err);
    return next(err); // Leite den Fehler an den Error-Handler weiter
  }

  res.render('index',
      {
        post_edit: post_edit.rows[0],
        posts: posts.rows
      });
});

router.get('/', async function(req, res, next) {

  let posts = [];
  const user = await req.login.loggedInUser(req);
  if (!user) {
    // <--
    res.redirect("/"); // <--
    return; // <--
  }
  try {
    const conn2 = await req.meinprojekt_pool;

    //posts = await conn2.query("SELECT * FROM posts where user_id = $1", [user[0].id]);
    if(req.query.search){
      posts = await conn2.query(
          "SELECT *, user_id = $1 as is_mine FROM posts WHERE titel ILIKE $2 OR inhalt ILIKE $2",
          [user[0].id, `%${req.query.search}%`]
      );
    }else {
      posts = await conn2.query("SELECT *, user_id = $1 as is_mine FROM posts", [user[0].id]);
    }

  } catch (err) {
    console.error("Fehler bei der Datenbankabfrage:", err);
    return next(err); // Leite den Fehler an den Error-Handler weiter
  }

  res.render('index',
      {
        posts: posts.rows
      });
});

module.exports = router;

/* Filter */


