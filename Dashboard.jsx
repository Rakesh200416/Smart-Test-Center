import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        navigate('/dashboard/student');
      } else if (user.role === 'mentor') {
        navigate('/dashboard/mentor');
      } else if (user.role === 'admin') {
        navigate('/dashboard/admin');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Redirecting to dashboard...</div>
    </div>
  );
}