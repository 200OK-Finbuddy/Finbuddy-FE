import { useEffect, useState, useCallback } from "react"
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import PropTypes from 'prop-types';
import styles from "../styles/Products.module.css"

// 은행 목록 데이터
const BANKS = [
  { id: 1, name: "우리은행" },
  { id: 2, name: "한국스탠다드차타드은행" },
  { id: 3, name: "아이엠뱅크" },
  { id: 4, name: "부산은행" },
  { id: 5, name: "광주은행" },
  { id: 6, name: "제주은행" },
  { id: 7, name: "전북은행" },
  { id: 8, name: "경남은행" },
  { id: 9, name: "중소기업은행" },
  { id: 10, name: "한국산업은행" },
  { id: 11, name: "국민은행" },
  { id: 12, name: "신한은행" },
  { id: 13, name: "농협은행주식회사" },
  { id: 14, name: "하나은행" },
  { id: 15, name: "주식회사 케이뱅크" },
  { id: 16, name: "수협은행" },
  { id: 17, name: "주식회사 카카오뱅크" },
  { id: 18, name: "토스뱅크 주식회사" },
]

export default function Products({ setActiveNav }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("deposits")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const handleSearch = useCallback(async () => {
    setIsLoading(true)
    try {
      const endpoint =
        activeTab === "deposits"
          ? "http://localhost:8080/api/products/deposits"
          : "http://localhost:8080/api/products/savings"
      const response = await fetch(`${endpoint}?name=${searchTerm}&bankName=${selectedBank}&page=${currentPage}`)
      const data = await response.json()
      setProducts(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, searchTerm, selectedBank, currentPage])

  useEffect(() => {
    handleSearch()
    setActiveNav("products")
  }, [handleSearch, setActiveNav ])

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(0) // 탭 변경 시 페이지 초기화
  }

  // 페이지 그룹을 계산하는 함수
  const getPageGroup = useCallback(() => {
    const groupSize = 5
    const currentGroup = Math.floor(currentPage / groupSize)
    const start = currentGroup * groupSize
    const end = Math.min(start + groupSize, totalPages)

    return Array.from({ length: end - start }, (_, i) => start + i)
  }, [currentPage, totalPages])

  // 첫 페이지로 이동
  const goToFirstPage = () => {
    setCurrentPage(0)
  }

  // 마지막 페이지로 이동
  const goToLastPage = () => {
    setCurrentPage(totalPages - 1)
  }

  const handleDetailClick = (productId) => {
    // 현재 활성화된 탭에 따라 상품 타입 결정
    const productType = activeTab === "deposits" ? "deposit" : "saving"
    navigate(`/products/${productType}/${productId}`, {
      state: { productType },
    })
  }

  return (
    <main className="main-content">
      <header className="welcome-section">
        <h1>환영합니다. 👋</h1>
        <p>주간 온라인 거래 내역을 확인하세요.</p>
      </header>

      <h2 className={styles.title}>예금/적금</h2>

      {/* 탭과 검색을 포함하는 컨테이너 */}
      <div className={styles.filterContainer}>
        {/* 탭 영역 */}
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === "deposits" ? styles.tabButtonActive : ""}`}
            onClick={() => handleTabChange("deposits")}
          >
            예금
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "savings" ? styles.tabButtonActive : ""}`}
            onClick={() => handleTabChange("savings")}
          >
            적금
          </button>
        </div>

        {/* 검색 영역 */}
        <div className={styles.searchInputGroup}>
          <div className={styles.searchInputWrapper}>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className={styles.searchInput}
            >
              <option value="">전체 은행</option>
              {BANKS.map((bank) => (
                <option key={bank.id} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.searchInputWrapper}>
            <input
              type="text" // search에서 text로 변경
              placeholder="상품명"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (e.target.value.length >= 2) {
                  handleSearch()
                }
              }}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                className={styles.clearButton}
                onClick={() => {
                  setSearchTerm("")
                  handleSearch()
                }}
                aria-label="검색어 지우기"
              >
                ✕
              </button>
            )}
            <Search className={styles.searchIcon} />
          </div>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className={styles.productListContainer}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
          </div>
        ) : (
          <>
            <div className={styles.productList}>
              {products.map((product) => (
                <div key={product.productId} className={styles.productItem}>
                  <input type="hidden" value={product.productId} />
                  <div className={styles.productInfo}>
                    <div className={styles.productDetails}>
                      <div className={styles.bankInfo}>
                        <img
                          src={product.bankLogoUrl || "/placeholder.svg"}
                          alt={product.bankName}
                          className={styles.bankLogo}
                        />
                        <h3 className={styles.bankName}>{product.bankName}</h3>
                        <span className={styles.subscriptionMethod}>{product.subscriptionMethod}</span>
                      </div>
                      <p className={styles.productName}>{product.productName}</p>
                      <p className={styles.additionalNotes} title={product.additionalNotes}>
                        {product.additionalNotes}
                      </p>
                    </div>
                  </div>
                  <div className={styles.interestInfo}>
                    <div className={styles.interestRates}>
                      <p className={styles.maxRate}>{product.maxInterestRate.toFixed(2)}%</p>
                      <p className={styles.baseRate}>기본 {product.minInterestRate.toFixed(2)}%</p>
                    </div>
                    <button className={styles.detailButton} onClick={() => handleDetailClick(product.productId)}>
                      상세보기
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 0 && (
              <div className={styles.pagination}>
                <button
                  className={`${styles.pageButton} ${styles.pageButtonEdge}`}
                  onClick={goToFirstPage}
                  disabled={currentPage === 0}
                >
                  <ChevronsLeft className={styles.pageButtonIcon} />
                </button>

                <button
                  className={styles.pageButton}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className={styles.pageButtonIcon} />
                </button>

                <div className={styles.pageNumbers}>
                  {getPageGroup().map((pageNum) => (
                    <button
                      key={pageNum}
                      className={`${styles.pageNumber} ${currentPage === pageNum ? styles.activePage : ""}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum + 1}
                    </button>
                  ))}
                </div>

                <button
                  className={styles.pageButton}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronRight className={styles.pageButtonIcon} />
                </button>

                <button
                  className={`${styles.pageButton} ${styles.pageButtonEdge}`}
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronsRight className={styles.pageButtonIcon} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

Products.propTypes = {
  setActiveNav: PropTypes.func.isRequired,  // 추가
};