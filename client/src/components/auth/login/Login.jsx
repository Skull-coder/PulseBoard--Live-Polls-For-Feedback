import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css"; // Make sure to import the CSS file!

const Login = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const navigate = useNavigate();

  async function submit(data) {
    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        email: data.email,
        password: data.password,
      });

      console.log(response);

      const responseData = response.data.data;

      localStorage.setItem("accessToken", responseData.accessToken);

      localStorage.setItem("refreshToken", responseData.refreshToken);

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: responseData.username,
          email: responseData.email,
        }),
      );

      navigate("/dashboard");
    } catch (error) {
      console.log("error:", error);
      // Axios received response from backend
      if (error.response) {
        const message = error.response.data.error.message;

        setError("root.serverError", {
          type: "server",
          message: message || "Something went wrong",
        });

        return;
      }
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h1 className="login-title">Login</h1>

        <form className="login-form" onSubmit={handleSubmit(submit)}>
          <div className="input-group">
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
          </div>

          <div className="input-group">
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

        {isSubmitSuccessful && (
          <div className="success-message">Login successful!</div>
        )}
        {errors.root?.serverError && (
          <p className="error-message">{errors.root.serverError.message}</p>
        )}
      </div>
    </div>
  );
};

export default Login;
