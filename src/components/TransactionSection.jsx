import '../styles/TransactionSection.css';

function TransactionSection() {
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
