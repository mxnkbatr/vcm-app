"use client"; 
 import React, { useState } from "react"; 
 import { Link } from "@/navigation"; 
 import { useRouter } from "@/navigation";
 import { signIn } from "next-auth/react"; 
 import { motion } from "framer-motion"; 
 import { useTranslations } from "next-intl"; 
 import { Phone, Lock, Eye, EyeOff, ChevronLeft } from "lucide-react"; 
 
 export default function SignInPage() { 
   const t = useTranslations("Auth"); 
   const router = useRouter(); 
   const [phone, setPhone] = useState(""); 
   const [pw, setPw] = useState(""); 
   const [show, setShow] = useState(false); 
   const [err, setErr] = useState(""); 
   const [busy, setBusy] = useState(false); 
 
   const submit = async (e: React.FormEvent) => { 
     e.preventDefault(); 
     if (busy) return; 
     setBusy(true); setErr(""); 
     try { 
       const r = await signIn("credentials", { redirect: false, phone, password: pw }); 
       if (r?.error) throw new Error("Утасны дугаар эсвэл нууц үг буруу."); 
       router.push("/dashboard"); 
     } catch (e: any) { 
       setErr(e.message); 
     } finally { 
       setBusy(false); 
     } 
   }; 
 
   return ( 
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)', paddingTop: 'env(safe-area-inset-top, 44px)' }}> 
      <div className="relative z-[120] max-w-sm mx-auto w-full px-6 flex flex-col justify-center min-h-dvh py-12 pb-32"> 
 
         {/* Logo */} 
         <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10"> 
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-xl" 
             style={{ background: 'var(--blue)' }}> 
             <span className="text-4xl">🌍</span> 
           </div> 
           <h1 className="t-title2">VCM-д тавтай морил</h1> 
           <p className="t-footnote mt-1">Volunteer Center Mongolia</p> 
         </motion.div> 
 
         {/* Form */} 
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4"> 
           <div className="input-group"> 
             <div className="input-row"> 
               <Phone size={18} style={{ color: 'var(--label3)', flexShrink: 0 }} /> 
               <input 
                 type="tel" value={phone} onChange={e => setPhone(e.target.value)} 
                 placeholder="Утасны дугаар" autoComplete="tel" 
               /> 
             </div> 
             <div className="input-row"> 
               <Lock size={18} style={{ color: 'var(--label3)', flexShrink: 0 }} /> 
               <input 
                 type={show ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} 
                 placeholder="Нууц үг" autoComplete="current-password" 
               /> 
               <button type="button" onClick={() => setShow(!show)} className="press flex-shrink-0"> 
                 {show ? <EyeOff size={18} style={{ color: 'var(--label3)' }} /> : <Eye size={18} style={{ color: 'var(--label3)' }} />} 
               </button> 
             </div> 
           </div> 
 
           {err && ( 
             <p className="t-footnote text-center py-3 px-4 rounded-xl" 
               style={{ background: '#FFE8E8', color: 'var(--red)' }}>{err}</p> 
           )} 
 
           <button onClick={submit} disabled={busy} 
             className="btn btn-primary btn-full mt-2"> 
             {busy ? <span className="ios-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> : 'Нэвтрэх'} 
           </button> 
 
           <button onClick={() => { setBusy(true); signIn("google", { callbackUrl: "/dashboard" }); }} 
             className="btn btn-ghost btn-full"> 
             <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2"> 
               <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/> 
               <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/> 
               <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/> 
               <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/> 
             </svg> 
             Google-ээр нэвтрэх 
           </button> 
         </motion.div> 
 
         <p className="t-footnote text-center mt-8 relative z-[140]"> 
           Бүртгэлгүй юу?{" "}
           <button
             type="button"
             onClick={() => router.push("/register")}
             className="press"
             style={{ color: "var(--blue)", fontWeight: 600 }}
           >
             Бүртгүүлэх
           </button>
         </p> 
       </div> 
     </div> 
   ); 
 }