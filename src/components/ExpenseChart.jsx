"use client"

import PropTypes from "prop-types"
import API_URL from "../config"
import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import "../styles/ExpenseChart.css"

const CATEGORY_COLORS = {
  카페: "#fde4cf",
  식비: "#f1c0e8",
  교통: "#b9fbc0",
  주거통신: "#a3c4f3",
  쇼핑: "#8eecf5",
  오락: "#98f5e1",
  기타: "#fbf8cc",
}

function ExpenseChart() {
  const [expenses, setExpenses] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [showChart, setShowChart] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const chartRef = useRef(null)
  const navigate = useNavigate()

  // 데이터 가져오기
  const getCategoryExpenses = useCallback(async () => {
    try {
      // 현재 날짜 가져오기
      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1 // JavaScript의 월은 0부터 시작하므로 1을 더합니다

      const response = await fetch(
        `${API_URL}/api/transactions/category-expenses?memberId=4&year=${currentYear}&month=${currentMonth}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()

      const total = data.reduce((sum, item) => sum + item.totalAmount, 0)

      const expensesWithColors = data.map((expense) => ({
        ...expense,
        color: CATEGORY_COLORS[expense.categoryName] || CATEGORY_COLORS.기타,
        percentage: (expense.totalAmount / total) * 100,
        value: expense.totalAmount,
        name: expense.categoryName,
      }))

      // 데이터 설정
      setExpenses([])
      setTotalAmount(total)

      // 애니메이션을 위한 지연 설정
      setTimeout(() => {
        setExpenses(expensesWithColors)
        setShowChart(true)
      }, 100)
    } catch (error) {
      console.error("Error fetching category expenses:", error)
      setShowChart(true)
    }
  }, [])

  // 애니메이션 재설정 함수
  const resetAnimation = useCallback(() => {
    setShowChart(false)
    setExpenses([])
    setAnimationKey((prev) => prev + 1)

    setTimeout(() => {
      getCategoryExpenses()
    }, 50)
  }, [getCategoryExpenses])

  useEffect(() => {
    // 컴포넌트 마운트 시 데이터 로드
    resetAnimation()

    // 페이지 가시성 변경 감지 (탭 전환, 새로고침 등)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resetAnimation()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // 클린업 함수
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [resetAnimation])

  const formatAmount = (amount) => {
    return amount.toLocaleString()
  }

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="custom-tooltip">
          <div className="tooltip-content">
            <p className="tooltip-category">{data.name}</p>
            <p className="tooltip-amount">{formatAmount(data.totalAmount)}원</p>
            <p className="tooltip-percentage">({data.percentage.toFixed(1)}%)</p>
          </div>
        </div>
      )
    }
    return null
  }

  // PropTypes 정의 추가
  CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
  }

  return (
    <section className="analysis-section">
      <div className="section-header">
        <h2>소비분석</h2>
        <button className="add-btn" onClick={() => navigate("/transactions")}>
          +
        </button>
      </div>

      <div className="chart-wrapper" ref={chartRef}>
        <div className="chart-content">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart key={animationKey}>
              <Pie
                data={expenses}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {expenses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip />}
                position={{ x: 0, y: 0 }}
                cursor={false}
                wrapperStyle={{ outline: "none" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-center">
            <span className="amount">{formatAmount(Math.floor(totalAmount / 10000))}</span>
            <span className="unit">만원</span>
          </div>
        </div>
      </div>

      <div className="expense-list">
        <h3 className="expense-title">카테고리별 지출</h3>
        <div className={`expense-items ${showChart ? "loaded" : ""}`}>
          {expenses.map((expense) => (
            <div key={expense.categoryName} className="expense-item">
              <div className="expense-category">
                <div className="category-color" style={{ backgroundColor: expense.color }} />
                <span className="category-name">{expense.categoryName}</span>
              </div>
              <div className="expense-details">
                <span className="expense-amount">{formatAmount(expense.totalAmount)}원</span>
                <span className="expense-percentage">({expense.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ExpenseChart

