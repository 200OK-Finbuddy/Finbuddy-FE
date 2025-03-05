import { BarChart2, Users, Send, CreditCard, Settings, HelpCircle, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../styles/Sidebar.css';

function Sidebar({ activeNav, setActiveNav }) {
  const navigate = useNavigate();

  const handleNavigation = (path, navType) => {
    setActiveNav(navType);
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        {/* <img src="src/image/logo.jpg" alt="Finbuddy" onClick={() => handleNavigation('/', 'dashboard')} style={{ cursor: 'pointer', height: "40px"}} /> */}
        <Cloud size={20} />
        <span>  Finbuddy</span>
        {/* <img
          src="/src/image/logo.jpg"
          alt="Finbuddy"
          onClick={() => handleNavigation("/", "dashboard")}
          style={{ cursor: "pointer", height: "40px" }}
        /> */}
      </div>
      <nav className="nav-menu">
        <ul>
          <li 
            className={activeNav === 'dashboard' ? 'active' : ''} 
            onClick={() => handleNavigation('/', 'dashboard')}
          >
            <BarChart2 size={20} />
            <span>대시보드</span>
          </li>
          <li 
            className={activeNav === 'transactions' ? 'active' : ''} 
            onClick={() => handleNavigation('/transactions', 'transactions')}
          >
            <Users size={20} />
            <span>거래내역</span>
          </li>
          <li 
            className={activeNav === 'transfer' ? 'active' : ''} 
            onClick={() => handleNavigation('/transfer', 'transfer')}
          >
            <Send size={20} />
            <span>이체하기</span>
          </li>
          <li 
            className={activeNav === 'products' ? 'active' : ''} 
            onClick={() => handleNavigation('/products', 'products')}
          >
            <CreditCard size={20} />
            <span>금융상품</span>
          </li>
          <li 
            className={activeNav === 'settings' ? 'active' : ''} 
            onClick={() => handleNavigation('/settings', 'settings')}
          >
            <Settings size={20} />
            <span>설정</span>
          </li>
          <li 
            className={activeNav === 'support' ? 'active' : ''} 
            onClick={() => handleNavigation('/support', 'support')}
          >
            <HelpCircle size={20} />
            <span>문의하기</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

Sidebar.propTypes = {
  activeNav: PropTypes.string.isRequired,
  setActiveNav: PropTypes.func.isRequired
};

export default Sidebar;