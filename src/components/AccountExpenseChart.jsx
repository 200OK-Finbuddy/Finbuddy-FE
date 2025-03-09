"use client"

import API_URL from "../config"
import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import styles from "../styles/AccountExpenseChart.module.css"

const CATEGORY_COLORS = {
  카페: "#fde4cf",
  식비: "#f1c0e8",
  교통: "#b9fbc0",
  주거통신: "#a3c4f3",
  쇼핑: "#8eecf5",
  오락: "#98f5e1",
  기타: "#fbf8cc",
}

// 현재 달을 기준으로 최근 6개월 배열 생성
const MONTHS = Array.from({ length: 6 }, (_, i) => {
  const date = new Date()
  date.setMonth(date.getMonth() - i)
  return {
    value: date.getMonth() + 1,
    year: date.getFullYear(),
    label: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`,
    shortLabel: `${String(date.getMonth() + 1).padStart(2, "0")}월`,
  }
}).reverse()

// Add this custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className={styles.customTooltip}>
        <div className={styles.tooltipContent}>
          <p className={styles.tooltipCategory}>{data.name}</p>
          <p className={styles.tooltipAmount}>{data.value.toLocaleString()}원</p>
          <p className={styles.tooltipPercentage}>({data.percentage.toFixed(1)}%)</p>
        </div>
      </div>
    )
  }
  return null
}

// Add PropTypes for the CustomTooltip component
CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
}

export default function AccountExpenseChart({ accountId, memberId, accountType }) {
  const [monthlyExpenses, setMonthlyExpenses] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[MONTHS.length - 1])
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAllMonthlyExpenses = async () => {
      if (!accountId) return

      try {
        setIsLoading(true)
        const promises = MONTHS.map((month) =>
          fetch(
            `${API_URL}/api/transactions/account-category-expense?memberId=${memberId}&accountId=${accountId}&year=${month.year}&month=${month.value}`,
          )
            .then((res) => res.json())
            .then((data) => ({
              month: month.label,
              shortMonth: month.shortLabel,
              totalAmount: data.reduce((sum, item) => sum + item.totalAmount, 0),
              expenses: data,
            }))
            .catch(() => ({
              month: month.label,
              shortMonth: month.shortLabel,
              totalAmount: 0,
              expenses: [],
            })),
        )

        const results = await Promise.all(promises)
        setMonthlyExpenses(results)

        const currentMonthData = results.find((data) => data.month === selectedMonth.label)
        if (currentMonthData) {
          const total = currentMonthData.totalAmount
          const expensesWithColors = currentMonthData.expenses.map((expense, index) => ({
            ...expense,
            color: CATEGORY_COLORS[expense.categoryName] || CATEGORY_COLORS.기타,
            percentage: total > 0 ? (expense.totalAmount / total) * 100 : 0,
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

  if (accountType !== "CHECKING") {
    return null
  }

  if (isLoading) {
    return <div className={styles.loading}>데이터를 불러오는 중입니다...</div>
  }

  // 현재 선택된 달의 지출 금액을 가져오는 부분 수정
  const currentMonthData = monthlyExpenses.find((data) => data.month === selectedMonth.label)
  const currentAmount = currentMonthData?.totalAmount || 0
  const previousMonthIndex = monthlyExpenses.findIndex((data) => data.month === selectedMonth.label) - 1
  const previousAmount = previousMonthIndex >= 0 ? monthlyExpenses[previousMonthIndex]?.totalAmount || 0 : 0
  const percentageChange =
    previousAmount !== 0 ? (((currentAmount - previousAmount) / previousAmount) * 100).toFixed(1) : 0

  const pieChartData = currentMonthExpenses.map((expense) => ({
    name: expense.categoryName,
    value: expense.totalAmount,
    color: expense.color,
    // Add these properties for the tooltip to use
    categoryName: expense.categoryName,
    totalAmount: expense.totalAmount,
    percentage: expense.percentage,
  }))

  const lineChartData = monthlyExpenses.map((data) => ({
    name: data.shortMonth,
    expense: data.totalAmount,
  }))

  const isEmpty = !currentMonthExpenses.length || currentMonthExpenses.every((expense) => expense.totalAmount === 0)

  const formatAmount = (amount) => {
    return amount?.toLocaleString() || "0"
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.mainTitle}>지출 분석</h2>
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

      <div className={styles.topSection}>
        {/* 총 지출 섹션 */}
        <div className={styles.totalExpenseSection}>
          <h3 className={styles.sectionTitle}>총 지출</h3>
          <div className={styles.totalAmount}>
            <span className={styles.amount}>{formatAmount(currentAmount)}</span>
            <span className={styles.currency}>원</span>
            {currentAmount > 0 && previousAmount > 0 && (
              <span
                className={`${styles.percentageChange} ${
                  Number(percentageChange) >= 0 ? styles.positive : styles.negative
                }`}
              >
                {percentageChange > 0 ? "+" : ""}
                {percentageChange}%
              </span>
            )}
          </div>
        </div>

        {/* 카테고리별 지출 섹션 */}
        <div className={styles.categorySection}>
          <h3 className={styles.sectionTitle}>카테고리별 지출</h3>
          {isEmpty ? (
            <div className={styles.emptyState}>카테고리별 지출 내역이 없습니다.</div>
          ) : (
            <div className={styles.categoryContent}>
              <div className={styles.pieChartContainer}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip />}
                      position={{ x: 0, y: 0 }}
                      coordinate={{ x: 0, y: 0 }}
                      wrapperStyle={{ position: "absolute", top: 0, left: 0 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.categoryList}>
                {currentMonthExpenses.map((expense) => (
                  <div key={expense.key} className={styles.categoryItem}>
                    <div className={styles.categoryInfo}>
                      <div className={styles.colorDot} style={{ backgroundColor: expense.color }} />
                      <span className={styles.categoryName}>{expense.categoryName}</span>
                      <span className={styles.categoryPercentage}>({expense.percentage.toFixed(1)}%)</span>
                    </div>
                    <span className={styles.categoryAmount}>{formatAmount(expense.totalAmount)}원</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 월별 지출 추이 섹션 */}
      <div className={styles.trendSection}>
        <h3 className={styles.sectionTitle}>월별 지출 추이 (단위: 만원)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineChartData}>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${Math.floor(value / 10000)}`} domain={[0, "auto"]} />
            <Tooltip
              formatter={(value) => [`${value.toLocaleString()}원`, "지출"]}
              labelFormatter={(label) => `${label}`}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#4ECDC4"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

AccountExpenseChart.propTypes = {
  accountId: PropTypes.number.isRequired,
  memberId: PropTypes.number.isRequired,
  accountType: PropTypes.string.isRequired,
}

