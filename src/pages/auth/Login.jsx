
import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";

import {
  Input,
} from "@/components/ui/input";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  useAuth,
} from "@/context/AuthContext";

import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response =
        await fetch(
          `${import.meta.env.VITE_API_URL}/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              formData
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Login failed"
        );
      }

      // SAVE TOKEN
      localStorage.setItem(
        "token",
        data.token
      );

      // UPDATE AUTH CONTEXT
      login(data.user);

      toast.success("Login successful ✅");

      navigate("/");

    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
        "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16">

      <Card className="w-full max-w-lg border-border/60 shadow-2xl rounded-3xl overflow-hidden">

        <CardContent className="p-8 md:p-10 space-y-8">

          <div className="text-center space-y-3">

            <h1 className="text-4xl font-black tracking-tight">
              Welcome Back
            </h1>

            <p className="text-muted-foreground text-lg">
              Login to continue your blogging journey.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* EMAIL */}
            <div className="space-y-2">

              <label className="text-sm font-medium">
                Email Address
              </label>

              <div className="relative">

                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-11 h-12 rounded-xl"
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="space-y-2">

              <label className="text-sm font-medium">
                Password
              </label>

              <div className="relative">

                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <Input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-11 pr-11 h-12 rounded-xl"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >

                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}

                </button>

              </div>

            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold"
              disabled={loading}
            >

              {loading
                ? "Signing In..."
                : "Login"}

            </Button>

          </form>

          {/* REGISTER LINK */}
          <div className="text-center text-sm text-muted-foreground">

            Don&apos;t have an account?{" "}

            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Register
            </Link>

          </div>

        </CardContent>

      </Card>

    </section>
  );
};

export default Login;
