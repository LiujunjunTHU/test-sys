const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const { keyword } = req.query;
    const request = pool.request();
    let query = 'SELECT * FROM cust';
    if (keyword) {
      query += ' WHERE cust_code LIKE @kw OR cust_name LIKE @kw';
      request.input('kw', sql.NVarChar, `%${keyword}%`);
    }
    query += ' ORDER BY cust_code';
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { cust_code, cust_name, remark } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('cust_code', sql.NVarChar, cust_code)
      .input('cust_name', sql.NVarChar, cust_name)
      .input('remark', sql.NVarChar, remark || '')
      .query('INSERT INTO cust (cust_code, cust_name, remark) VALUES (@cust_code, @cust_name, @remark)');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:code', async (req, res) => {
  const { cust_name, remark } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('cust_code', sql.NVarChar, req.params.code)
      .input('cust_name', sql.NVarChar, cust_name)
      .input('remark', sql.NVarChar, remark || '')
      .query('UPDATE cust SET cust_name = @cust_name, remark = @remark WHERE cust_code = @cust_code');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:code', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('cust_code', sql.NVarChar, req.params.code)
      .query('DELETE FROM cust WHERE cust_code = @cust_code');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
