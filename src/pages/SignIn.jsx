"use client"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import authApi from "../api/authApi"
import styles from "../styles/SignIn.module.css"

function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const navigate = useNavigate()
  // const { setAccessToken } = useAuth();

  const onSubmit = async (data) => {
    try {
      const response = await authApi.post(`/api/auth/signin`, data, {
        withCredentials: true,
      })
      // console.log(response.data);
      // setAccessToken(response.data.accessToken);
      navigate("/")
    } catch (error) {
      console.error(error)
    }
  }

  const goToSignUp = () => {
    navigate("/signup");
};

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>로그인</h1>
          <p>안녕하세요! 계정 정보를 입력해주세요.</p>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
              {...register("email", {
                required: "이메일을 입력해주세요.",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "유효한 이메일 형식을 입력해주세요.",
                },
              })}
            />
            {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              {...register("password", {
                required: "비밀번호를 입력해주세요.",
              })}
            />
            {errors.password && <p className={styles.errorMessage}>{errors.password.message}</p>}
          </div>

          <button type="submit" className={styles.loginButton}>
            로그인
          </button>

          <div className={styles.signupPrompt}>
            <span>계정이 없으신가요?</span>{" "}
            <button 
                onClick={goToSignUp} 
                className={styles.signupLink}
                type="button"
            >
                회원가입
            </button>
        </div>
        </form>
      </div>
    </div>
  )
}

export default SignIn

