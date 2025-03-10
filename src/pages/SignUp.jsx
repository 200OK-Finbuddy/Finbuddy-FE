"use client"

import API_URL from "../config"
import axios from "axios"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import styles from "../styles/SignUp.module.css"
// Add useNavigate import at the top
import { useNavigate } from "react-router-dom"

function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ mode: "onBlur" })
  const [emailStatus, setEmailStatus] = useState("idle") // idle | sent | verified
  const [isEmailVerificationLoading, setIsEmailVerificationLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [modalMessage, setModalMessage] = useState("")

  // Add navigate constant after the useState declarations
  const navigate = useNavigate()

  const watchedFields = watch(["emailId", "emailDomain"])
  const emailFilled = watchedFields.every(Boolean)

  const password = watch("password")

  // Timer effect
  useEffect(() => {
    let interval
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      setIsTimerActive(false)
      showModal("인증 시간 만료", "인증 시간이 만료되었습니다. 이메일 인증을 다시 요청해주세요.")
    }

    return () => clearInterval(interval)
  }, [isTimerActive, timeRemaining])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Show modal function
  const showModal = (title, message) => {
    setModalTitle(title)
    setModalMessage(message)
    setIsModalOpen(true)
  }

  // Modify the onSubmit function to navigate to main page after successful signup
  const onSubmit = async (data) => {
    if (emailStatus !== "verified") {
      showModal("인증 필요", "이메일 인증을 완료해주세요.")
      return
    }

    const { birthYear, birthMonth, birthDay, emailId, emailDomain, ...rest } = data
    const email = `${emailId}@${emailDomain}`
    const birthDate = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`

    const formData = {
      ...rest,
      email,
      birthDate,
    }
    console.log(formData)

    try {
      const response = await axios.post(`${API_URL}/api/signup`, formData)
      if (response.data.success) {
        showModal("회원가입 성공", "회원가입에 성공했습니다. 메인 페이지로 이동합니다.")
        setTimeout(() => {
          navigate("/signin")
        }, 2000)
      } else {
        showModal("회원가입 실패", `회원가입 실패: ${response.data.error}`)
      }
    } catch (error) {
      showModal("오류", `${error.response.data.message}`)
    }
  }

  const handleDomainChange = (e) => {
    const value = e.target.value

    if (value === "custom") {
      // '직접입력'일 때, 도메인 필드를 초기화하여 사용자가 입력하도록 함
      setValue("emailDomain", "")
    } else {
      // 사용자가 선택한 도메인으로 입력 필드를 채움
      setValue("emailDomain", value)
    }
  }

  const sendVerificationEmail = async () => {
    const { emailId, emailDomain } = getValues()
    const mail = `${emailId}@${emailDomain}`

    setIsEmailVerificationLoading(true)

    try {
      const response = await axios.post(`${API_URL}/api/mail/send`, { mail })
      if (response.data.success) {
        setEmailStatus("sent")
        // Reset and start timer
        setTimeRemaining(300)
        setIsTimerActive(true)
        showModal(
          "이메일 전송 성공",
          response.data.message || "인증 이메일이 전송되었습니다. 5분 내에 인증을 완료해주세요.",
        )
      } else {
        showModal("이메일 전송 실패", `이메일 전송 실패: ${response.data.error || "알 수 없는 오류가 발생했습니다."}`)
      }
    } catch (error) {
      showModal("오류", `서버 요청 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류가 발생했습니다."}`)
    } finally {
      setIsEmailVerificationLoading(false)
    }
  }

  const verifyCodeHandler = async () => {
    const { emailId, emailDomain, verificationCode } = getValues()
    const mail = `${emailId}@${emailDomain}`
    const code = verificationCode

    if (!code) {
      showModal("입력 오류", "인증 코드를 입력해주세요.")
      return
    }

    try {
      const response = await axios.post(`${API_URL}/api/mail/verify`, { mail, code })
      if (response.data.success) {
        setEmailStatus("verified")
        setIsTimerActive(false)
        showModal("인증 성공", "이메일 인증이 성공적으로 완료되었습니다.")
      } else {
        showModal("인증 실패", `인증 실패: ${response.data.error || "인증 코드가 일치하지 않습니다."}`)
      }
    } catch (error) {
      showModal("오류", `서버 요청 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류가 발생했습니다."}`)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  // Modal component
  const Modal = () => {
    if (!isModalOpen) return null

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>{modalTitle}</h3>
          <p className={styles.modalMessage}>{modalMessage}</p>
          <button className={styles.modalButton} onClick={() => setIsModalOpen(false)}>
            확인
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles["signup-container"]}>
      <div className={styles["signup-card"]}>
        <div className={styles["signup-header"]}>
          <img src="/image/logo.png" alt="Finbuddy Logo" className={styles.logo} />
          <h2>회원 정보 입력</h2>
        </div>
        <div className={styles["signup-content"]}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* 이름 */}
            <div className={styles["form-group"]}>
              <label htmlFor="name">이름</label>
              <input
                id="name"
                {...register("name", {
                  required: "필수 입력 항목입니다.",
                  minLength: {
                    value: 2,
                    message: "이름은 최소 2자 이상이어야 합니다.",
                  },
                })}
              />
              {errors.name && <p className={styles["error-message"]}>{errors.name.message}</p>}
            </div>

            {/* 이메일 */}
            <div className={styles["form-group"]}>
              <label htmlFor="email">이메일</label>
              <div className={styles["email-group"]}>
                <div className={styles["email-input-group"]}>
                  <input
                    id="email"
                    {...register("emailId", { required: true })}
                    disabled={emailStatus === "verified"}
                  />
                  <span>@</span>
                  <input {...register("emailDomain", { required: true })} disabled={emailStatus === "verified"} />
                  <select onChange={handleDomainChange} defaultValue="custom" disabled={emailStatus === "verified"}>
                    <option value="custom">직접 입력</option>
                    <option value="gmail.com">gmail.com</option>
                    <option value="naver.com">naver.com</option>
                    <option value="daum.net">daum.net</option>
                    <option value="kakao.com">kakao.com</option>
                    <option value="hotmail.com">hotmail.com</option>
                  </select>
                </div>
                {emailStatus === "idle" && (
                  <button
                    type="button"
                    onClick={sendVerificationEmail}
                    disabled={!emailFilled || isEmailVerificationLoading}
                    className={styles["verification-button"]}
                  >
                    {isEmailVerificationLoading ? <div className={styles.buttonSpinner}></div> : "인증번호 발송"}
                  </button>
                )}
              </div>
            </div>

            {emailStatus === "sent" && (
              <div className={styles["form-group"]}>
                <label htmlFor="verificationCode">
                  인증번호 {isTimerActive && <span className={styles.timer}>{formatTime(timeRemaining)}</span>}
                </label>
                <div className={styles["email-group"]}>
                  <input
                    id="verificationCode"
                    placeholder="인증번호 입력"
                    {...register("verificationCode", { required: true })}
                  />
                  <button
                    type="button"
                    onClick={verifyCodeHandler}
                    className={styles["verification-button"]}
                    disabled={!isTimerActive}
                  >
                    인증번호 확인
                  </button>
                </div>
                {!isTimerActive && timeRemaining === 0 && (
                  <p className={styles["error-message"]}>
                    인증 시간이 만료되었습니다. 이메일 인증을 다시 요청해주세요.
                  </p>
                )}
              </div>
            )}

            {/* 비밀번호 */}
            <div className={styles["password-group"]}>
              <div className={styles["form-group"]}>
                <label htmlFor="password">비밀번호</label>
                <input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "필수 입력 항목입니다.",
                    minLength: {
                      value: 8,
                      message: "최소 8자 이상이어야 합니다.",
                    },
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).+$/,
                      message: "비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.",
                    },
                  })}
                />
                <p className={styles["password-hint"]}>영문, 숫자, 특수문자를 포함해야 합니다</p>
                {errors.password && <p className={styles["error-message"]}>{errors.password.message}</p>}
              </div>

              {/* 비밀번호 확인 */}
              <div className={styles["form-group"]}>
                <label htmlFor="passwordConfirm">비밀번호 확인</label>
                <input
                  id="passwordConfirm"
                  type="password"
                  {...register("passwordConfirm", {
                    required: "필수 입력 항목입니다.",
                    validate: (val) => val === password || "비밀번호가 일치하지 않습니다.",
                  })}
                />
                {errors.passwordConfirm && <p className={styles["error-message"]}>{errors.passwordConfirm.message}</p>}
              </div>
            </div>

            {/* 생년월일 */}
            <div className={styles["form-group"]}>
              <label>생년월일</label>
              <div className={styles["birth-date-group"]}>
                <select {...register("birthYear", { required: true })}>
                  <option value="">년도</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select {...register("birthMonth", { required: true })}>
                  <option value="">월</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}월
                    </option>
                  ))}
                </select>
                <select {...register("birthDay", { required: true })}>
                  <option value="">일</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}일
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles["info-row"]}>
              {/* 성별 */}
              <div className={styles["form-group"]}>
                <label htmlFor="sex">성별</label>
                <select id="sex" {...register("sex", { required: true })}>
                  <option value="">성별을 선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>

              {/* 직업 */}
              <div className={styles["form-group"]}>
                <label htmlFor="job">직업</label>
                <select id="job" {...register("job", { required: true })}>
                  <option value="">직업을 선택하세요</option>
                  <option value="student">학생</option>
                  <option value="employee">회사원</option>
                  <option value="self-employed">자영업</option>
                  <option value="freelancer">프리랜서</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>

            {/* 월 소득 */}
            <div className={styles["form-group"]}>
              <label htmlFor="income">월 소득</label>
              <select id="income" {...register("income", { required: true })}>
                <option value="">월 소득을 선택하세요</option>
                <option value="none">소득 없음</option>
                <option value="below_200">200만원 미만</option>
                <option value="between_200_400">200만원 이상 400만원 미만</option>
                <option value="between_400_600">400만원 이상 600만원 미만</option>
                <option value="above_600">600만원 이상</option>
              </select>
            </div>

            <button
              type="submit"
              className={styles["submit-button"]}
              disabled={!isValid || isSubmitting || emailStatus !== "verified"}
            >
              회원가입
            </button>
          </form>
        </div>
      </div>

      {/* Modal */}
      <Modal />
    </div>
  )
}

export default SignUp

