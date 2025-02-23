import '../styles/RecommendedProducts.css';

function RecommendedProducts() {
  const handleProductClick = (product) => {
    console.log('Selected product:', product);
    // 여기에 상품 상세 페이지로 이동하는 로직 추가
  };

  return (
    <section className="recommended-section">
      <div className="section-header">
        <h2>추천상품</h2>
        <button className="add-btn">+</button>
      </div>
      <div className="product-cards">
        <button 
          className="product-card"
          onClick={() => handleProductClick('KB마이핏통장1')}
        >
          <h3>KB마이핏통장</h3>
          <div className="rate-info">
            <div className="info-row">
              <span className="label">금리</span>
              <span className="value">3.4 ~ 5.3 %</span>
            </div>
            <div className="info-row">
              <span className="label">이자</span>
              <span className="value">연 1.5%</span>
            </div>
          </div>
        </button>

        <button 
          className="product-card"
          onClick={() => handleProductClick('KB마이핏통장2')}
        >
          <h3>KB마이핏통장</h3>
          <div className="rate-info">
            <div className="info-row">
              <span className="label">금리</span>
              <span className="value">3.4 ~ 5.3 %</span>
            </div>
            <div className="info-row">
              <span className="label">이자</span>
              <span className="value">연 1.5%</span>
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}

export default RecommendedProducts;