import { LogOut, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="md:hidden flex items-center gap-2">
        <h1 className="text-xl font-bold text-white">PayFlow</h1>
      </div>
      
      {/* Desktop Title placeholder */}
      <div className="hidden md:block text-gray-400">
        Welcome back to your dashboard
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10"
        >
          <LogOut className="w-4 h-4" /> 
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}