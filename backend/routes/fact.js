const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const { keyword } = req.query;
    const request = pool.request();
    let query = 'SELECT * FROM fact';
    if (keyword) {
      query += ' WHERE fact_code LIKE @kw OR fact_name LIKE @kw';
      request.input('kw', sql.NVarChar, `%${keyword}%`);
    }
    query += ' ORDER BY fact_code';
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { fact_code, fact_name, remark } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('fact_code', sql.NVarChar, fact_code)
      .input('fact_name', sql.NVarChar, fact_name)
      .input('remark', sql.NVarChar, remark || '')
      .query('INSERT INTO fact (fact_code, fact_name, remark) VALUES (@fact_code, @fact_name, @remark)');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:code', async (req, res) => {
  const { fact_name, remark } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('fact_code', sql.NVarChar, req.params.code)
      .input('fact_name', sql.NVarChar, fact_name)
      .input('remark', sql.NVarChar, remark || '')
      .query('UPDATE fact SET fact_name = @fact_name, remark = @remark WHERE fact_code = @fact_code');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:code', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('fact_code', sql.NVarChar, req.params.code)
      .query('DELETE FROM fact WHERE fact_code = @fact_code');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
