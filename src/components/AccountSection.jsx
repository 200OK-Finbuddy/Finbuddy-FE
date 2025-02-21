import '../styles/AccountSection.css';
import AccountList from './AccountList';

const accounts = [
  {
    id: 1,
    bankName: 'KB국민은행',
    accountType: '보통예금',
    accountNumber: '834-70104099758',
    balance: 185129,
    logo: '/images/kb-bank.png'
  },
  {
    id: 2,
    bankName: '신한은행',
    accountType: '청년도약계좌',
    accountNumber: '834-70104099758',
    balance: 185129,
    logo: '/images/shinhan-bank.png'
  },
  {
    id: 3,
    bankName: '기타',
    accountType: '',
    accountNumber: '',
    balance: 856,
    logo: '/images/other-bank.png'
  }
];

function AccountSection() {
  return (
    <section className="account-section">
      <div className="account-header">
        <div className="account-title">
          <h2>입출금 계좌</h2>
          <span className="total-amount">
            {accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}원
          </span>
        </div>
        <button className="transfer-btn">송금</button>
      </div>

      {/* AccountList 컴포넌트 사용 ✅ */}
      <AccountList accounts={accounts} />
    </section>
  );
}

export default AccountSection;
