import { useState, useEffect } from 'react';
import '../styles/TransactionSection.css';

function TransactionSection() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/transactions/checking/recent/1');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString();
  };

  return (
    <section className="transaction-section">
      <div className="section-header">
        <h2>거래내역</h2>
        <button className="add-btn">+</button>
      </div>
      <div className="transaction-list">
        {transactions.map((transaction, index) => (
          <div key={index} className="transaction-item">
            <div className="transaction-account">
              <span className="primary-text">{transaction.accountName}</span>
              <span className="secondary-text">{transaction.accountNumber}</span>
            </div>
            <div className="transaction-place">
              <span className="primary-text">{transaction.opponentName}</span>
            </div>
            <div className="transaction-date">
              <span className="primary-text">{formatDate(transaction.transactionDate)}</span>
            </div>
            <div className="transaction-amount">
              <span className={`primary-text ${transaction.transactionType === 1 ? 'income' : 'expense'}`}>
                {transaction.transactionType === 1 ? '+' : '-'}
                {formatAmount(transaction.amount)}원
              </span>
              <span className="secondary-text">잔액: {formatAmount(transaction.updatedBalance)}원</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TransactionSection;