import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";
import API_URL from "../config";

function SignIn() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { setAccessToken } = useAuth();

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/signin`, data, {
                withCredentials: true
            });
            console.log(response.data);
            setAccessToken(response.data.accessToken);
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    }
    return ( <>
        <form onSubmit={handleSubmit(onSubmit)}>
            <label>이메일</label>
            <input type="email" {...register("email", {
                required: "이메일을 입력해주세요.",
                pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "유효한 이메일 형식을 입력해주세요.",
                },
            })}
            />
            {errors.email && <p>{errors.email.message}</p>}
            
            <label>비밀번호</label>
            <input type="password" {...register("password", { 
                required: "비밀번호를 입력해주세요." })}
            />
            {errors.password && <p>{errors.password.message}</p>}
            
            <button type="submit">로그인</button>
        </form>
    </> );
}

export default SignIn;