import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserProvider';

export default function LoginForm() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(()=>({ message: 'Login failed' }));
        alert(err.message || 'Login failed');
        setLoading(false);
        return;
      }
      const data = await resp.json();
      setUser(data.user);
      navigate('/');
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Đang...' : 'Đăng nhập'}</button>
    </form>
  );
}
