import PropTypes from 'prop-types';
import '../styles/AccountList.css';

function AccountList({ accounts }) {
  return (
    <div className="account-list">
      {accounts.map((account) => (
        <div key={account.id} className="account-item">
          <div className="account-info">
            <div className="bank-logo">
              <img src={account.logo} alt={account.bankName} />
            </div>
            <div className="account-details">
              <h3>{account.bankName} {account.accountType && `- ${account.accountType}`}</h3>
              {account.accountNumber && <p>{account.accountNumber}</p>}
            </div>
          </div>
          <div className="amount-actions">
            <span className="account-balance">{account.balance.toLocaleString()}원</span>
            <button className="account-btn">
              <i className="arrow">›</i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ✅ PropTypes 추가 */
AccountList.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      bankName: PropTypes.string.isRequired,
      accountType: PropTypes.string.isRequired,
      accountNumber: PropTypes.string.isRequired,
      balance: PropTypes.number.isRequired,
      logo: PropTypes.string.isRequired
    })
  ).isRequired
};

export default AccountList;
