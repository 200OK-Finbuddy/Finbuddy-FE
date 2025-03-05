"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import styles from "../styles/AccountExpenseChart.module.css"

const CATEGORY_COLORS = {
  식비: "#FF6B6B",
  쇼핑: "#4ECDC4",
  오락: "#45B7D1",
  카페: "#96CEB4",
  교통: "#FFBE0B",
  주거통신: "#9381FF",
  기타: "#A5A583",
}

// 현재 달을 기준으로 최근 6개월 배열 생성
const MONTHS = Array.from({ length: 6 }, (_, i) => {
  const date = new Date()
  date.setMonth(date.getMonth() - i)
  return {
    value: date.getMonth() + 1,
    year: date.getFullYear(),
    label: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`, // 월을 2자리 숫자로 포맷팅
  }
}).reverse()

export default function AccountExpenseChart({ accountId, memberId }) {
  const [monthlyExpenses, setMonthlyExpenses] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[MONTHS.length - 1]) // 현재 달로 초기화
  const [hoveredAmount, setHoveredAmount] = useState(null)
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 })
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAllMonthlyExpenses = async () => {
      if (!accountId) return

      try {
        setIsLoading(true)
        const promises = MONTHS.map((month) =>
          fetch(
            `http://localhost:8080/api/transactions/account-category-expense?memberId=${memberId}&accountId=${accountId}&year=${month.year}&month=${month.value}`,
          )
            .then((res) => res.json())
            .then((data) => ({
              month: month.label,
              totalAmount: data.reduce((sum, item) => sum + item.totalAmount, 0),
              expenses: data,
            }))
            .catch(() => ({
              month: month.label,
              totalAmount: 0,
              expenses: [],
            })),
        )

        const results = await Promise.all(promises)
        setMonthlyExpenses(results)

        // 현재 선택된 월의 카테고리별 지출 데이터 설정
        const currentMonthData = results.find((data) => data.month === selectedMonth.label)

        if (currentMonthData) {
          const total = currentMonthData.totalAmount
          const expensesWithColors = currentMonthData.expenses.map((expense, index) => ({
            ...expense,
            color: CATEGORY_COLORS[expense.categoryName] || CATEGORY_COLORS.기타,
            percentage: total > 0 ? (expense.totalAmount / total) * 100 : 0,
            // Add a unique identifier if categoryName might be duplicated
            key: `${expense.categoryName}-${index}`,
          }))
          setCurrentMonthExpenses(expensesWithColors)
        }
      } catch (error) {
        console.error("Error fetching expenses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllMonthlyExpenses()
  }, [accountId, memberId, selectedMonth])

  const formatAmount = (amount) => {
    return amount?.toLocaleString() || "0"
  }

  const generateConicGradient = () => {
    let gradient = ""
    let startAngle = 0

    currentMonthExpenses.forEach((expense) => {
      const angle = expense.percentage * 3.6
      gradient += `${expense.color} ${startAngle}deg ${startAngle + angle}deg, `
      startAngle += angle
    })

    return `conic-gradient(${gradient.slice(0, -2)})`
  }

  // 이전 달 대비 증감률 계산
  const currentAmount = monthlyExpenses[monthlyExpenses.length - 1]?.totalAmount || 0
  const previousAmount = monthlyExpenses[monthlyExpenses.length - 2]?.totalAmount || 0
  const percentageChange =
    previousAmount !== 0 ? (((currentAmount - previousAmount) / previousAmount) * 100).toFixed(1) : 0

  // 최대 지출액 계산
  const maxExpense = Math.max(...monthlyExpenses.map((data) => data.totalAmount))

  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>
  }

  return (
    <div className={styles.expenseAnalysis}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.title}>지출 분석</div>
          <div className={styles.stats}>
            <div className={styles.lastWeek}>
              Last Month
              <span className={styles.amount}>₩{formatAmount(currentAmount)}</span>
            </div>
            <div className={`${styles.change} ${percentageChange >= 0 ? styles.positive : styles.negative}`}>
              {percentageChange > 0 ? "+" : ""}
              {percentageChange}%
            </div>
          </div>
        </div>
        <select
          className={styles.monthSelect}
          value={JSON.stringify(selectedMonth)}
          onChange={(e) => setSelectedMonth(JSON.parse(e.target.value))}
        >
          {MONTHS.map((month) => (
            <option key={`${month.year}-${month.value}`} value={JSON.stringify(month)}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.chartsContainer}>
        <div className={styles.barChartSection}>
          <div className={styles.yAxis}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={styles.yAxisLabel}>
                ₩{formatAmount(Math.round(maxExpense * ((4 - i) / 4)))}
              </div>
            ))}
          </div>

          <div className={styles.barChartWrapper}>
            <div className={styles.barChart}>
              {monthlyExpenses.map((data) => (
                <div key={data.month} className={styles.barGroup}>
                  <div
                    className={styles.barContainer}
                    onMouseEnter={(e) => {
                      setHoveredAmount(data.totalAmount)
                      setHoveredPosition({
                        x: e.currentTarget.offsetLeft + e.currentTarget.offsetWidth / 2,
                        y: e.currentTarget.offsetTop,
                      })
                    }}
                    onMouseLeave={() => setHoveredAmount(null)}
                  >
                    <div
                      className={styles.bar}
                      style={{
                        height: `${(data.totalAmount / maxExpense) * 100}%`,
                      }}
                    />
                  </div>
                  <div className={styles.barLabel}>{data.month.split(".")[1]}월</div>
                </div>
              ))}
              {hoveredAmount !== null && (
                <div
                  className={styles.tooltip}
                  style={{
                    left: hoveredPosition.x,
                    top: hoveredPosition.y,
                  }}
                >
                  ₩{formatAmount(hoveredAmount)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.donutChartSection}>
          <h4 className={styles.chartTitle}>카테고리별 지출</h4>
          <div className={styles.donutChartContainer}>
            <div className={styles.donutChart} style={{ background: generateConicGradient() }}>
              <div className={styles.chartCenter}>
                <span className={styles.amount}>
                  {formatAmount(
                    Math.floor(monthlyExpenses.find((data) => data.month === selectedMonth.label)?.totalAmount / 10000),
                  )}
                </span>
                <span className={styles.unit}>만원</span>
              </div>
            </div>

            <div className={styles.chartLegend}>
              {currentMonthExpenses.map((expense) => (
                <div
                  key={expense.key || `${expense.categoryName}-${expense.totalAmount}`}
                  className={styles.legendItem}
                >
                  <div className={styles.legendColor} style={{ backgroundColor: expense.color }} />
                  <span className={styles.legendLabel}>{expense.categoryName}</span>
                  <span className={styles.legendAmount}>
                    {formatAmount(expense.totalAmount)}원
                    <span className={styles.legendPercentage}>({expense.percentage.toFixed(1)}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// PropTypes 추가
AccountExpenseChart.propTypes = {
  accountId: PropTypes.number.isRequired,
  memberId: PropTypes.number.isRequired,
}

