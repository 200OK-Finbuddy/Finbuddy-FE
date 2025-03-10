"use client"

import { useState } from "react"
import axios from "axios"
import styles from "../../styles/Transfer.module.css"
import PasswordInputKeypad from "../PasswordInputKeypad"
import ModalAlertModal from "./ModalAlertModal"
import API_URL from "../../config"
import authApi from "../../api/authApi"

// 이체 확인 모달 컴포넌트
const TransferConfirmModal = ({ 
  showTransferModal, 
  selectedAccount, 
  selectedBank, 
  accountNumber, 
  amount, 
  recipientMemo, 
  senderMemo, 
  handleCloseTransferModal,
  setResultModalType,
  setResultModalMessage,
  setShowResultModal,
  resetAllInputs,
}) => {
  const [modalPassword, setModalPassword] = useState("")
  const [modalResetPassword, setModalResetPassword] = useState(false)
  const [isPasswordVerified, setIsPasswordVerified] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  
  // 다른 상황을 위한 알림 모달은 유지
  const [modalAlertTitle, setModalAlertTitle] = useState("")
  const [modalAlertMessage, setModalAlertMessage] = useState("")
  const [modalAlertCallback, setModalAlertCallback] = useState(null)
  const [showModalAlertModal, setShowModalAlertModal] = useState(false)
  
  // OTP 인증 관련 상태
  const [transferStep, setTransferStep] = useState("password") // password, otp
  const [otpValue, setOtpValue] = useState("")
  const [otpError, setOtpError] = useState("")
  const [isOtpVerified, setIsOtpVerified] = useState(false)

  if (!showTransferModal) return null

  const showModalAlert = (title, message, callback = null) => {
    setModalAlertTitle(title)
    setModalAlertMessage(message)
    setModalAlertCallback(callback)
    setShowModalAlertModal(true)
  }

  const handleModalPasswordComplete = (value) => {
    setModalPassword(value)
    // 비밀번호가 변경되면 검증 상태를 초기화
    if (isPasswordVerified) {
      setIsPasswordVerified(false)
    }
  }

  const verifyPassword = async (accountId, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/accounts/verify-password`, {
        accountId,
        password,
      });
      
      return response.data.valid;
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  }

  // 비밀번호 검증
  const handlePasswordVerification = async () => {
    if (!modalPassword) {
      setPasswordError("비밀번호를 입력해주세요.")
      return
    }

    // 입력 시 에러 메시지 초기화
    setPasswordError("")

    // 비밀번호 검증
    const isValid = await verifyPassword(selectedAccount.accountId, modalPassword)

    if (isValid) {
      setIsPasswordVerified(true)
      // 비밀번호 확인 성공 시 다음 버튼이 활성화됨
    } else {
      setPasswordError("비밀번호가 일치하지 않습니다.")
      setModalPassword("")
      setModalResetPassword((prev) => !prev)
    }
  }
  
  // 다음 단계로 진행하는 함수
  const goToNextStep = () => {
    if (transferStep === "password" && isPasswordVerified) {
      setTransferStep("otp")
    }
  }
  
  // OTP 값 변경 핸들러
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "")
    if (value.length <= 6) {
      setOtpValue(value)
      // 입력 시 에러 메시지 초기화
      if (otpError) setOtpError("")
    }
  }
  
  // OTP 검증 함수
  const verifyOtp = async () => {
    try {
      const response = await authApi.post("/api/otp/verify", {
        otpCode: otpValue
      });
      
      // axios는 성공 시 자동으로 상태 코드를 확인하므로 추가 확인 불필요
      // 성공 응답 (200-299 상태 코드)
      return true;
    } catch (error) {
      // axios는 HTTP 에러 응답(4xx, 5xx)을 catch에서 처리
      console.error("OTP 검증 실패:", error.response ? error.response.status : error.message);
      return false;
    }
  }
  
  // OTP 확인 버튼 핸들러
  const handleOtpVerification = async () => {
    if (!otpValue || otpValue.length < 6) {
      setOtpError("6자리 OTP 번호를 입력해주세요.");
      return;
    }
    
    try {
      setOtpError(""); // 오류 메시지 초기화
      const isValid = await verifyOtp();
      
      if (isValid) {
        setIsOtpVerified(true);
      } else {
        setOtpError("잘못된 OTP 번호입니다. 다시 확인해주세요.");
        setOtpValue("");
      }
    } catch (error) {
      console.error("OTP 검증 중 오류:", error);
      setOtpError("OTP 인증 중 오류가 발생했습니다. 다시 시도해주세요.");
      setOtpValue("");
    }
  }

  const handleModalSubmit = async () => {
    // OTP 인증이 되지 않았다면 이체를 진행하지 않음
    if (transferStep === "otp" && !isOtpVerified) {
      setOtpError("OTP 인증을 완료해주세요.");
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_URL}/api/transfers`,
        {
          fromAccountId: selectedAccount.accountId,
          toBankName: selectedBank,
          toAccountNumber: accountNumber,
          amount: Number(amount.replace(/,/g, "")),
          password: modalPassword,
          senderName: recipientMemo,
          receiverName: senderMemo,
          otpValue: otpValue, // OTP 값 추가
        },
        {
          withCredentials: true, // 쿠키 및 인증 정보 포함
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      // 이체 성공 시 모달 닫기
      handleCloseTransferModal();

      // 성공 결과 모달 표시
      setResultModalType("success");
      setResultModalMessage("이체가 성공적으로 완료되었습니다.");
      setShowResultModal(true);

      // 입력값 초기화
      resetAllInputs();
    } catch (error) {
      console.error("Error during transfer:", error);

      // 이체 실패 시 모달 닫기
      handleCloseTransferModal();

      // 실패 결과 모달 표시
      setResultModalType("error");
      setResultModalMessage("이체 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowResultModal(true);

      // 상태 초기화
      setModalPassword("");
      setModalResetPassword((prev) => !prev);
      setIsPasswordVerified(false);
      setTransferStep("password");
      setOtpValue("");
      setIsOtpVerified(false);
    }
  }

  const handleResetModal = () => {
    handleCloseTransferModal()
    setModalPassword("")
    setModalResetPassword((prev) => !prev)
    setIsPasswordVerified(false)
    setPasswordError("")
    setTransferStep("password")
    setOtpValue("")
    setOtpError("")
    setIsOtpVerified(false)
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>이체 확인</h3>
        <div className={styles.modalInfo}>
          <div className={styles.modalInfoItem}>
            <span className={styles.modalLabel}>출금계좌</span>
            <span className={styles.modalValue}>
              {selectedAccount?.bankName} {selectedAccount?.accountNumber}
            </span>
          </div>
          <div className={styles.modalInfoItem}>
            <span className={styles.modalLabel}>입금계좌</span>
            <span className={styles.modalValue}>
              {selectedBank} {accountNumber}
            </span>
          </div>
          <div className={styles.modalInfoItem}>
            <span className={styles.modalLabel}>이체금액</span>
            <span className={styles.modalValue}>{amount}원</span>
          </div>
          {recipientMemo && (
            <div className={styles.modalInfoItem}>
              <span className={styles.modalLabel}>받는분 통장 표시</span>
              <span className={styles.modalValue}>{recipientMemo}</span>
            </div>
          )}
          {senderMemo && (
            <div className={styles.modalInfoItem}>
              <span className={styles.modalLabel}>내 통장 표시</span>
              <span className={styles.modalValue}>{senderMemo}</span>
            </div>
          )}
        </div>

        {/* 단계별 UI */}
        {transferStep === "password" && (
          <div className={styles.modalPasswordSection}>
            <label className={styles.modalLabel}>비밀번호</label>
            {isPasswordVerified ? (
              <div className={styles.verifiedPasswordDisplay}>
                <div className={styles.passwordDots}>{Array(modalPassword.length).fill("●").join("")}</div>
                <div className={styles.passwordVerifiedMessage}>비밀번호 확인 완료</div>
              </div>
            ) : (
              <div style={{ position: "relative", zIndex: 20 }}>
                <PasswordInputKeypad onPasswordComplete={handleModalPasswordComplete} reset={modalResetPassword} />
                {passwordError && (
                  <div className={styles.passwordError}>{passwordError}</div>
                )}
                <button
                  className={styles.modalVerifyButton}
                  onClick={handlePasswordVerification}
                  disabled={!modalPassword}
                >
                  비밀번호 확인
                </button>
              </div>
            )}
          </div>
        )}

        {transferStep === "otp" && (
          <div className={styles.modalOtpSection}>
            <label className={styles.modalLabel}>OTP 인증</label>
            <div className={styles.otpInputWrapper}>
              <input
                type="text"
                className={styles.otpInput}
                placeholder="6자리 OTP 번호 입력"
                value={otpValue}
                onChange={handleOtpChange}
                maxLength={6}
              />
              {otpError && (
                <div className={styles.otpError}>{otpError}</div>
              )}
              {isOtpVerified && (
                <div className={styles.otpVerifiedMessage}>OTP 인증 완료</div>
              )}
              {!isOtpVerified && (
                <button
                  className={styles.modalVerifyButton}
                  onClick={handleOtpVerification}
                  disabled={!otpValue || otpValue.length < 6}
                >
                  OTP 확인
                </button>
              )}
            </div>
            <div className={styles.otpDescription}>
              OTP 인증 애플리케이션에서 생성된 6자리 코드를 입력하세요.
            </div>
          </div>
        )}

        <div className={styles.modalActions}>
          <button
            className={styles.modalCancelButton}
            onClick={handleResetModal}
          >
            취소
          </button>
          
          {transferStep === "password" && (
            <button 
              className={styles.modalNextButton} 
              onClick={goToNextStep} 
              disabled={!isPasswordVerified}
            >
              다음
            </button>
          )}
          
          {transferStep === "otp" && (
            <button 
              className={styles.modalSubmitButton} 
              onClick={handleModalSubmit} 
              disabled={!isOtpVerified}
            >
              이체
            </button>
          )}
        </div>
      </div>
      <ModalAlertModal 
        showModalAlertModal={showModalAlertModal}
        modalAlertTitle={modalAlertTitle}
        modalAlertMessage={modalAlertMessage}
        modalAlertCallback={modalAlertCallback}
        setShowModalAlertModal={setShowModalAlertModal}
      />
    </div>
  )
}

export default TransferConfirmModal