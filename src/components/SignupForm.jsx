"use client"

import { useState, useEffect } from "react"
import "../styles/SignupForm.css"

function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    gender: "",
    job: "",
    income: "",
  })

  const [emailLocal, setEmailLocal] = useState("")
  const [emailDomain, setEmailDomain] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("직접입력")
  const [verificationCode, setVerificationCode] = useState("")
  const [showVerification, setShowVerification] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState(null)
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [passwordValid, setPasswordValid] = useState(true)

  // 폼 유효성 검사를 위한 새로운 state 추가
  const [formValid, setFormValid] = useState({
    name: false,
    email: false,
    emailVerified: false,
    password: false,
    passwordMatch: false,
    birthDate: false,
    gender: false,
    job: false,
    income: false,
  })

  // 디버깅을 위한 useEffect 추가
  useEffect(() => {
    console.log("Form Validation State:", formValid)
  }, [formValid])

  // 전체 폼의 유효성을 확인하는 함수
  const isFormValid = () => {
    const validationResult = Object.values(formValid).every((valid) => valid)
    console.log("Form validation result:", validationResult)
    return validationResult
  }

  // 이름 유효성 검사
  const validateName = (name) => {
    return name.trim().length >= 2
  }

  // 생년월일 유효성 검사
  const validateBirthDate = (data = formData) => {
    return !!(data.birthYear && data.birthMonth && data.birthDay)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const domains = ["직접입력", "gmail.com", "naver.com", "daum.net", "kakao.com", "hotmail.com"]

  const handleEmailLocalChange = (value) => {
    setEmailLocal(value)
    updateEmail(value, emailDomain)
  }

  const handleDomainChange = (value) => {
    setSelectedDomain(value)
    if (value === "직접입력") {
      setEmailDomain("")
    } else {
      setEmailDomain(value)
      updateEmail(emailLocal, value)
    }
  }

  const handleCustomDomainChange = (value) => {
    setEmailDomain(value)
    updateEmail(emailLocal, value)
  }

  const updateEmail = (local, domain) => {
    if (local && domain) {
      const email = `${local}@${domain}`
      setFormData((prev) => ({
        ...prev,
        email: email,
      }))
      setFormValid((prev) => ({ ...prev, email: true }))
    } else {
      setFormValid((prev) => ({ ...prev, email: false }))
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // 각 필드별 유효성 검사
    switch (field) {
      case "name":
        setFormValid((prev) => ({ ...prev, name: validateName(value) }))
        break
      case "birthYear":
      case "birthMonth":
      case "birthDay":
        const newBirthDate =
          field === "birthYear"
            ? { ...formData, birthYear: value }
            : field === "birthMonth"
              ? { ...formData, birthMonth: value }
              : { ...formData, birthDay: value }

        setFormValid((prev) => ({
          ...prev,
          birthDate: validateBirthDate(newBirthDate),
        }))
        break
      case "gender":
        setFormValid((prev) => ({ ...prev, gender: !!value }))
        break
      case "job":
        setFormValid((prev) => ({ ...prev, job: !!value }))
        break
      case "income":
        setFormValid((prev) => ({ ...prev, income: !!value }))
        break
    }
  }

  const validatePassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    return hasLetter && hasNumber && hasSpecial
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    handleInputChange("password", newPassword)
    const isValid = validatePassword(newPassword)
    setPasswordValid(isValid)
    const matches = newPassword === formData.confirmPassword
    setPasswordMatch(matches)
    setFormValid((prev) => ({
      ...prev,
      password: isValid,
      passwordMatch: matches && isValid,
    }))
  }

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value
    handleInputChange("confirmPassword", confirmPassword)
    const matches = formData.password === confirmPassword
    setPasswordMatch(matches)
    setFormValid((prev) => ({ ...prev, passwordMatch: matches }))
  }

  const handleSendVerification = async () => {
    if (!formData.email) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mail: formData.email }),
      })

      const data = await response.json()
      if (data.success) {
        setShowVerification(true)
        setVerificationStatus("인증번호가 발송되었습니다.")
      } else {
        setError(data.error || "인증번호 발송에 실패했습니다.")
      }
    } catch (error) {
      setError("서버 연결에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!formData.email || !verificationCode) return

    setIsLoading(true)
    setError(null)

    try {
      // 테스트를 위해 임시로 항상 성공하도록 수정
      // const response = await fetch('/api/mail/verify', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ mail: formData.email, code: verificationCode }),
      // })

      // const data = await response.json()
      // setVerificationStatus(data.message)
      // setIsVerified(data.success)
      // setFormValid(prev => ({ ...prev, emailVerified: data.success }))

      // 테스트용 코드
      setVerificationStatus("인증되었습니다")
      setIsVerified(true)
      setFormValid((prev) => ({ ...prev, emailVerified: true }))
    } catch (error) {
      setError("인증 확인에 실패했습니다.")
      setIsVerified(false)
      setFormValid((prev) => ({ ...prev, emailVerified: false }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isVerified) {
      setError("이메일 인증이 필요합니다.")
      return
    }

    if (!passwordValid) {
      setError("비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.")
      return
    }

    if (!passwordMatch) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        window.location.href = "/login"
      } else {
        const data = await response.json()
        setError(data.message || "회원가입에 실패했습니다.")
      }
    } catch (error) {
      setError("서버 연결에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <img alt="Finbuddy Logo" className="logo" />
          <h2>회원 정보 입력</h2>
        </div>
        <div className="signup-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group name-input">
              <label htmlFor="name">이름</label>
              <input
                id="name"
                type="text"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <div className="email-group">
                <div className="email-input-group">
                  <input
                    type="text"
                    value={emailLocal}
                    onChange={(e) => handleEmailLocalChange(e.target.value)}
                    placeholder="이메일"
                    disabled={isVerified}
                    required
                  />
                  <span>@</span>
                  {selectedDomain === "직접입력" ? (
                    <input
                      type="text"
                      value={emailDomain}
                      onChange={(e) => handleCustomDomainChange(e.target.value)}
                      placeholder="도메인 입력"
                      disabled={isVerified}
                      required
                    />
                  ) : (
                    <input type="text" value={emailDomain} readOnly disabled />
                  )}
                  <select
                    value={selectedDomain}
                    onChange={(e) => handleDomainChange(e.target.value)}
                    disabled={isVerified}
                  >
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={isLoading || !formData.email || isVerified}
                  className="verification-button"
                >
                  인증번호 발송
                </button>
              </div>
            </div>

            {showVerification && !isVerified && (
              <div className="form-group">
                <label htmlFor="verification">인증번호</label>
                <div className="email-group">
                  <input
                    id="verification"
                    type="text"
                    placeholder="인증번호를 입력하세요"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isLoading || !verificationCode}
                    className="verification-button"
                  >
                    확인
                  </button>
                </div>
                {verificationStatus && (
                  <p className={`verification-status ${verificationStatus.includes("일치") ? "success" : "error"}`}>
                    {verificationStatus}
                  </p>
                )}
              </div>
            )}

            <div className="password-group">
              <div className="form-group">
                <label htmlFor="password">비밀번호</label>
                <input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  required
                />
                <p className="password-hint">영문, 숫자, 특수문자를 포함해야 합니다</p>
                {!passwordValid && formData.password && (
                  <p className="password-error">비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">비밀번호 확인</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
                {!passwordMatch && formData.confirmPassword && (
                  <p className="password-error">비밀번호가 일치하지 않습니다</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>생년월일</label>
              <div className="birth-date-group">
                <select value={formData.birthYear} onChange={(e) => handleInputChange("birthYear", e.target.value)}>
                  <option value="">년도</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select value={formData.birthMonth} onChange={(e) => handleInputChange("birthMonth", e.target.value)}>
                  <option value="">월</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}월
                    </option>
                  ))}
                </select>
                <select value={formData.birthDay} onChange={(e) => handleInputChange("birthDay", e.target.value)}>
                  <option value="">일</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}일
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="info-row">
              <div className="form-group">
                <label htmlFor="gender">성별</label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                >
                  <option value="">성별을 선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="job">직업</label>
                <select id="job" value={formData.job} onChange={(e) => handleInputChange("job", e.target.value)}>
                  <option value="">직업을 선택하세요</option>
                  <option value="student">학생</option>
                  <option value="employee">회사원</option>
                  <option value="self-employed">자영업</option>
                  <option value="freelancer">프리랜서</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="income">월 소득</label>
              <select id="income" value={formData.income} onChange={(e) => handleInputChange("income", e.target.value)}>
                <option value="">월 소득을 선택하세요</option>
                <option value="0">소득 없음</option>
                <option value="1">200만원 미만</option>
                <option value="2">200만원 이상 400만원 미만</option>
                <option value="3">400만원 이상 600만원 미만</option>
                <option value="4">600만원 이상</option>
              </select>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="submit-button" disabled={isLoading || !isFormValid()}>
              {isLoading ? "처리중..." : "회원가입"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignupForm

