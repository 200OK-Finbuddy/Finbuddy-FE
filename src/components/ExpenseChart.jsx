import { useState, useEffect, useCallback } from 'react';
import '../styles/ExpenseChart.css';

const CATEGORY_COLORS = {
  식비: '#FF6B6B',     // 빨간색 계열
  쇼핑: '#4ECDC4',     // 청록색 계열
  오락: '#45B7D1',     // 하늘색 계열
  카페: '#96CEB4',     // 민트 계열
  교통: '#FFBE0B',     // 노란색 계열
  주거통신: '#9381FF',     // 보라색 계열
  기타: '#A5A58D'      // 회색 계열
}

function ExpenseChart() {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const getCategoryExpenses = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/transactions/category-expenses?memberId=1&year=2025&month=2", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      const expensesWithColors = data.map(expense => ({
        ...expense,
        color: CATEGORY_COLORS[expense.categoryName] || CATEGORY_COLORS.기타
      }));

      setExpenses(expensesWithColors);
      const total = data.reduce((sum, item) => sum + item.totalAmount, 0);
      setTotalAmount(total);
      console.log("Recent dd:", data);
    } catch (error) {
      console.error("Error fetching category expenses:", error);
    }
  }, []);

  useEffect(() => {
    getCategoryExpenses();
  }, [getCategoryExpenses]);

  const generateConicGradient = () => {
    let gradientString = '';
    let currentPercentage = 0;

    expenses.forEach((expense, index) => {
      gradientString += `${expense.color} ${currentPercentage}% ${currentPercentage + expense.percentage}%`;
      currentPercentage += expense.percentage;

      if (index < expenses.length - 1) {
        gradientString += ', ';
      }
    });

    return `conic-gradient(${gradientString})`;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <section className="analysis-section">
      <div className="section-header">
        <h2>소비분석</h2>
        <button className="add-btn">+</button>
      </div>
      <div className="chart-container">
        <div 
          className="donut-chart"
          style={{ background: generateConicGradient() }}
        >
          <div className="chart-center">
            <span className="amount">{formatAmount(Math.floor(totalAmount / 10000))}</span>
            <span className="unit">만원</span>
          </div>
        </div>
        <div className="chart-legend">
          {expenses.map((expense) => (
            <div key={expense.categoryName} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: expense.color }}
              />
              <span className="legend-label">{expense.categoryName}</span>
              <span className="legend-amount">
                {formatAmount(expense.totalAmount)} 원
                <span className="legend-percentage">
                  {' '}({expense.percentage.toFixed(1)}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExpenseChart;