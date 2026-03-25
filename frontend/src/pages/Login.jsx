import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [userid, setUserid] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid, pwd }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.message || '登入失敗');
      }
    } catch {
      setError('無法連線至伺服器');
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h2>資料維護系統</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用戶代碼</label>
            <input
              value={userid}
              onChange={e => setUserid(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>密碼</label>
            <input
              type="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-login">登入</button>
        </form>
      </div>
    </div>
  );
}
