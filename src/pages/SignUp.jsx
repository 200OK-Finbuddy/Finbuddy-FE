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

  // Add a new state for agreement checkboxes after the other useState declarations
  const [agreements, setAgreements] = useState({
    termsOfService: false,
    privacyPolicy: false,
    marketingConsent: false,
  })

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

  // Add a function to handle checkbox changes
  const handleAgreementChange = (agreement) => {
    setAgreements((prev) => ({
      ...prev,
      [agreement]: !prev[agreement],
    }))
  }

  // Add a function to handle "agree to all"
  const handleAllAgreements = () => {
    const allChecked = Object.values(agreements).every((value) => value)
    setAgreements({
      termsOfService: !allChecked,
      privacyPolicy: !allChecked,
      marketingConsent: !allChecked,
    })
  }

  // Modify the onSubmit function to check for required agreements
  const onSubmit = async (data) => {
    if (emailStatus !== "verified") {
      showModal("인증 필요", "이메일 인증을 완료해주세요.")
      return
    }

    // Check if required agreements are accepted
    if (!agreements.termsOfService || !agreements.privacyPolicy) {
      showModal("약관 동의 필요", "필수 약관에 동의해주세요.")
      return
    }

    const { birthYear, birthMonth, birthDay, emailId, emailDomain, ...rest } = data
    const email = `${emailId}@${emailDomain}`
    const birthDate = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`

    const formData = {
      ...rest,
      email,
      birthDate,
      marketingConsent: agreements.marketingConsent,
    }
    console.log(formData)

    try {
      const response = await axios.post(`${API_URL}/api/signup`, formData)
      if (response.data.success) {
        showModal("회원가입 성공", "회원가입에 성공했습니다. 메인 페이지로 이동합니다.")
        // Set a timeout to allow the user to see the success message before redirecting
        setTimeout(() => {
          navigate("/")
        }, 2000)
      } else {
        showModal("회원가입 실패", `회원가입 실패: ${response.data.error}`)
      }
    } catch (error) {
      // Check if the error response contains the specific error message
      if (error.response && error.response.data && error.response.data.message === "이미 가입된 이메일입니다.") {
        showModal("회원가입 실패", "이미 가입된 이메일입니다.")
      } else if (error.response && error.response.data && error.response.data.message) {
        // Display any other error message from the server
        showModal("회원가입 실패", error.response.data.message)
      } else {
        // Generic error message as fallback
        showModal("오류", `서버 요청 중 오류가 발생했습니다: ${error.message}`)
      }
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

            {/* 약관 동의 섹션 */}
            <div className={styles["form-group"]}>
              <div className={styles["agreements-section"]}>
                <div className={styles["agreement-all"]}>
                  <label className={styles["agreement-label"]}>
                    <input
                      type="checkbox"
                      checked={Object.values(agreements).every((value) => value)}
                      onChange={handleAllAgreements}
                    />
                    <span>모든 약관에 동의합니다</span>
                  </label>
                </div>

                <div className={styles["agreement-items"]}>
                  <div className={styles["agreement-row"]}>
                    <label className={styles["agreement-label"]}>
                      <input
                        type="checkbox"
                        checked={agreements.termsOfService}
                        onChange={() => handleAgreementChange("termsOfService")}
                      />
                      <span className={styles["required"]}>서비스 이용약관 동의 (필수)</span>
                    </label>
                    <button
                      type="button"
                      className={styles["view-terms-button"]}
                      onClick={() =>
                        showModal(
                          "서비스 이용약관",
                          `제 1조 (목적)
                      이 약관은 핀버디(이하 "회사")가 제공하는 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

                      제 2조 (정의)
                      이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
                      1. "서비스"란 회사가 제공하는 금융 관리 서비스를 의미합니다.
                      2. "회원"이란 회사와 서비스 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 개인을 의미합니다.
                      3. "계정"이란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고 회사가 승인하는 이메일 주소와 비밀번호를 의미합니다.

                      제 3조 (약관의 효력 및 변경)
                      1. 회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
                      2. 회사는 필요한 경우 관련법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.`,
                        )
                      }
                    >
                      보기
                    </button>
                  </div>

                  <div className={styles["agreement-row"]}>
                    <label className={styles["agreement-label"]}>
                      <input
                        type="checkbox"
                        checked={agreements.privacyPolicy}
                        onChange={() => handleAgreementChange("privacyPolicy")}
                      />
                      <span className={styles["required"]}>개인정보 수집 및 이용 동의 (필수)</span>
                    </label>
                    <button
                      type="button"
                      className={styles["view-terms-button"]}
                      onClick={() =>
                        showModal(
                          "개인정보 수집 및 이용",
                          `1. 수집하는 개인정보 항목
                      - 필수항목: 이름, 이메일, 비밀번호, 생년월일, 성별, 직업, 소득 정보
                      - 선택항목: 마케팅 정보 수신 동의 여부

                      2. 개인정보의 수집 및 이용 목적
                      - 회원 가입 및 관리
                      - 서비스 제공 및 운영
                      - 서비스 이용 기록 분석 및 통계
                      - 맞춤형 금융 서비스 제공
                      - 고객 상담 및 불만 처리

                      3. 개인정보의 보유 및 이용 기간
                      - 회원 탈퇴 시까지 (단, 관련 법령에 따라 일정 기간 보관이 필요한 정보는 해당 기간 동안 보관)

                      4. 개인정보의 파기 절차 및 방법
                      - 회원 탈퇴 시 또는 보유기간 종료 후 즉시 파기
                      - 전자적 파일은 복구 불가능한 방법으로 영구 삭제하며, 종이 문서는 파쇄기로 파쇄`,
                        )
                      }
                    >
                      보기
                    </button>
                  </div>

                  <div className={styles["agreement-row"]}>
                    <label className={styles["agreement-label"]}>
                      <input
                        type="checkbox"
                        checked={agreements.marketingConsent}
                        onChange={() => handleAgreementChange("marketingConsent")}
                      />
                      <span>마케팅 정보 수신 동의 (선택)</span>
                    </label>
                    <button
                      type="button"
                      className={styles["view-terms-button"]}
                      onClick={() =>
                        showModal(
                          "마케팅 정보 수신",
                          `마케팅 정보 수신 동의 (선택)

                      1. 수집 및 이용 목적
                      - 새로운 서비스 및 이벤트 정보 제공
                      - 맞춤형 금융 상품 추천
                      - 혜택 및 프로모션 안내

                      2. 수신 정보 유형
                      - 금융 상품 및 서비스 안내
                      - 이벤트 및 프로모션 정보
                      - 서비스 업데이트 및 변경사항 안내

                      3. 전송 방법
                      - 이메일, SMS, 앱 푸시 알림 등

                      4. 동의 철회
                      - 마케팅 정보 수신 동의는 언제든지 회원 설정에서 변경하거나 고객센터를 통해 철회할 수 있습니다.
                      - 동의를 철회하더라도 서비스 이용에는 제한이 없습니다.`,
                        )
                      }
                    >
                      보기
                    </button>
                  </div>
                </div>
              </div>
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

