import { BarChart2, Users, Send, CreditCard, Settings, HelpCircle } from 'lucide-react';
import '../styles/Sidebar.css';

function Sidebar({ activeNav, setActiveNav }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <img src="/placeholder.svg?height=40&width=120" alt="Finbuddy" />
      </div>
      <nav className="nav-menu">
        <ul>
          <li className={activeNav === 'dashboard' ? 'active' : ''} onClick={() => setActiveNav('dashboard')}>
            <BarChart2 size={20} />
            <span>대시보드</span>
          </li>
          <li className={activeNav === 'transactions' ? 'active' : ''} onClick={() => setActiveNav('transactions')}>
            <Users size={20} />
            <span>거래내역</span>
          </li>
          <li className={activeNav === 'transfer' ? 'active' : ''} onClick={() => setActiveNav('transfer')}>
            <Send size={20} />
            <span>이체하기</span>
          </li>
          <li className={activeNav === 'products' ? 'active' : ''} onClick={() => setActiveNav('products')}>
            <CreditCard size={20} />
            <span>금융상품</span>
          </li>
          <li className={activeNav === 'settings' ? 'active' : ''} onClick={() => setActiveNav('settings')}>
            <Settings size={20} />
            <span>설정</span>
          </li>
          <li className={activeNav === 'support' ? 'active' : ''} onClick={() => setActiveNav('support')}>
            <HelpCircle size={20} />
            <span>문의하기</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;