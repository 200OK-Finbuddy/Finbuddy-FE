"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import PropTypes from "prop-types"
import { BANKS } from "../constants/banks"
import "../styles/RecommendedProducts.css"

function RecommendedProducts({ setActiveNav }) {
  const [products, setProducts] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()

  // 은행 ID로 은행 이름 찾기 함수 추가
  const getBankNameById = (bankId) => {
    const bank = BANKS.find((bank) => bank.id === bankId)
    return bank ? bank.name : "알 수 없는 은행"
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products/recommendations")
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchProducts()
  }, [])

  const handleNavigation = (path, navType) => {
    setActiveNav(navType)
    navigate(path)
  }

  const getProductTypeText = (type) => {
    return type === "DEPOSIT" ? "예금" : "적금"
  }

  const formatInterestRate = (rate) => {
    return rate.toFixed(1)
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? products.length - 1 : prevIndex - 1))
  }

  const getMaxProductNameLength = () => {
    return Math.max(...products.map((product) => product.name.length), 0)
  }

  const handleProductClick = async (product) => {
    const productType = product.productType.toLowerCase()
    try {
      // API 호출
      const response = await fetch(`/api/products/${productType}/${product.productId}`)
      if (!response.ok) {
        throw new Error("Product details fetch failed")
      }
      // 상세 페이지로 이동
      navigate(`/products/${productType}/${product.productId}`)
    } catch (error) {
      console.error("Error fetching product details:", error)
    }
  }

  const visibleProducts = products.length
    ? [products[currentIndex], products[(currentIndex + 1) % products.length]]
    : []

  const maxProductNameLength = getMaxProductNameLength()

  return (
    <section className="recommended-section">
      <div className="section-header">
        <h2>추천상품</h2>
        <button className="add-btn" onClick={() => handleNavigation("/products", "products")}>
          +
        </button>
      </div>
      <div className="carousel-wrapper">
        <button className="carousel-button prev" onClick={handlePrev} aria-label="이전 상품">
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="product-cards">
          {visibleProducts.map((product) => (
            <div key={product.productId} className="product-card" onClick={() => handleProductClick(product)}>
              <input type="hidden" value={product.productId} />
              <div className="content-wrapper">
                <div className="bank-info" style={{ marginBottom: "8px" }}>
                  <img
                    src={product.bankLogoUrl || "/placeholder.svg"}
                    alt={`${getBankNameById(product.bankId)} 로고`}
                    className="bank-logo"
                  />
                  <span className="bank-name">{getBankNameById(product.bankId)}</span>
                </div>

                <div className="product-info">
                  <span className="product-type">{getProductTypeText(product.productType)}</span>
                  <h3 className="product-name" style={{ minHeight: `${maxProductNameLength * 1.2}px` }}>
                    {product.name}
                  </h3>
                </div>

                <div style={{ marginTop: "6px" }} className="rate-info">
                  <span className="label">금리</span>
                  <div className="value">
                    {formatInterestRate(product.minInterestRate)} ~ {formatInterestRate(product.maxInterestRate)}%
                  </div>
                </div>

                <div className="term-info">
                  <span className="label">가입기간</span>
                  <div className="value">
                    {product.minSavingTerm === product.maxSavingTerm
                      ? `${product.maxSavingTerm}개월`
                      : `${product.minSavingTerm} ~ ${product.maxSavingTerm}개월`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-button next" onClick={handleNext} aria-label="다음 상품">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  )
}
RecommendedProducts.propTypes = {
  setActiveNav: PropTypes.func.isRequired, // 추가
}

export default RecommendedProducts

