import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginWithGoogle, loginWithFacebook } from '../firebase';
import '../styles.css';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(''); // for success/error messages

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);

      // Optional: show welcome message
      setMsg(`Welcome, ${user.name || 'User'}!`);

      if (user.role === 'student') navigate('/dashboard/student');
      else if (user.role === 'mentor') navigate('/dashboard/mentor');
      else if (user.role === 'admin') navigate('/dashboard/admin');
    } catch (err) {
      console.error(err);
      // Display backend error message if available
      setMsg(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogle = async () => {
    try {
      const result = await loginWithGoogle();
      console.log("Google user:", result.user);
      alert(`Logged in as ${result.user.displayName}`);
      // OPTIONAL: send result.user.accessToken to backend for JWT
    } catch (err) {
      console.error(err);
      setMsg('Google login failed. Please try again.');
    }
  };

  const handleFacebook = async () => {
    try {
      const result = await loginWithFacebook();
      console.log("Facebook user:", result.user);
      alert(`Logged in as ${result.user.displayName}`);
      // OPTIONAL: send result.user.accessToken to backend for JWT
    } catch (err) {
      console.error(err);
      setMsg('Facebook login failed. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
        <img src="/OEMS.png" alt="logo" style={{ width:48, height:48, borderRadius:'50%' }}/>
        <h1>SMART TEST CENTER — Login</h1>
      </div>

      <div style={{ textAlign:'right', marginBottom:12 }}>
        <Link to="/admin-login">Admin Login</Link>
      </div>

      <form onSubmit={submit}>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit">Login</button>

        <div style={{ marginTop:12, textAlign:'center' }}>
          <button type="button" style={{ width:'49%', marginRight:'2%' }} onClick={handleGoogle}>Login with Google</button>
          <button type="button" style={{ width:'49%' }} onClick={handleFacebook}>Login with Facebook</button>
        </div>

        <div style={{ marginTop:12, display:'flex', justifyContent:'space-between' }}>
          <Link to="/forgot">Forgot password?</Link>
          <Link to="/signup">Don’t have an account? Sign up</Link>
        </div>
      </form>

      {/* Display success or error messages */}
      {msg && <p style={{ marginTop:12, color:'red' }}>{msg}</p>}
    </div>
  );
}
