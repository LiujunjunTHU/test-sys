import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ItemPage() {
  const [records, setRecords] = useState([]);
  const [facts, setFacts] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchFacts = async () => {
    try {
      const res = await fetch('/api/fact');
      const data = await res.json();
      setFacts(Array.isArray(data) ? data : []);
    } catch {
      setFacts([]);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/item?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    }
  }, [keyword]);

  useEffect(() => {
    fetchData();
    fetchFacts();
  }, [fetchData]);

  const openAdd = () => {
    setFormData({ item_code: '', item_name: '', fact_code: '' });
    setError('');
    setModal('add');
  };

  const openEdit = (record) => {
    setFormData({ ...record });
    setError('');
    setModal('edit');
  };

  const handleDelete = async (key) => {
    if (!window.confirm('確定刪除？')) return;
    try {
      await fetch(`/api/item/${encodeURIComponent(key)}`, { method: 'DELETE' });
      fetchData();
    } catch {
      alert('刪除失敗');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const method = modal === 'add' ? 'POST' : 'PUT';
    const url = modal === 'add'
      ? '/api/item'
      : `/api/item/${encodeURIComponent(formData.item_code)}`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModal(null);
        fetchData();
      } else {
        const err = await res.json();
        setError(err.message || '操作失敗');
      }
    } catch {
      setError('無法連線至伺服器');
    }
  };

  return (
    <div className="layout">
      <div className="topbar">
        <h1>資料維護系統</h1>
        <button onClick={() => navigate('/')}>返回主選單</button>
      </div>
      <div className="content">
        <div className="page">
          <h2>商品資料維護</h2>
          <div className="toolbar">
            <input
              placeholder="搜尋..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchData()}
            />
            <button onClick={fetchData}>查詢</button>
            <button className="btn-add" onClick={openAdd}>新增</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>商品代碼</th>
                  <th>商品名稱</th>
                  <th>主供應商</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={4} className="empty">無資料</td></tr>
                ) : records.map(r => (
                  <tr key={r.item_code}>
                    <td>{r.item_code}</td>
                    <td>{r.item_name}</td>
                    <td>{r.fact_name || r.fact_code || '-'}</td>
                    <td>
                      <button onClick={() => openEdit(r)}>修改</button>
                      <button className="btn-del" onClick={() => handleDelete(r.item_code)}>刪除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{modal === 'add' ? '新增' : '修改'} 商品資料</h3>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>商品代碼</label>
                <input
                  value={formData.item_code || ''}
                  onChange={e => setFormData({ ...formData, item_code: e.target.value })}
                  disabled={modal === 'edit'}
                  required
                />
              </div>
              <div className="form-group">
                <label>商品名稱</label>
                <input
                  value={formData.item_name || ''}
                  onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>主供應商</label>
                <select
                  value={formData.fact_code || ''}
                  onChange={e => setFormData({ ...formData, fact_code: e.target.value })}
                >
                  <option value="">-- 請選擇 --</option>
                  {facts.map(f => (
                    <option key={f.fact_code} value={f.fact_code}>
                      {f.fact_code} - {f.fact_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setModal(null)}>取消</button>
                <button type="submit">儲存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
