const { getPool } = require('./config/db');

async function initDB() {
  const pool = await getPool();

  // 先刪除舊表（順序需考慮外鍵）
  await pool.request().query(`IF OBJECT_ID('item','U') IS NOT NULL DROP TABLE item`);
  await pool.request().query(`IF OBJECT_ID('cust','U') IS NOT NULL DROP TABLE cust`);
  await pool.request().query(`IF OBJECT_ID('fact','U') IS NOT NULL DROP TABLE fact`);
  await pool.request().query(`IF OBJECT_ID('[user]','U') IS NOT NULL DROP TABLE [user]`);
  console.log('舊表清除完成');

  await pool.request().query(`
    CREATE TABLE cust (
      cust_code NVARCHAR(20) PRIMARY KEY,
      cust_name NVARCHAR(100) NOT NULL,
      remark    NVARCHAR(255) NULL
    )
  `);
  console.log('cust OK');

  await pool.request().query(`
    CREATE TABLE fact (
      fact_code NVARCHAR(20) PRIMARY KEY,
      fact_name NVARCHAR(100) NOT NULL,
      remark    NVARCHAR(255) NULL
    )
  `);
  console.log('fact OK');

  await pool.request().query(`
    CREATE TABLE item (
      item_code NVARCHAR(20) PRIMARY KEY,
      item_name NVARCHAR(100) NOT NULL,
      fact_code NVARCHAR(20) NULL REFERENCES fact(fact_code)
    )
  `);
  console.log('item OK');

  await pool.request().query(`
    CREATE TABLE [user] (
      userid   NVARCHAR(20) PRIMARY KEY,
      username NVARCHAR(100) NOT NULL,
      pwd      NVARCHAR(100) NOT NULL
    )
  `);
  console.log('user OK');

  // 建立預設管理員帳號
  await pool.request().query(`
    INSERT INTO [user] (userid, username, pwd) VALUES (N'admin', N'管理員', N'admin123')
  `);
  console.log('預設帳號建立完成');

  console.log('資料庫初始化完成');
  process.exit(0);
}

initDB().catch(err => { console.error(err.message); process.exit(1); });
