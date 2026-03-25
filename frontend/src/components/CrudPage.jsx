import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CrudPage({ title, apiPath, fields, keyField }) {
  const [records, setRecords] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${apiPath}?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    }
  }, [apiPath, keyword]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    const init = {};
    fields.forEach(f => { init[f.name] = ''; });
    setFormData(init);
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
      await fetch(`${apiPath}/${encodeURIComponent(key)}`, { method: 'DELETE' });
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
      ? apiPath
      : `${apiPath}/${encodeURIComponent(formData[keyField])}`;
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
          <h2>{title}</h2>
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
                  {fields.map(f => <th key={f.name}>{f.label}</th>)}
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={fields.length + 1} className="empty">無資料</td></tr>
                ) : records.map(r => (
                  <tr key={r[keyField]}>
                    {fields.map(f => <td key={f.name}>{r[f.name]}</td>)}
                    <td>
                      <button onClick={() => openEdit(r)}>修改</button>
                      <button className="btn-del" onClick={() => handleDelete(r[keyField])}>刪除</button>
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
            <h3>{modal === 'add' ? '新增' : '修改'} {title}</h3>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
              {fields.map(f => (
                <div className="form-group" key={f.name}>
                  <label>{f.label}</label>
                  <input
                    value={formData[f.name] || ''}
                    onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                    disabled={modal === 'edit' && f.name === keyField}
                    required={f.required !== false}
                    type={f.type || 'text'}
                  />
                </div>
              ))}
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
