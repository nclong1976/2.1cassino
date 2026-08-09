import React from 'react';
import { useUser } from './UserProvider';

export default function HomePage() {
  const { user, setUser } = useUser();

  React.useEffect(() => {
    if (!user) {
      // try fetch /api/me to restore session (cookie-based)
      fetch('/api/me', { credentials: 'include' })
        .then(r => {
          if (!r.ok) throw new Error('no session');
          return r.json();
        })
        .then(data => setUser(data.user))
        .catch(() => {
          // not authenticated, leave as guest
        });
    }
  }, [user, setUser]);

  if (!user) {
    return (
      <div>
        <h1>Xin chào khách</h1>
        <p><a href="/login">Đăng nhập</a> hoặc <a href="/register">Đăng ký</a></p>
      </div>
    );
  }

  return (
    <div>
      <h1>Chào mừng, {user.name || user.email}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
