import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import axios from "axios"
import otpStyles from "../styles/OtpRegisterModal.module.css"
import authApi from "../api/authApi"

function OtpRegisterModal() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isOpen, setIsOpen] = useState(true)
    const [qrCodeData, setQrCodeData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [totpCode, setTotpCode] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationError, setVerificationError] = useState(null)
    const [isVerified, setIsVerified] = useState(false)

    const handleClose = () => {
        setIsOpen(false)
    }

    const handleNext = () => {
        if (currentStep < 4) {
        if (currentStep === 3) {
            verifyTotpCode()
            return
        }
        setCurrentStep(currentStep + 1)
        }
    }

    const handleComplete = () => {
        setIsOpen(false)
    }

    useEffect(() => {
        if (currentStep === 2 && !qrCodeData) {
        const fetchQrCodeData = async () => {
            setIsLoading(true)
            setError(null)
            try {
            const response = await authApi.get("/api/otp/register")
            setQrCodeData(response.data)
            // console.log(response.data)
            } catch (err) {
            console.error("OTP 등록 오류:", err)
            setError(err.response?.data?.message || err.message || "OTP 등록 중 오류가 발생했습니다.")
            } finally {
            setIsLoading(false)
            }
        }

        fetchQrCodeData()
        }
    }, [currentStep, qrCodeData])

    const verifyTotpCode = async () => {
        if (totpCode.length !== 6) {
        setVerificationError("6자리 코드를 입력해주세요.")
        return
        }

        setIsVerifying(true)
        setVerificationError(null)

        try {
        const response = await authApi.post("/api/otp/register/verify", { otpCode: totpCode })
        setIsVerified(true)
        // 인증 성공 시 다음 단계로 이동
        setCurrentStep(currentStep + 1)
        } catch (err) {
        console.error("TOTP 인증 오류:", err)
        setVerificationError("다시 입력하세요")
        setTotpCode("")
        } finally {
        setIsVerifying(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className={otpStyles.overlay}>
        <div className={otpStyles.modal}>
            <button onClick={handleClose} className={otpStyles.closeButton}>
            <X className={otpStyles.closeIcon} />
            </button>

            <div className={otpStyles.header}>
            <div className={otpStyles.logoContainer}>
                <div className={otpStyles.logo}>
                G<span className={otpStyles.logoPlus}>+</span>
                </div>
            </div>
            <h2 className={otpStyles.title}>TOTP 설정</h2>

            <div className={otpStyles.progressContainer}>
                <div className={otpStyles.stepItem}>
                <div className={currentStep >= 1 ? otpStyles.stepActive : otpStyles.stepInactive}>
                    {currentStep > 1 ? <Check className={otpStyles.checkIcon} /> : "1"}
                </div>
                <div className={otpStyles.stepLabel}>어플 설치</div>
                </div>
                <div className={currentStep > 1 ? otpStyles.connectorActive : otpStyles.connectorInactive} />

                <div className={otpStyles.stepItem}>
                <div className={currentStep >= 2 ? otpStyles.stepActive : otpStyles.stepInactive}>
                    {currentStep > 2 ? <Check className={otpStyles.checkIcon} /> : "2"}
                </div>
                <div className={otpStyles.stepLabel}>TOTP 설정</div>
                </div>
                <div className={currentStep > 2 ? otpStyles.connectorActive : otpStyles.connectorInactive} />

                <div className={otpStyles.stepItem}>
                <div className={currentStep >= 3 ? otpStyles.stepActive : otpStyles.stepInactive}>
                    {currentStep > 3 ? <Check className={otpStyles.checkIcon} /> : "3"}
                </div>
                <div className={otpStyles.stepLabel}>TOTP 인증</div>
                </div>
                <div className={currentStep > 3 ? otpStyles.connectorActive : otpStyles.connectorInactive} />

                <div className={otpStyles.stepItem}>
                <div className={currentStep >= 4 ? otpStyles.stepActive : otpStyles.stepInactive}>
                    {currentStep > 4 ? <Check className={otpStyles.checkIcon} /> : "4"}
                </div>
                <div className={otpStyles.stepLabel}>설정 완료</div>
                </div>
            </div>
            </div>

            <div className={otpStyles.content}>
            {currentStep === 1 && (
                <div className={otpStyles.stepContent}>
                <div className={otpStyles.infoMessage}>
                    이체 기능을 이용하시려면 OTP를 등록하셔야합니다.
                    <br />
                    Google Authenticator를 설치하세요.
                </div>
                </div>
            )}

            {currentStep === 2 && (
                <div className={otpStyles.stepContent}>
                {isLoading ? (
                    <div className={otpStyles.loadingContainer}>
                    <p>OTP 정보를 생성하는 중입니다...</p>
                    </div>
                ) : error ? (
                    <div className={otpStyles.errorContainer}>
                    <p className={otpStyles.errorMessage}>{error}</p>
                    <button
                        onClick={() => {
                        setQrCodeData(null) // Reset data to trigger a new fetch
                        }}
                        className={otpStyles.retryButton}
                    >
                        다시 시도
                    </button>
                    </div>
                ) : qrCodeData ? (
                    <>
                    {/* QR 코드 표시 */}
                    <img
                        src={qrCodeData || "/placeholder.svg?height=200&width=200"}
                        alt="TOTP QR Code"
                        className={otpStyles.qrCode}
                    />

                    <div className={otpStyles.instructionList}>
                        Google Authenticator에서 QR 코드를 스캔하세요.
                    </div>
                    </>
                ) : (
                    <p>OTP 데이터를 불러오는 중 오류가 발생했습니다.</p>
                )}
                </div>
            )}

            {currentStep === 3 && (
                <div className={otpStyles.stepContent}>
                <div className={otpStyles.totpLabel}>TOTP</div>
                <input
                    type="text"
                    className={otpStyles.totpInput}
                    value={totpCode}
                    onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    if (value.length <= 6) {
                        setTotpCode(value)
                        if (isVerified) {
                        setIsVerified(false)
                        }
                    }
                    }}
                    placeholder="6자리 코드 입력"
                    maxLength={6}
                />
                {verificationError && <div className={otpStyles.verificationError}>{verificationError}</div>}
                {isVerified && <div className={otpStyles.verificationSuccess}>인증 성공!</div>}
                <div className={otpStyles.totpInstruction}>인증키에 6자리 TOTP 코드를 입력하세요.</div>
                </div>
            )}

            {currentStep === 4 && (
                <div className={otpStyles.completeStep}>
                <div className={otpStyles.completeIcon}>
                    <Check className={otpStyles.largeCheckIcon} />
                </div>
                <div className={otpStyles.completeText}>TOTP 설정 완료</div>
                </div>
            )}
            </div>

            <div className={otpStyles.footer}>
            {currentStep < 4 ? (
                <>
                <button
                    onClick={handleNext}
                    className={otpStyles.nextButton}
                    disabled={
                    (currentStep === 3 && (totpCode.length !== 6 || isVerifying)) || (currentStep === 2 && isLoading)
                    }
                >
                    {currentStep === 3 ? (isVerifying ? "인증 중..." : "인증하기") : "다음"}
                </button>
                </>
            ) : (
                <button onClick={handleComplete} className={otpStyles.completeButton}>
                완료
                </button>
            )}
            </div>
        </div>
        </div>
    )
    }

export default OtpRegisterModal;