import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

function SingUp() {
    const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting, isValid } } = useForm({mode: "onBlur"});
    const [emailStatus, setEmailStatus] = useState('idle'); // idle | sent | verified
    
    const watchedFields = watch(["emailId", "emailDomain"]);
    const emailFilled = watchedFields.every(Boolean);
    
    const password = watch("password");

    const onSubmit = async (data) => {
        if (emailStatus !== 'verified') {
            alert('이메일 인증을 완료해주세요.');
            return;
        }
    
        const { birthYear, birthMonth, birthDay, emailId, emailDomain, ...rest } = data;
        const email = `${emailId}@${emailDomain}`;
        const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
                            .toISOString()
                            .slice(0, 10); // yyyy-MM-dd
    
        const formData = {
            ...rest,
            email,
            birthDate
        };
        console.log(formData);

        try {
            const response = await axios.post("http://localhost:8080/api/signup", formData);
            if (response.data.success) {
                alert('회원가입에 성공했습니다.');
            } else {
                alert(`회원가입 실패: ${response.data.error}`);
            }
        } catch (error) {
            alert(`서버 요청 중 오류가 발생했습니다: ${error.message}`);
        }
    };
    

    const handleDomainChange = (e) => {
        const value = e.target.value;

        if (value === "custom") {
            // '직접입력'일 때, 도메인 필드를 초기화하여 사용자가 입력하도록 함
            setValue("emailDomain", "");
        } else {
            // 사용자가 선택한 도메인으로 입력 필드를 채움
            setValue("emailDomain", value);
        }
    };

    const sendVerificationEmail = async () => {
        const { emailId, emailDomain } = getValues();
        const mail = `${emailId}@${emailDomain}`;
        try {
            const response = await axios.post("http://localhost:8080/api/mail/send", { mail })
            if (response.data.success) {
                setEmailStatus('sent');
                alert(response.data.message);
            } else {
                alert(`이메일 전송 실패: ${response.data.error}`);
            }
        } catch (error) {
            alert(`인증번호 발송 실패: ${error}`);
        }
    };

    const verifyCodeHandler = async () => {
        const { emailId, emailDomain, verificationCode } = getValues();
        const mail = `${emailId}@${emailDomain}`;
        const code = verificationCode;
        try {
            const response = await axios.post('http://localhost:8080/api/mail/verify', { mail, code });
            if (response.data.success) {
                setEmailStatus('verified');
                alert('이메일 인증 성공!');
            } else {
                alert(`인증 실패: ${response.data.error}`);
            }
        } catch (error) {
            alert('서버 요청 중 오류가 발생했습니다.');
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return ( <>
        <form onSubmit={handleSubmit(onSubmit)} >
            {/* 이름 */}
            <label htmlFor="name">이름</label>
            <input id="name" {...register("name",{
                required: '필수 입력 항목입니다.',
                minLength: {
                    value: 2,
                    message: '이름은 최소 2자 이상이어야 합니다.'
                }})} />
                {errors.name && <p>{errors.name.message}</p>}
            
            {/* 이메일 */}
            <label htmlFor="email">이메일</label>
            <input id="email" {...register("emailId",{ required: true})} />
            <span>@</span>
            <input {...register("emailDomain", {
                required: true
            })}/>
            <select onChange={handleDomainChange} defaultValue="custom">
                <option value="custom">직접 입력</option>
                <option value="gmail.com">gmail.com</option>
                <option value="naver.com">naver.com</option>
                <option value="daum.net">daum.net</option>
                <option value="kakao.com">kakao.com</option>
                <option value="hotmail.com">hotmail.com</option>
            </select>
            {emailStatus === 'idle' && <button type="button" onClick={sendVerificationEmail} disabled={!emailFilled}>인증번호 발송</button>}
            {emailStatus === 'sent' && (
                <>
                    <label htmlFor="verificationCode">인증번호</label>
                    <input id="verificationCode" placeholder="인증번호 입력" {...register("verificationCode", { required: true })} />
                    <button type="button" onClick={verifyCodeHandler}>인증번호 확인</button>
                </>
            )}

            {/* 비밀번호 */}
            <label htmlFor="password">비밀번호</label>
            <input id="password" type="password" {...register("password",{
                required: '필수 입력 항목입니다.',
                minLength: {
                    value: 8,
                    message: '최소 8자 이상이어야 합니다.'
                },
                pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).+$/ ,
                    message: '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.'
                }})} />
                {errors.password && <p>{errors.password.message}</p>}

            {/* 비밀번호 확인 */}
            <label htmlFor="passwordConfirm">비밀번호 확인</label>
            <input id="passwordConfirm" type="password" {...register("passwordConfirm",{
                required: '필수 입력 항목입니다.',
                validate: (val) => val === password || '비밀번호가 일치하지 않습니다.'
            })} />
            {errors.passwordConfirm && <p>{errors.passwordConfirm.message}</p>}

            {/* 생년월일 */}
            <label>생년월일</label>
            <select {...register("birthYear", { required: true })}>
                <option value="">년도</option>
                {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
            <select {...register("birthMonth", { required: true })}>
            <option value="">월</option>
            {months.map(month => (
                <option key={month} value={month}>{month}</option>
            ))}
            </select>
            <select {...register("birthDay", { required: true })}>
            <option value="">일</option>
            {days.map(day => (
                <option key={day} value={day}>{day}</option>
            ))}
            </select>

            {/* 성별 */}
            <label htmlFor="sex">성별</label>
            <select id="sex" {...register("sex", { required: true })}>
                <option value="">성별을 선택하세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
            </select>

            {/* 직업 */}
            <label htmlFor="job">직업</label>
            <select id="job" {...register("job", { required: true })}>
                <option value="">직업을 선택하세요</option>
                <option value="student">학생</option>
                <option value="employee">회사원</option>
                <option value="self-employed">자영업</option>
                <option value="freelancer">프리랜서</option>
                <option value="other">기타</option>
            </select>

            {/* 월 소득 */}
            <label htmlFor="income">월 소득</label>
                <select id="income" {...register("income", {required: true})}>
                    <option value="">월 소득을 선택하세요</option>
                    <option value="0">소득 없음</option>
                    <option value="1">200만원 미만</option>
                    <option value="2">200만원 이상 400만원 미만</option>
                    <option value="3">400만원 이상 600만원 미만</option>
                    <option value="4">600만원 이상</option>
                </select>

            <button type="submit" disabled={ !isValid || isSubmitting || emailStatus !== 'verified'}>회원가입</button>
        </form>
    </> );
}

export default SingUp;