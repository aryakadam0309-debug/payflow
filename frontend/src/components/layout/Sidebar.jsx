import { NavLink } from 'react-router-dom';
import { Wallet, LayoutDashboard, Send, History, User, ShieldAlert } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Send Money', path: '/send', icon: Send },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
    // Admin link - in a real app, you'd conditionally render this based on user role
    { name: 'Fraud Alerts (Admin)', path: '/admin/fraud', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 min-h-screen flex flex-col hidden md:flex">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="p-2 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">PayFlow</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600/20 text-blue-400 font-semibold' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}