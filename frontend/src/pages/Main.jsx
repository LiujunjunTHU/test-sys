import { useNavigate } from 'react-router-dom';

export default function Main() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menus = [
    { label: '客戶資料維護', path: '/cust' },
    { label: '廠商資料維護', path: '/fact' },
    { label: '商品資料維護', path: '/item' },
    { label: '用戶資料維護', path: '/user' },
  ];

  return (
    <div className="layout">
      <div className="topbar">
        <h1>資料維護系統</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.9rem' }}>{user.username}</span>
          <button onClick={logout}>登出</button>
        </div>
      </div>
      <div className="content">
        <div className="menu-grid">
          {menus.map(m => (
            <button key={m.path} className="menu-btn" onClick={() => navigate(m.path)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
