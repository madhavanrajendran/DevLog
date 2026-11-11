
import { useState, useEffect } from "react";

import {
  ArrowLeft,
  MailCheck,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  // Check whether email exists
  useEffect(() => {
    if (!email) {
      toast.error("Please register first");
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // Handle OTP input
  const handleOtpChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      return toast.error("Email address is missing");
    }

    if (otp.length !== 6) {
      return toast.error("Please enter the 6-digit OTP");
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "OTP verification failed"
        );
      }

      toast.success("Account verified successfully ✅");

      navigate("/login", { replace: true });

    } catch (error) {
      console.error(error);

      toast.error(
        error.message || "Verification failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-zinc-100
        px-4
        py-10
      "
    >
      <div
        className="
          w-full
          max-w-2xl
          bg-white
          rounded-[2rem]
          shadow-2xl
          p-8
          md:p-12
          border
          border-zinc-200
        "
      >

        {/* ICON */}
        <div
          className="
            w-24
            h-24
            mx-auto
            rounded-full
            bg-zinc-100
            flex
            items-center
            justify-center
            mb-8
          "
        >
          <MailCheck
            className="
              w-12
              h-12
              text-black
            "
          />
        </div>

        {/* TITLE */}
        <div className="text-center">

          <h1
            className="
              text-5xl
              font-black
              tracking-tight
              mb-4
            "
          >
            Verify Your Email
          </h1>

          <p
            className="
              text-zinc-500
              text-lg
              leading-relaxed
            "
          >
            We’ve sent a 6-digit
            verification code to
          </p>

          <p
            className="
              text-black
              font-semibold
              text-xl
              mt-1
            "
          >
            {email}
          </p>

        </div>

        {/* OTP FORM */}
        <form
          onSubmit={handleVerifyOtp}
          className="mt-12"
        >

          <p
            className="
              text-center
              text-zinc-600
              mb-6
              text-lg
            "
          >
            Enter the 6-digit code
            below
          </p>

          {/* OTP INPUT */}
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            placeholder="------"
            required
            className="
              w-full
              h-20
              rounded-2xl
              border-2
              border-zinc-300
              bg-white
              text-center
              text-4xl
              tracking-[1rem]
              font-bold
              outline-none
              focus:border-black
              transition
            "
          />

          {/* TIMER */}
          <p
            className="
              text-center
              text-zinc-500
              mt-6
              text-base
            "
          >
            This code will expire
            in 5 minutes
          </p>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading || !email}
            className="
              w-full
              mt-10
              h-16
              rounded-2xl
              bg-black
              text-white
              text-xl
              font-semibold
              hover:opacity-90
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>

        </form>

        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="
            flex
            items-center
            gap-2
            mx-auto
            mt-10
            text-zinc-500
            hover:text-black
            transition
          "
        >
          <ArrowLeft className="w-4 h-4" />

          Back to Register
        </button>

      </div>
    </section>
  );
};

export default VerifyOtp;
