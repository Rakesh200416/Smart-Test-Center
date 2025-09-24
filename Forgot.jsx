import api from '../utils/api';
import { useState } from 'react';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/forgot', { email });
      setMsg(data.message);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="page-container">
      <h2>Forgot Password</h2>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
