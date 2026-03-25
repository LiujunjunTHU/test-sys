const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const { keyword } = req.query;
    const request = pool.request();
    let query = 'SELECT userid, username, pwd FROM [user]';
    if (keyword) {
      query += ' WHERE userid LIKE @kw OR username LIKE @kw';
      request.input('kw', sql.NVarChar, `%${keyword}%`);
    }
    query += ' ORDER BY userid';
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { userid, username, pwd } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('userid', sql.NVarChar, userid)
      .input('username', sql.NVarChar, username)
      .input('pwd', sql.NVarChar, pwd)
      .query('INSERT INTO [user] (userid, username, pwd) VALUES (@userid, @username, @pwd)');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { username, pwd } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('userid', sql.NVarChar, req.params.id)
      .input('username', sql.NVarChar, username)
      .input('pwd', sql.NVarChar, pwd)
      .query('UPDATE [user] SET username = @username, pwd = @pwd WHERE userid = @userid');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('userid', sql.NVarChar, req.params.id)
      .query('DELETE FROM [user] WHERE userid = @userid');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
