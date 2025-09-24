import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminLogin() {
  const { adminLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(''); // For error messages

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await adminLogin(email, password);
      if (user.role === 'admin') navigate('/dashboard/admin');
    } catch (err) {
      console.error(err);
      // Show backend message or default error
      setMsg(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="page-container">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
        <img src="/OEMS.png" alt="logo" style={{ width:48, height:48, borderRadius:'50%' }}/>
        <h1>Admin Login</h1>
      </div>

      <form onSubmit={submit}>
        <input 
          type="email" 
          placeholder="Admin Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Login as Admin</button>
      </form>

      {msg && <p style={{ marginTop: 12, color: 'red' }}>{msg}</p>}
    </div>
  );
}
