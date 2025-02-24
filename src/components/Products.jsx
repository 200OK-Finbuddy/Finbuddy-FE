import { useEffect, useState, useCallback } from "react"
import { Search } from 'lucide-react'
import '../styles/Products.css';

export default function ProductSearch() {
  const [activeTab, setActiveTab] = useState("deposits")
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = useCallback(async () => {
    setIsLoading(true)
    try {
      const endpoint = activeTab === "deposits" ? "http://localhost:8080/api/products/deposits" : "http://localhost:8080/api/products/savings"
      const response = await fetch(`${endpoint}?name=${searchTerm}&page=0`)
      const data = await response.json()
      setProducts(data.content)
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, searchTerm])

  useEffect(() => {
    handleSearch()
  }, [handleSearch])

  return (
    <div className="product-container">
      <header className="welcome-section">
        <h1>환영합니다. 👋</h1>
        <p>주간 온라인 거래 내역을 확인하세요.</p>
      </header>
      
      <h2 className="product-title">예금/적금</h2>

      {/* 탭 영역 */}
      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === "deposits" ? "active" : ""}`}
          onClick={() => setActiveTab("deposits")}
        >
          예금
        </button>
        <button
          className={`tab-button ${activeTab === "savings" ? "active" : ""}`}
          onClick={() => setActiveTab("savings")}
        >
          적금
        </button>
      </div>

      {/* 검색 영역 */}
      <div className="search-container">
        <div className="search-input-group">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="은행명"
              className="search-input"
            />
          </div>
          <div className="search-input-wrapper">
            <input
              type="search"
              placeholder="상품명"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (e.target.value.length >= 2) {
                  handleSearch()
                }
              }}
              className="search-input"
            />
            <Search className="search-icon" />
          </div>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="product-list-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="product-list">
            {products.map((product) => (
              <div key={product.productId} className="product-item">
                <div className="product-info">
                  <img
                    src={product.bankLogoUrl || "/placeholder.svg"}
                    alt={product.bankName}
                    className="bank-logo"
                  />
                  <div className="product-details">
                    <h3 className="bank-name">{product.bankName}</h3>
                    <p className="product-name">{product.productName}</p>
                    <p className="subscription-method">{product.subscriptionMethod}</p>
                  </div>
                </div>
                <div className="interest-info">
                  <div className="interest-rates">
                    <p className="max-rate">{product.maxInterestRate.toFixed(2)}%</p>
                    <p className="base-rate">기본 {product.minInterestRate.toFixed(2)}%</p>
                  </div>
                  <button className="detail-button">상세보기</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
