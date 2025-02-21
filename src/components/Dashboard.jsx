import '../styles/Dashboard.css';
import AccountSection from './AccountSection';
import TransactionSection from './TransactionSection';
import AnalysisSection from './AnalysisSection';
import RecommendedProducts from './RecommendedProducts';

function Dashboard() {
  return (
    <main className="main-content">
      <header className="welcome-section">
        <h1>환영합니다. 👋</h1>
        <p>주간 온라인 거래 내역을 확인하세요.</p>
      </header>

      <div className="account-grid">
        <AccountSection />
        <RecommendedProducts />
      </div>

      <div className="content-grid">
        <TransactionSection />
        <AnalysisSection />
      </div>
    </main>
  );
}

export default Dashboard;
