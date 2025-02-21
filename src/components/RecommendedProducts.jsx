import '../styles/RecommendedProducts.css';

function RecommendedProducts() {
  return (
    <section className="recommended-section">
      <h2>추천상품</h2>
      <div className="product-cards">
        <div className="product-card">
          <h3>KB마이핏통장</h3>
          <p>금리: 3.4 ~ 5.3% / 이자: 연 1.5%</p>
        </div>
        <div className="product-card">
          <h3>신한 스탁플러스</h3>
          <p>금리: 2.8 ~ 4.5% / 이자: 연 1.3%</p>
        </div>
      </div>
    </section>
  );
}

export default RecommendedProducts;
