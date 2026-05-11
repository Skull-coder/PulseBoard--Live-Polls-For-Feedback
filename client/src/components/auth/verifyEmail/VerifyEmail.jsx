import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api.js";
import "./VerifyEmail.css"; // Import the CSS file

const VerifyEmail = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const navigate = useNavigate();

  async function submit(data) {
    try {
      await api.post("/auth/verify-email", {
        verificationToken: data.verificationToken,
      });
      navigate("/login");
    } catch (error) {
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
    <div className="verify-wrapper">
      <div className="verify-container">
        <h1 className="verify-title">Verify Your Email</h1>
        <p className="verify-subtitle">
          Please enter the verification code sent to your email address.
        </p>

        <form className="verify-form" onSubmit={handleSubmit(submit)}>
          <div className="input-group">
            <input
              className="verify-input"
              type="text"
              placeholder="Verification Code"
              {...register("verificationToken", {
                required: "Verification code is required",
              })}
            />
            {errors.verificationToken && (
              <p className="error-text">{errors.verificationToken.message}</p>
            )}
          </div>

          <button
            className="verify-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <p className="verify-footer mt-2">
          <Link to="/login">Back to Login</Link>
        </p>

        {isSubmitSuccessful && (
          <div className="success-message">Email verified successfully!</div>
        )}
        {errors.root?.serverError && (
          <p className="error-message">{errors.root.serverError.message}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
