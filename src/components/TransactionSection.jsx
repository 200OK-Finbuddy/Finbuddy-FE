import { useEffect } from 'react';
import '../styles/TransactionSection.css';

function TransactionSection() {

  async function getRecentCheckingTransaction() {
    try {
        const response = await fetch("http://localhost:8080/api/transactions/checking/recent/1", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Recent Transaction:", data);
        return data;
    } catch (error) {
        console.error("Error fetching recent transaction:", error);
    }
}

useEffect( () => {
  getRecentCheckingTransaction();

}, []);

  return (
    <section className="transaction-section">
      <h2>거래내역</h2>
      <div className="transaction-table">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tesco Market</td>
              <td>13 Dec 2020</td>
              <td>$75.67</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TransactionSection;
