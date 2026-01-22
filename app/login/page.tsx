"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  
  // Verification Code Timer
  const [cooldown, setCooldown] = useState(0);

  const handleSendCode = async () => {
    if (!email) {
      setError("请输入邮箱地址");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "发送失败");
      
      setMessage("验证码已发送 (请查看控制台/邮件)");
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        // Login Logic
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          throw new Error("邮箱或密码错误");
        }
        
        router.push("/");
        router.refresh();
      } else {
        // Register Logic
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, code }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "注册失败");

        // Auto login after register
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        
        if (loginRes?.error) {
           setMessage("注册成功，请切换到登录页登录");
           setIsLogin(true);
        } else {
           router.push("/");
           router.refresh();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
       {/* Background Mesh */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
            backgroundImage: `
               radial-gradient(at 0% 0%, hsla(0,0%,100%,1) 0, transparent 50%), 
               radial-gradient(at 50% 0%, hsla(210,20%,98%,1) 0, transparent 50%), 
               radial-gradient(at 100% 0%, hsla(0,0%,100%,1) 0, transparent 50%),
               radial-gradient(at 50% 50%, hsla(210,10%,96%,1) 0, transparent 100%)
            `
        }}
      />

      <div className="w-full max-w-[440px] relative z-10">
        <div className="glass-box rounded-[32px] p-10 md:p-12">
            <div className="flex flex-col items-center mb-10">
                <div className="w-12 h-12 bg-black rounded-[11px] flex items-center justify-center mb-6 shadow-xl">
                    <span className="material-symbols-outlined text-white text-[28px]">bolt</span>
                </div>
                <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">
                    {isLogin ? "欢迎回来" : "创建您的账号"}
                </h1>
                <p className="text-[15px] text-black/40 mt-2 font-medium text-center">
                    {isLogin ? "请登录您的 Wechat2doc 账号" : "请使用您的邮箱完成注册"}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-black/50 ml-1">邮箱地址</label>
                        <div className="recessed-input rounded-xl px-4 py-3.5 flex items-center">
                            <span className="material-symbols-outlined text-[18px] text-black/20 mr-3">mail</span>
                            <input 
                                className="w-full bg-transparent border-none p-0 text-[15px] focus:ring-0 placeholder:text-black/20 font-medium" 
                                placeholder="example@email.com" 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-black/50 ml-1">验证码</label>
                            <div className="flex gap-2">
                                <div className="recessed-input rounded-xl px-4 py-3.5 flex items-center flex-1">
                                    <span className="material-symbols-outlined text-[18px] text-black/20 mr-3">verified_user</span>
                                    <input 
                                        className="w-full bg-transparent border-none p-0 text-[15px] focus:ring-0 placeholder:text-black/20 font-medium" 
                                        placeholder="6位验证码" 
                                        type="text"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        required={!isLogin}
                                    />
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={cooldown > 0 || loading}
                                    className="outline-action-btn h-[52px] px-4 rounded-xl text-[13px] font-semibold text-black/60 whitespace-nowrap disabled:opacity-50"
                                >
                                    {cooldown > 0 ? `${cooldown}s` : "获取验证码"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[13px] font-semibold text-black/50">
                                {isLogin ? "密码" : "设置密码"}
                            </label>
                            {isLogin && (
                                <a className="text-[12px] font-medium text-black/30 hover:text-black/60 transition-colors" href="#">忘记密码？</a>
                            )}
                        </div>
                        <div className="recessed-input rounded-xl px-4 py-3.5 flex items-center">
                            <span className="material-symbols-outlined text-[18px] text-black/20 mr-3">lock</span>
                            <input 
                                className="w-full bg-transparent border-none p-0 text-[15px] focus:ring-0 placeholder:text-black/20 font-medium" 
                                placeholder={isLogin ? "••••••••" : "至少6位字符"}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-xs font-medium text-center bg-red-50 py-2 rounded-lg">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="text-green-600 text-xs font-medium text-center bg-green-50 py-2 rounded-lg">
                        {message}
                    </div>
                )}

                <button 
                    className="tactile-button w-full h-12 rounded-full text-white text-[15px] font-semibold tracking-wide mt-4 disabled:opacity-70" 
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "处理中..." : (isLogin ? "登 录" : "立即注册")}
                </button>
            </form>

            <div className="mt-10 text-center">
                <p className="text-[14px] text-black/40 font-medium">
                    {isLogin ? "还没有账号？" : "已有账号？"} 
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-black/80 hover:underline font-semibold ml-1 transition-colors"
                    >
                        {isLogin ? "立即注册" : "立即登录"}
                    </button>
                </p>
            </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex gap-8 text-[13px] font-medium text-black/30">
                <a className="hover:text-black/60 transition-colors" href="#">隐私条款</a>
                <a className="hover:text-black/60 transition-colors" href="#">使用协议</a>
                <a className="hover:text-black/60 transition-colors" href="#">联系我们</a>
            </div>
            <div className="flex items-center gap-2 text-black/20">
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Wechat2doc</span>
                <span className="w-1 h-1 rounded-full bg-black/10"></span>
                <span className="text-[12px] font-medium italic">For Minimalists.</span>
            </div>
        </div>
      </div>
    </div>
  );
}