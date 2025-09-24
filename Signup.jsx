import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
import '../styles.css';

// ✅ Firebase config (paste from your Firebase project settings)
const firebaseConfig = {
  apiKey: "AIzaSyBwWoghZL1e6IqPdgN9dzoN6ay3Rlhp-fU",
  authDomain: "smarttestcenter1.firebaseapp.com",
  projectId: "smarttestcenter1",
  storageBucket: "smarttestcenter1.firebasestorage.app",
  messagingSenderId: "889898890300",
  appId: "1:889898890300:web:51abde90aea1565bebbf39"
};

// initialize Firebase only once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [role, setRole] = useState('student'); // student | mentor
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    contactNumber: '', educationLevel: 'school', institutionName: '',
    phoneNumber: '', currentInstitution: '', experience: ''
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return alert('Passwords do not match');

    const payload = { role, name: form.name, email: form.email, password: form.password };

    if (role === 'student') {
      payload.contactNumber = form.contactNumber;
      payload.educationLevel = form.educationLevel;
      payload.institutionName = form.institutionName;
    } else {
      payload.phoneNumber = form.phoneNumber;
      payload.currentInstitution = form.currentInstitution;
      payload.experience = form.experience;
    }

    const user = await signup(payload);
    if (user.role === 'student') navigate('/dashboard/student');
    else if (user.role === 'mentor') navigate('/dashboard/mentor');
  };

  // 🔹 Google Signup
  const signUpWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // You can send this Google user info to your backend if you want
      console.log("Google user:", user);

      navigate('/dashboard/student'); // or detect role if you save it in backend
    } catch (err) {
      console.error("Google signup error", err);
      alert("Google signup failed");
    }
  };

  // 🔹 Facebook Signup
  const signUpWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Facebook user:", user);

      navigate('/dashboard/student'); // same as above
    } catch (err) {
      console.error("Facebook signup error", err);
      alert("Facebook signup failed");
    }
  };

  return (
    <div className="page-container">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
        <img src="/OEMS.png" alt="logo" style={{ width:48, height:48, borderRadius:'50%' }}/>
        <h1>SMART TEST CENTER — Sign Up</h1>
      </div>

      <form onSubmit={submit}>
        <label>Role</label>
        <select name="role" value={role} onChange={(e)=>setRole(e.target.value)} style={{ marginBottom:12, width:'100%', padding:10 }}>
          <option value="student">Student</option>
          <option value="mentor">Mentor</option>
        </select>

        <input name="name" placeholder="Full Name" value={form.name} onChange={onChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />

        {role === 'student' ? (
          <>
            <input name="contactNumber" placeholder="Contact Number" value={form.contactNumber} onChange={onChange} />
            <label>Current Education</label>
            <select name="educationLevel" value={form.educationLevel} onChange={onChange} style={{ marginBottom:12, width:'100%', padding:10 }}>
              <option value="school">School</option>
              <option value="high_school">High School</option>
              <option value="college">College</option>
            </select>
            <input name="institutionName" placeholder="Institution Name" value={form.institutionName} onChange={onChange} />
          </>
        ) : (
          <>
            <input name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={onChange} />
            <input name="currentInstitution" placeholder="Current Institution Name" value={form.currentInstitution} onChange={onChange} />
            <input name="experience" placeholder="Experience (e.g., 3 years in Math)" value={form.experience} onChange={onChange} />
          </>
        )}

        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={onChange} required />

        <button type="submit">Create Account</button>

        <div style={{ marginTop:12, textAlign:'center' }}>
          <button type="button" onClick={signUpWithGoogle} style={{ width:'49%', marginRight:'2%' }}>Sign up with Google</button>
          <button type="button" onClick={signUpWithFacebook} style={{ width:'49%' }}>Sign up with Facebook</button>
        </div>

        <div style={{ marginTop:12, textAlign:'center' }}>
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
}
