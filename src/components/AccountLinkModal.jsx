"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Check, Loader } from "lucide-react"
import Modal from "./Modal"
import axios from "axios"
import PropTypes from "prop-types"
import "../styles/AccountLinkModal.css"

const AccountLinkModal = ({ isOpen, onClose, memberId }) => {
  const navigate = useNavigate()
  const [agreements, setAgreements] = useState({
    personalInfo: false,
    thirdParty: false,
    dataUsage: false,
    marketing: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // 모달이 열릴 때마다 체크박스 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setAgreements({
        personalInfo: false,
        thirdParty: false,
        dataUsage: false,
        marketing: false,
      })
      setError(null)
      setSuccess(false)
      setLoading(false)
    }
  }, [isOpen])

  const handleAgreementChange = (agreement) => {
    setAgreements({
      ...agreements,
      [agreement]: !agreements[agreement],
    })
  }

  const handleAllAgreements = () => {
    const allChecked = Object.values(agreements).every((value) => value)
    const newValue = !allChecked

    const updatedAgreements = {}
    Object.keys(agreements).forEach((key) => {
      updatedAgreements[key] = newValue
    })

    setAgreements(updatedAgreements)
  }

  const areRequiredAgreementsChecked = () => {
    // 마케팅 동의는 선택사항으로 가정
    return agreements.personalInfo && agreements.thirdParty && agreements.dataUsage
  }

  const handleSubmit = async () => {
    if (!areRequiredAgreementsChecked()) {
      setError("필수 항목에 모두 동의해주세요.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(`/api/mydata/generate/${memberId}`)

      if (response.data.success) {
        setSuccess(true)
        // 성공 후 3초 후에 대시보드로 이동
        setTimeout(() => {
          onClose()
          navigate("/dashboard")
        }, 3000)
      } else {
        setError(response.data.message || "계좌 연동 중 오류가 발생했습니다.")
        setLoading(false)
      }
    } catch (error) {
      setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
      console.error("API 호출 오류:", error)
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="계좌 연동 동의">
      <div className="account-link-modal">
        {!loading && !success && (
          <>
            <div className="agreement-intro">
              <p>핀버디 서비스를 이용하기 위해 다음 항목에 동의해주세요.</p>
            </div>

            <div className="agreement-all">
              <label className="agreement-label">
                <input
                  type="checkbox"
                  checked={Object.values(agreements).every((value) => value)}
                  onChange={handleAllAgreements}
                />
                <span>모든 항목에 동의합니다</span>
              </label>
            </div>

            <div className="agreement-items">
              <label className="agreement-label">
                <input
                  type="checkbox"
                  checked={agreements.personalInfo}
                  onChange={() => handleAgreementChange("personalInfo")}
                />
                <span className="required">개인정보 수집 및 이용 동의 (필수)</span>
              </label>
              <p className="agreement-detail">
                핀버디는 서비스 제공을 위해 필요한 최소한의 개인정보를 수집합니다. 수집된 정보는 서비스 제공 및 개선,
                신규 서비스 개발 등에 사용됩니다.
              </p>

              <label className="agreement-label">
                <input
                  type="checkbox"
                  checked={agreements.thirdParty}
                  onChange={() => handleAgreementChange("thirdParty")}
                />
                <span className="required">제3자 정보제공 동의 (필수)</span>
              </label>
              <p className="agreement-detail">
                금융 정보 조회 및 분석을 위해 금융기관에 회원님의 정보를 제공하고 금융기관으로부터 계좌 정보를 제공받는
                것에 동의합니다.
              </p>

              <label className="agreement-label">
                <input
                  type="checkbox"
                  checked={agreements.dataUsage}
                  onChange={() => handleAgreementChange("dataUsage")}
                />
                <span className="required">금융 데이터 활용 동의 (필수)</span>
              </label>
              <p className="agreement-detail">
                회원님의 금융 데이터를 분석하여 맞춤형 금융 서비스 및 상품 추천에 활용하는 것에 동의합니다.
              </p>

              <label className="agreement-label">
                <input
                  type="checkbox"
                  checked={agreements.marketing}
                  onChange={() => handleAgreementChange("marketing")}
                />
                <span>마케팅 정보 수신 동의 (선택)</span>
              </label>
              <p className="agreement-detail">
                핀버디의 새로운 서비스 및 이벤트 정보를 이메일, SMS 등을 통해 받아보는 것에 동의합니다.
              </p>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="modal-actions">
              <button className="cancel-button" onClick={onClose}>
                취소
              </button>
              <button className="confirm-button" onClick={handleSubmit} disabled={!areRequiredAgreementsChecked()}>
                확인
              </button>
            </div>
          </>
        )}

        {loading && !success && (
          <div className="loading-container">
            <Loader className="loading-spinner" />
            <h3>계좌 정보를 불러오는 중입니다</h3>
            <p>잠시만 기다려 주세요. 이 과정은 최대 1분 정도 소요될 수 있습니다.</p>
          </div>
        )}

        {success && (
          <div className="success-container">
            <div className="success-icon">
              <Check size={48} />
            </div>
            <h3>계좌 연동이 완료되었습니다!</h3>
            <p>대시보드로 이동합니다...</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

AccountLinkModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  memberId: PropTypes.number.isRequired,
}

export default AccountLinkModal

