import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api.js";
import "./Signup.css"; // Import the CSS file

const Signup = () => {
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  // Watch the password field to compare it with confirm password
  const password = watch("password");
  const navigate = useNavigate();

  async function submit(data) {
    try {
      await api.post("/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      navigate("/verify-email");

    } catch (error) {
      console.log("error:", error);
      // Axios received response from backend
      if (error.response) {
        const statusCode = error.response.status;
        const message = error.response.data.error.message;

        // Rate limit error
        if (statusCode === 429) {
          setError("root.serverError", {
            type: "server",
            message: message || "Too many requests. Please try again later.",
          });

          return;
        }

        // Other backend errors
        setError("root.serverError", {
          type: "server",
          message: message || "Something went wrong",
        });

        return;
      }
    }
  }

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <h1 className="signup-title">Create an Account</h1>

        <form className="signup-form" onSubmit={handleSubmit(submit)}>
          <div className="input-group">
            <input
              className="signup-input"
              type="text"
              placeholder="Username"
              {...register("username", {
                required: "Username is required",
                pattern: {
                  value: /^[a-z]{3,12}$/,
                  message: "Username must be lowercase and 3-12 characters",
                },
              })}
            />
            {errors.username && (
              <p className="error-text">{errors.username.message}</p>
            )}
          </div>

          <div className="input-group">
            <input
              className="signup-input"
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
          </div>

          <div className="input-group">
            <input
              className="signup-input"
              type="password"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Password must contain uppercase, lowercase, number and special character",
                },
              })}
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          <div className="input-group">
            <input
              className="signup-input"
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "The passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            className="signup-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        {isSubmitSuccessful && (
          <div className="success-message">Account created successfully!</div>
        )}
        {errors.root?.serverError && (
          <p className="error-message">{errors.root.serverError.message}</p>
        )}
      </div>
    </div>
  );
};

export default Signup;
