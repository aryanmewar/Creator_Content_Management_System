import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Zap } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth.js";
import Button from "../components/common/Button.jsx";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const slides = [
  {
    image: "/astronaut.jpg",
    title: "Welcome to the Hub",
    description:
      "This platform was built by Aryan Sharma to streamline and manage all our creative content workflows.",
  },
  {
    image: "/robot.jpg",
    title: "Plan & Execute",
    description:
      "Assign tasks, set strict deadlines, and organize publications across all social platforms.",
  },
  {
    image: "/rocket.jpg",
    title: "Track Performance",
    description:
      "Keep a birds-eye view on pending, overdue, and successfully delivered content.",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-slate-50">
      {/* Creative Floating Shapes Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 animate-gradient"></div>

        {/* Floating Elements Container */}
        <div className="absolute inset-0 w-full h-full">
          {/* Square */}
          <div
            className="absolute left-[10%] w-24 h-24 border-4 border-indigo-200/50 rounded-2xl animate-float-up"
            style={{ animationDuration: "25s", animationDelay: "0s" }}
          ></div>
          {/* Circle */}
          <div
            className="absolute left-[25%] w-16 h-16 bg-purple-200/30 rounded-full animate-float-up"
            style={{ animationDuration: "20s", animationDelay: "4s" }}
          ></div>
          {/* Triangle */}
          <div
            className="absolute left-[40%] w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[50px] border-b-blue-200/40 animate-float-up"
            style={{ animationDuration: "28s", animationDelay: "2s" }}
          ></div>
          {/* Ring */}
          <div
            className="absolute left-[55%] w-32 h-32 border-8 border-pink-200/40 rounded-full animate-float-up"
            style={{ animationDuration: "22s", animationDelay: "8s" }}
          ></div>
          {/* Rounded Square */}
          <div
            className="absolute left-[70%] w-20 h-20 bg-indigo-200/30 rounded-3xl animate-float-up"
            style={{ animationDuration: "26s", animationDelay: "5s" }}
          ></div>
          {/* Cross */}
          <div
            className="absolute left-[85%] text-purple-200/60 text-6xl font-light animate-float-up"
            style={{ animationDuration: "18s", animationDelay: "1s" }}
          >
            +
          </div>

          {/* More Shapes */}
          <div
            className="absolute left-[15%] w-12 h-12 bg-blue-200/30 rounded-full animate-float-up"
            style={{ animationDuration: "15s", animationDelay: "10s" }}
          ></div>
          <div
            className="absolute left-[45%] w-28 h-28 border-4 border-indigo-200/40 rounded-full animate-float-up"
            style={{ animationDuration: "24s", animationDelay: "12s" }}
          ></div>
          <div
            className="absolute left-[65%] w-16 h-16 bg-pink-200/20 rounded-xl animate-float-up"
            style={{ animationDuration: "19s", animationDelay: "14s" }}
          ></div>
          <div
            className="absolute left-[80%] text-indigo-200/50 text-5xl font-light animate-float-up"
            style={{ animationDuration: "21s", animationDelay: "7s" }}
          >
            +
          </div>
        </div>
      </div>

      {/* Creative Top Badge */}
      <div className="z-20 pointer-events-none animate-in fade-in slide-in-from-top-10 duration-1000 w-full max-w-2xl px-4 mb-8 sm:mb-12">
        <div className="backdrop-blur-xl bg-white/40 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 sm:px-6 py-3 rounded-full flex flex-col sm:flex-row items-center justify-center gap-3 mx-auto text-center sm:text-left">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shrink-0 shadow-md hidden sm:flex">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-700 tracking-wide leading-relaxed">
            Exclusively created by{" "}
            <span className="font-bold text-indigo-700">Aryan Sharma</span> to
            manage & track all digital content.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_0_100px_rgba(99,_102,_241,_0.2)] overflow-hidden flex flex-col md:flex-row min-h-[600px] relative z-10">
        {/* Left Pane (Carousel) */}
        <div className="flex w-full md:w-1/2 bg-[#2D4396] flex-col items-center justify-center p-8 md:p-12 text-center relative overflow-hidden min-h-[380px] md:min-h-full">
          {/* Images Wrapper */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 mb-6 md:mb-10">
            {slides.map((slide, index) => (
              <img
                key={index}
                src={slide.image}
                alt={slide.title}
                className={`absolute inset-0 w-full h-full object-cover rounded-full mix-blend-screen transition-all duration-1000 ease-in-out ${
                  currentSlide === index
                    ? "opacity-90 scale-100 translate-y-0 rotate-0"
                    : "opacity-0 scale-90 translate-y-4 -rotate-3 pointer-events-none"
                }`}
              />
            ))}
          </div>

          {/* Text Wrapper */}
          <div className="h-24 md:h-20 relative w-full flex justify-center">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex flex-col items-center justify-start transition-all duration-1000 ease-in-out ${
                  currentSlide === index
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-12 pointer-events-none"
                }`}
              >
                <h2 className="text-white text-2xl md:text-3xl font-semibold mb-2">
                  {slide.title}
                </h2>
                <p className="text-blue-200 text-xs md:text-sm px-4">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex gap-3 items-center mt-4 md:mt-10 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-500 rounded-full flex items-center justify-center focus:outline-none ${
                  currentSlide === index
                    ? "w-5 h-5 border-2 border-indigo-300 bg-transparent"
                    : "w-2.5 h-2.5 bg-indigo-900/40 hover:bg-indigo-900/60"
                }`}
              >
                {currentSlide === index && (
                  <div className="w-2 h-2 rounded-full bg-white transition-all duration-500 scale-100"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Pane (Form) */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>

          <div className="max-w-sm w-full mx-auto relative z-10 flex flex-col h-full justify-center">
            {/* App Logo */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-[#2D4396] mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-logo text-[#2D4396] mb-2 tracking-wide">
                Createlyt
              </h1>
              <p className="text-slate-500 text-sm">
                Welcome back! Please enter your details.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Input */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#2D4396] transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D4396]/20 focus:border-[#2D4396] transition-all ${errors.email ? "border-red-400 focus:ring-red-400" : ""}`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1 pl-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 pl-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#2D4396] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D4396]/20 focus:border-[#2D4396] transition-all ${errors.password ? "border-red-400 focus:ring-red-400" : ""}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#2D4396] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1 pl-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-1 pb-6">
                <a
                  href="#"
                  className="text-xs font-semibold text-[#2D4396] hover:text-indigo-800 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#2D4396] hover:bg-indigo-800 text-white py-4 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-900/20 transition-all hover:shadow-indigo-900/40 active:scale-[0.98]"
                loading={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                © {new Date().getFullYear()} Createlyt Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
