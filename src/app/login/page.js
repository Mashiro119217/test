'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username === '' || password === '') {
      setError('Please enter username and password');
      return;
    }
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      login({ username: data.username, score: data.score });
      router.push('/');
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 160px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F5F0E4',
      marginTop: 120,
      marginBottom: 140,
      border: '3px solid #C5AC6B',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      position: 'relative',
    }}>
      <img src="/Vector.svg" alt="Login Icon" style={{ width: 70, height: 70, marginBottom: 5, marginTop: 30 }} />
      <h1 style={{ color: '#505166', fontSize: 32, fontWeight: 700 }}>Login</h1>
      <form onSubmit={handleLogin} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
        width: 320,
      }}>
        <style>{`
          .login-input {
            width: 100%;
            padding: 6px 16px;
            margin-bottom: 15px;
            color: #505166;
            border: 2px solid rgba(197, 172, 107, 0.5);
            border-radius: 50px;
            font-size: 16px;
            background: #FBFAFA;
            outline: none;
            transition: border-color 0.2s;
          }
          .login-input:focus {
            border: 2px solid #C5AC6B;
          }
          .login-input::placeholder {
            color:rgb(227, 227, 227);
            opacity: 1;
            font-weight: 500;
          }
        `}</style>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="login-input"
        />
        {error && <div style={{ color: '#E36B5B', marginBottom: 16 }}>{error}</div>}
        <button
          type="submit"
          style={{
            padding: '6px 25px',
            marginTop: 5,
            marginBottom: 10,
            background: '#C5AC6B',
            color: '#fff',
            fontSize: 18,
            fontWeight: 700,
            border: 'none',
            borderRadius: 20,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          Log In
        </button>
      </form>
    </div>
  );
}
