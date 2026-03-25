const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const { keyword } = req.query;
    const request = pool.request();
    let query = `
      SELECT i.item_code, i.item_name, i.fact_code, f.fact_name
      FROM item i
      LEFT JOIN fact f ON i.fact_code = f.fact_code
    `;
    if (keyword) {
      query += ' WHERE i.item_code LIKE @kw OR i.item_name LIKE @kw';
      request.input('kw', sql.NVarChar, `%${keyword}%`);
    }
    query += ' ORDER BY i.item_code';
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { item_code, item_name, fact_code } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('item_code', sql.NVarChar, item_code)
      .input('item_name', sql.NVarChar, item_name)
      .input('fact_code', sql.NVarChar, fact_code || null)
      .query('INSERT INTO item (item_code, item_name, fact_code) VALUES (@item_code, @item_name, @fact_code)');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:code', async (req, res) => {
  const { item_name, fact_code } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('item_code', sql.NVarChar, req.params.code)
      .input('item_name', sql.NVarChar, item_name)
      .input('fact_code', sql.NVarChar, fact_code || null)
      .query('UPDATE item SET item_name = @item_name, fact_code = @fact_code WHERE item_code = @item_code');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:code', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('item_code', sql.NVarChar, req.params.code)
      .query('DELETE FROM item WHERE item_code = @item_code');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
