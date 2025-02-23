import { useState, useEffect, useCallback } from 'react';
import '../styles/AccountSection.css';

function AccountSection() {
  const [accountSummary, setAccountSummary] = useState({
    totalBalance: 0,
    top3Accounts: []
  });

  const getCheckingAccounts = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/accounts/checking/1", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Checking Accounts:", data);
      setAccountSummary(data);
    } catch (error) {
      console.error("Error fetching checking accounts:", error);
    }
  }, []);

  useEffect(() => {
    getCheckingAccounts();
  }, [getCheckingAccounts]);

  // 금액 포맷팅 함수
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 계좌 상세 정보로 이동하는 함수
  const handleAccountClick = (account) => {
    console.log('Account details:', account);
    // 여기에 계좌 상세 페이지로 이동하는 로직 추가
  };

  return (
    <section className="account-section">
      <div className="account-header">
        <div className="account-title">
          <h2>입출금 계좌</h2>
          <span className="total-amount">{formatAmount(accountSummary.totalBalance)}원</span>
        </div>
        <button className="transfer-btn">송금</button>
      </div>

      <div className="account-list">
        {accountSummary.top3Accounts.map((account) => (
          <div key={account.accountId} className="account-item">
            <div className="account-info">
              <div className="bank-logo">
                <img src={account.bankLogoUrl || "/placeholder.svg"} alt="bank logo" />
              </div>
              <div className="account-details">
                <h3>{account.accountName}</h3>
                <p>{account.accountNumber}</p>
              </div>
            </div>
            <div className="amount-info">
              <button 
                className="amount-button"
                onClick={() => handleAccountClick(account)}
              >
                {formatAmount(account.balance)}원
              </button>
              <button 
                className="arrow-button"
                onClick={() => handleAccountClick(account)}
              >
                ›
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AccountSection;