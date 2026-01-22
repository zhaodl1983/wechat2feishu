
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#FAFAFA]">
       {/* Background Mesh (Inspired by UI Code) */}
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

      <div className="relative z-10 w-full max-w-[400px] px-6">
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-black rounded-[14px] flex items-center justify-center mb-4 shadow-xl shadow-black/10">
            <span className="material-symbols-outlined text-white text-[24px]">bolt</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">Wechat2doc</h1>
          <p className="text-black/40 font-medium mt-2 text-sm">
             {isLogin ? "登录你的知识库" : "创建你的私人知识库"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[24px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white/50 p-8">
            {/* Tabs */}
            <div className="flex p-1 bg-black/5 rounded-xl mb-6 relative">
                <div 
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-spring"
                    style={{ left: isLogin ? '4px' : 'calc(50%)' }}
                />
                <button 
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 relative z-10 py-1.5 text-[13px] font-semibold transition-colors ${isLogin ? 'text-black' : 'text-black/40'}`}
                >
                    登录
                </button>
                <button 
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 relative z-10 py-1.5 text-[13px] font-semibold transition-colors ${!isLogin ? 'text-black' : 'text-black/40'}`}
                >
                    注册
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="email"
                        placeholder="邮箱地址"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-10 px-4 rounded-xl bg-black/[0.03] border border-transparent focus:bg-white focus:border-black/10 focus:ring-0 text-[14px] transition-all placeholder:text-black/20"
                    />
                </div>

                {!isLogin && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="验证码 (6位)"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required={!isLogin}
                            maxLength={6}
                            className="flex-1 h-10 px-4 rounded-xl bg-black/[0.03] border border-transparent focus:bg-white focus:border-black/10 focus:ring-0 text-[14px] transition-all placeholder:text-black/20"
                        />
                        <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={cooldown > 0 || loading}
                            className="h-10 px-4 rounded-xl bg-black/5 text-[12px] font-semibold text-black/60 hover:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px]"
                        >
                            {cooldown > 0 ? `${cooldown}s` : "获取验证码"}
                        </button>
                    </div>
                )}

                <div>
                    <input
                        type="password"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full h-10 px-4 rounded-xl bg-black/[0.03] border border-transparent focus:bg-white focus:border-black/10 focus:ring-0 text-[14px] transition-all placeholder:text-black/20"
                    />
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
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-black text-white rounded-xl text-[14px] font-semibold shadow-lg shadow-black/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none mt-2"
                >
                    {loading ? "处理中..." : (isLogin ? "登 录" : "创建账号")}
                </button>
            </form>
        </div>
        
        <div className="text-center mt-8">
            <p className="text-[12px] text-black/20 font-medium">
                © 2026 Wechat2doc. All rights reserved.
            </p>
        </div>
      </div>
    </div>
  );
}
