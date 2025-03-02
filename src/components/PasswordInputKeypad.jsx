"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import PropTypes from "prop-types"
import { Delete } from "lucide-react"
import styles from "../styles/PasswordInputKeypad.module.css"

export default function PasswordInputKeypad({ onPasswordComplete, reset }) {
  const [password, setPassword] = useState(Array(4).fill(""))
  const [showKeypad, setShowKeypad] = useState(false)
  const [keypadNumbers, setKeypadNumbers] = useState([])
  const keypadRef = useRef(null)
  const inputRef = useRef(null)

  // reset prop이 변경될 때 비밀번호 초기화
  useEffect(() => {
    setPassword(Array(4).fill(""))
    setShowKeypad(false)
  }, [reset])

  const shuffleNumbers = useCallback(() => {
    const numbers = Array.from({ length: 10 }, (_, i) => i)
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[numbers[i], numbers[j]] = [numbers[j], numbers[i]]
    }
    return numbers
  }, [])

  useEffect(() => {
    if (showKeypad) {
      setKeypadNumbers(shuffleNumbers())
    }
  }, [showKeypad, shuffleNumbers])

  const handleDigitClick = (digit) => {
    setPassword((prev) => {
      const nextIndex = prev.findIndex((d) => d === "")
      if (nextIndex !== -1) {
        const newPassword = [...prev]
        newPassword[nextIndex] = digit
        return newPassword
      }
      return prev
    })
  }

  const handleDelete = () => {
    setPassword((prev) => {
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i] !== "") {
          const newPassword = [...prev]
          newPassword[i] = ""
          return newPassword
        }
      }
      return prev
    })
  }

  const handleConfirm = () => {
    if (password.every((d) => d !== "")) {
      onPasswordComplete(password.join(""))
      setShowKeypad(false)
    }
  }

  const handleInputClick = () => {
    setShowKeypad(true)
    setPassword(Array(4).fill(""))
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        keypadRef.current &&
        !keypadRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowKeypad(false)
        if (!password.every((d) => d !== "")) {
          setPassword(Array(4).fill(""))
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [password])

  const isPasswordComplete = password.every((d) => d !== "")

  const renderKeypadButtons = () => {
    // 숫자 0-8까지의 버튼
    const numberButtons = keypadNumbers.slice(0, 9).map((number) => (
      <button key={`num-${number}`} className={styles.keypadButton} onClick={() => handleDigitClick(number.toString())}>
        {number}
      </button>
    ))

    // 삭제, 숫자 9, 확인 버튼
    const actionButtons = [
      <button
        key="delete-button" // 고유한 키로 변경
        className={`${styles.keypadButton} ${styles.deleteButton}`}
        onClick={handleDelete}
      >
        <Delete className="w-5 h-5 mx-auto" />
      </button>,
      <button
        key="last-number" // 고유한 키로 변경
        className={styles.keypadButton}
        onClick={() => handleDigitClick(keypadNumbers[9].toString())}
      >
        {keypadNumbers[9]}
      </button>,
      <button
        key="confirm-button" // 고유한 키로 변경
        className={`${styles.keypadButton} ${styles.confirmButton}`}
        onClick={handleConfirm}
        disabled={!isPasswordComplete}
      >
        확인
      </button>,
    ]

    return [...numberButtons, ...actionButtons]
  }

  return (
    <div className={styles.passwordContainer}>
      <div ref={inputRef} className={styles.passwordInput} onClick={handleInputClick}>
        {Array(4)
          .fill(0)
          .map((_, index) => (
            <div key={index} className={`${styles.passwordDot} ${password[index] ? styles.passwordDotFilled : ""}`} />
          ))}
      </div>
      {showKeypad && (
        <div ref={keypadRef} className={styles.keypadContainer}>
          <div className={styles.keypadGrid}>{renderKeypadButtons()}</div>
        </div>
      )}
    </div>
  )
}

PasswordInputKeypad.propTypes = {
  onPasswordComplete: PropTypes.func.isRequired,
  reset: PropTypes.bool,
}

