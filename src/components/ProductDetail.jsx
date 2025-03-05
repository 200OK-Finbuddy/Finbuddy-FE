"use client"

import API_URL from "../config"
import { useEffect, useState } from "react"
import { useParams, useLocation } from "react-router-dom"
import styles from "../styles/ProductDetail.module.css"

export default function ProductDetail() {
  const { productId } = useParams()
  const location = useLocation()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const productType = location.pathname.includes("/deposit/") ? "deposit" : "saving"
        const response = await fetch(`${API_URL}/api/products/${productType}/${productId}`)
        if (!response.ok) {
          throw new Error("Product not found")
        }
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error("Error fetching product details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductDetail()
  }, [productId, location.pathname])

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    )
  }

  if (!product) {
    return <div className={styles.errorMessage}>상품을 찾을 수 없습니다.</div>
  }

  return (
    <main className="main-content">
      <div className={styles.productDetail}>
        <div className={styles.header}>
          <div className={styles.bankInfo}>
            <img src={product.bankLogoUrl || "/placeholder.svg"} alt={product.bankName} className={styles.bankLogo} />
            <h1 className={styles.bankName}>{product.bankName}</h1>
          </div>
          <h2 className={styles.productName}>{product.name}</h2>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>가입 정보</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>가입 방법</span>
                <span className={styles.value}>{product.subscriptionMethod}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>가입 제한</span>
                <span className={styles.value}>{product.subscriptionRestriction || "제한 없음"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>가입 대상</span>
                <span className={styles.value}>{product.subscriptionTarget || "제한 없음"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>최대 한도</span>
                <span className={styles.value}>
                  {product.maximumLimit ? `${product.maximumLimit.toLocaleString()}원` : "제한 없음"}
                </span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>금리 정보</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>만기 후 이율</span>
                <span className={styles.value}>{product.maturityInterestRate || "해당 없음"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>우대 조건</span>
                <span className={styles.value}>{product.specialCondition || "해당 없음"}</span>
              </div>
            </div>
          </section>

          {product.options && product.options.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>금리 옵션</h3>
              <div className={styles.optionsTable}>
                <table>
                  <thead>
                    <tr>
                      <th>저축 기간</th>
                      <th>금리 유형</th>
                      <th>기본 금리</th>
                      <th>최대 금리</th>
                      {location.pathname.includes("/saving/") && <th>적립 유형</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {product.options
                      .sort((a, b) => a.savingTerm - b.savingTerm)
                      .map((option, index) => (
                        <tr key={option.productOptionId} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                          <td className={styles.termCell}>{option.savingTerm}개월</td>
                          <td>{option.interestRateTypeName || option.interestRateType}</td>
                          <td className={styles.rateCell}>{option.interestRate}%</td>
                          <td className={styles.rateCell}>
                            <span className={styles.maxRate}>{option.maximumInterestRate}%</span>
                          </td>
                          {location.pathname.includes("/saving/") && (
                            <td>{option.reserveTypeName || option.reserveType || "-"}</td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {product.additionalNotes && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>추가 정보</h3>
              <p className={styles.additionalNotes}>{product.additionalNotes}</p>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}

