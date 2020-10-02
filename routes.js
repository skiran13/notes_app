const express = require('express');
var md5 = require('md5');
const db = require('./db');
const crypto = require('crypto');
const router = express.Router();
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text) {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
  let encryptedText = Buffer.from(text, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

router.get('/', (req, res) => {
  res.send('Welcome to Notes app for Work India recruitment!');
});

router.get('/app/sites/list/', (req, res) => {
  const uid = req.query.user;
  db.query('SELECT * FROM notes WHERE userId=?', [uid], (err, rows, fields) => {
    if (err) res.json({ status: false, message: err });
    else {
      if (Object.keys(rows).length === 0) {
        res.json({
          status: 'No notes found!',
        });
      } else {
        res.json({
          notes: rows.map((doc, i) => decrypt(doc.note)),
        });
      }
    }
  });
});

router.post('/app/user', function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  db.query(
    'SELECT * from users where username=?',
    [username],
    (err, rows, fields) => {
      if (err) res.json({ status: false, message: err });
      else {
        if (Object.keys(rows).length !== 0) {
          res.json({
            status: 'Username already exists!',
          });
        } else {
          const value = {
            userid: Math.floor(Math.random() * 90000) + 10000,
            username: username,
            password: md5(password),
          };
          db.query('INSERT INTO users SET ?', value, (err, rows, fields) => {
            if (err) res.json({ status: err });
            else
              res.json({
                status: 'Account created',
              });
          });
        }
      }
    }
  );
});

router.post('/app/user/auth', function (req, res) {
  const username = req.body.username;
  const password = md5(req.body.password);
  db.query(
    'SELECT * from users where username=? AND password=?',
    [username, password],
    (err, rows, fields) => {
      if (err) res.json({ status: false, message: err });
      else {
        if (Object.keys(rows).length === 0) {
          res.json({
            status: 'User not found!',
          });
        } else {
          res.json({
            status: 'success',
            userid: rows[0].userId,
          });
        }
      }
    }
  );
});

router.post('/app/sites/', (req, res) => {
  const uid = req.query.user;
  const note = req.body.note;
  encrypted = encrypt(note);
  const value = {
    userId: uid,
    noteId: Math.floor(Math.random() * 90000) + 10000,
    note: encrypted.encryptedData,
  };
  db.query('INSERT INTO notes SET ?', value, (err, rows, fields) => {
    if (err) res.json({ status: err });
    else
      res.json({
        status: 'success',
      });
  });
});

module.exports = router;
