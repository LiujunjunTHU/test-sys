const { getPool, sql } = require('./config/db');

async function seed() {
  const pool = await getPool();

  // 清除舊資料（順序考慮外鍵）
  await pool.request().query('DELETE FROM item');
  await pool.request().query('DELETE FROM cust');
  await pool.request().query('DELETE FROM fact');
  await pool.request().query('DELETE FROM [user]');
  console.log('舊資料清除完成');

  // ── USER 50筆 ──
  for (let i = 1; i <= 50; i++) {
    const no = String(i).padStart(3, '0');
    await pool.request()
      .input('userid',   sql.NVarChar, `user${no}`)
      .input('username', sql.NVarChar, `用戶${no}`)
      .input('pwd',      sql.NVarChar, `pwd${no}`)
      .query('INSERT INTO [user] (userid, username, pwd) VALUES (@userid, @username, @pwd)');
  }
  // 保留管理員帳號
  await pool.request()
    .input('userid',   sql.NVarChar, 'admin')
    .input('username', sql.NVarChar, '管理員')
    .input('pwd',      sql.NVarChar, 'admin123')
    .query('INSERT INTO [user] (userid, username, pwd) VALUES (@userid, @username, @pwd)');
  console.log('user 50筆完成');

  // ── CUST 50筆 ──
  const custNames = [
    '台灣科技','鴻海精密','台積電','聯發科','廣達電腦',
    '仁寶電腦','緯創資通','英業達','和碩聯合','大立光電',
    '瑞昱半導體','聯詠科技','群聯電子','矽統科技','威盛電子',
    '欣興電子','景碩科技','南亞電路板','燿華電子','台光電子',
    '南亞科技','華邦電子','旺宏電子','力晶科技','茂德科技',
    '友達光電','群創光電','彩晶科技','瀚宇彩晶','奇美電子',
    '台達電子','光寶科技','台達電','士林電機','東元電機',
    '中興電工','大同公司','聲寶企業','歌林公司','三洋電機',
    '統一企業','味全食品','卜蜂企業','大成長城','黑松公司',
    '泰山企業','愛之味公司','維力食品','福壽實業','桂格食品',
  ];
  for (let i = 1; i <= 50; i++) {
    const no = String(i).padStart(3, '0');
    await pool.request()
      .input('cust_code', sql.NVarChar, `C${no}`)
      .input('cust_name', sql.NVarChar, custNames[i - 1])
      .input('remark',    sql.NVarChar, `客戶${no}備註說明`)
      .query('INSERT INTO cust (cust_code, cust_name, remark) VALUES (@cust_code, @cust_name, @remark)');
  }
  console.log('cust 50筆完成');

  // ── FACT 50筆 ──
  const factNames = [
    '鴻準精密','正崴精密','可成科技','嘉澤端子','一詮精密',
    '春源鋼鐵','豐興鋼鐵','新光鋼鐵','東和鋼鐵','燁輝企業',
    '台塑石化','南亞塑膠','台化公司','亞聚企業','台苯公司',
    '中纖公司','遠東新世紀','宏遠興業','力麗企業','聚陽實業',
    '儒鴻企業','南緯實業','廣越公司','得力集團','偉全公司',
    '永豐餘紙','正隆公司','榮成紙業','太陽紙業','中華紙漿',
    '中化合成','台灣神隆','東洋製藥','生達化學','健亞生技',
    '台灣浩鼎','美時製藥','濟生化學','南光化學','永信藥品',
    '中磊電子','智邦科技','明泰科技','正文科技','友訊科技',
    '居易科技','合勤科技','建漢科技','啟碁科技','明基電通',
  ];
  for (let i = 1; i <= 50; i++) {
    const no = String(i).padStart(3, '0');
    await pool.request()
      .input('fact_code', sql.NVarChar, `F${no}`)
      .input('fact_name', sql.NVarChar, factNames[i - 1])
      .input('remark',    sql.NVarChar, `廠商${no}備註說明`)
      .query('INSERT INTO fact (fact_code, fact_name, remark) VALUES (@fact_code, @fact_name, @remark)');
  }
  console.log('fact 50筆完成');

  // ── ITEM 50筆 ──
  const itemNames = [
    '筆記型電腦','桌上型電腦','平板電腦','智慧型手機','智慧手錶',
    '無線耳機','藍牙喇叭','電競滑鼠','機械鍵盤','曲面螢幕',
    'USB集線器','無線充電板','行動電源','固態硬碟','記憶體模組',
    '顯示卡','處理器','主機板','電源供應器','機殼散熱器',
    '網路攝影機','麥克風','視訊會議組','列印機','掃描機',
    '投影機','電子白板','智慧電視','機上盒','網路路由器',
    '網路交換器','防火牆設備','伺服器','NAS儲存器','UPS不斷電',
    '印表機耗材','碳粉匣','感光鼓','標籤機','條碼掃描器',
    'RFID讀卡機','門禁系統','監控攝影機','網路線','光纖模組',
    '電池組','充電器','變壓器','散熱膏','防靜電手環',
  ];
  for (let i = 1; i <= 50; i++) {
    const no = String(i).padStart(3, '0');
    // 循環分配廠商 F001~F050
    const factNo = String(((i - 1) % 50) + 1).padStart(3, '0');
    await pool.request()
      .input('item_code', sql.NVarChar, `P${no}`)
      .input('item_name', sql.NVarChar, itemNames[i - 1])
      .input('fact_code', sql.NVarChar, `F${factNo}`)
      .query('INSERT INTO item (item_code, item_name, fact_code) VALUES (@item_code, @item_name, @fact_code)');
  }
  console.log('item 50筆完成');

  console.log('\n所有測試資料建立完成！');
  process.exit(0);
}

seed().catch(err => { console.error(err.message); process.exit(1); });
