"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/navigation";
import { useSession } from "next-auth/react";
import { signOutToSignIn } from "@/lib/auth-signout";
import {
   Clock, Calendar, MapPin, Activity,
   CheckCircle2, Shield, Settings, BookOpen,
   Sparkles, User, GraduationCap,
   Heart, Video, Lock, CreditCard, ChevronRight,
   LogOut, Plus, ClipboardList, ShoppingBag
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { IOSAlert } from "@/app/components/iOSAlert";

// --- CONSTANTS ---
const STEPS = ["Applied", "Documents", "Interview", "Matching", "Visa", "Departure"];

// --- TYPES ---
interface UserData {
   _id: string;
   fullName: string;
   email: string;
   role: 'volunteer' | 'student' | 'guest' | 'admin';
   studentId?: string;
   country?: string;
   step?: string;
   profile?: {
      sex?: string;
      dob?: string;
      nationality?: string;
      phone?: string;
      mobile?: string;
      address?: {
         street?: string;
         number?: string;
         city?: string;
         country?: string;
      };
      educationLevel?: string;
      languages?: string;
      hobbies?: string;
      motivation?: string;
   };
   phone?: string | null;
   hasPassword?: boolean;
   affiliation?: string | null;
   program?: string | null;
}

interface EventData {
    _id: string;
    title: { en: string; mn: string };
    description: { en: string; mn: string };
    date: string;
    timeString: string;
    location: { en: string; mn: string };
    image: string;
    category: string;
}

interface LessonData {
    _id: string;
    title: { en: string; mn: string };
    description: { en: string; mn: string };
    category: string;
    isUnlocked: boolean;
    imageUrl?: string;
    difficulty: string;
}

type LmsI18n = { en: string; mn: string; de?: string };
type LmsCourse = {
  _id: string;
  slug: string;
  title: LmsI18n;
  description: LmsI18n;
  thumbnailUrl?: string;
  isFree?: boolean;
  price?: number;
  currency?: string;
};

type StudentCourseSummary = {
  course: LmsCourse;
  progressPct: number;
  completedLessons: number;
  totalLessons: number;
};

type StudentDashboard = {
  courses: StudentCourseSummary[];
  certificates: { _id: string; courseId: string; certNumber: string; pdfUrl?: string; issuedAt: string }[];
};

// --- COMPONENTS ---
const DashboardCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
   <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-6 ${className}`}
   >
      {children}
   </motion.div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, action }: { icon: any; title: string; subtitle: string; action?: React.ReactNode }) => (
    <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="icon-box-sm" style={{ background: 'var(--blue-dim)' }}>
                    <Icon size={16} style={{ color: 'var(--blue)' }} />
                </div>
                <h2 className="t-headline">{title}</h2>
            </div>
            {action && <div>{action}</div>}
        </div>
        <p className="t-caption" style={{ color: 'var(--label3)' }}>{subtitle}</p>
    </div>
);

const EventCard = ({ event, onRegister, onCancel, isRegistered, locale }: { event: EventData; onRegister?: (id: string) => void; onCancel?: (id: string) => void; isRegistered: boolean; locale: string }) => (
    <motion.div 
        whileTap={{ scale: 0.98 }}
        className="card overflow-hidden press flex flex-col h-full"
    >
        <div className="relative h-40 w-full overflow-hidden">
            <Image 
                src={event.image} 
                alt={event.title[locale as 'en' | 'mn']} 
                fill 
                className="object-cover"
            />
            <div className="absolute top-3 left-3">
                <span className="badge text-[10px] uppercase tracking-widest shadow-sm" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--blue)' }}>
                    {event.category}
                </span>
            </div>
            {isRegistered && (
                <div className="absolute top-3 right-3">
                    <span className="badge text-[10px] uppercase tracking-widest shadow-sm" style={{ background: 'var(--emerald)', color: 'white' }}>
                        Confirmed
                    </span>
                </div>
            )}
        </div>
        <div className="p-4 flex flex-col flex-grow space-y-3">
            <div className="flex items-center gap-2 t-caption" style={{ color: 'var(--label3)' }}>
                <Calendar size={12} style={{ color: 'var(--blue)' }} />
                <span>{new Date(event.date).toLocaleDateString(locale === 'mn' ? 'mn-MN' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="mx-1">•</span>
                <Clock size={12} style={{ color: 'var(--blue)' }} />
                <span>{event.timeString}</span>
            </div>
            <h3 className="t-headline line-clamp-1">
                {event.title[locale as 'en' | 'mn']}
            </h3>
            <p className="t-footnote line-clamp-2 flex-grow" style={{ color: 'var(--label2)' }}>
                {event.description[locale as 'en' | 'mn']}
            </p>
            
            <div className="flex flex-col gap-2 pt-2">
                <Link 
                    href={`/events/${event._id}`}
                    className="btn btn-secondary btn-sm btn-full"
                >
                    Details <ChevronRight size={14} />
                </Link>

                {isRegistered ? (
                    <button 
                        onClick={() => onCancel && onCancel(event._id)}
                        className="t-caption2 font-bold uppercase tracking-widest py-2"
                        style={{ color: 'var(--red)' }}
                    >
                        Cancel
                    </button>
                ) : (
                    <button 
                        onClick={() => onRegister && onRegister(event._id)}
                        className="btn btn-primary btn-sm btn-full"
                    >
                        Register
                    </button>
                )}
            </div>
        </div>
    </motion.div>
);

const LessonCard = ({ lesson, onUnlock, locale }: { lesson: LessonData; onUnlock: (id: string) => void; locale: string }) => (
    <motion.div 
        whileTap={{ scale: 0.98 }}
        className="card p-4 press flex flex-col space-y-4"
    >
        <div className="flex justify-between items-start">
            <div className="icon-box" style={{ background: lesson.isUnlocked ? 'var(--blue-dim)' : 'var(--bg)', color: lesson.isUnlocked ? 'var(--blue)' : 'var(--label3)' }}>
                {lesson.isUnlocked ? <Video size={20} /> : <Lock size={20} />}
            </div>
            <span className="badge text-[9px] uppercase tracking-wider" style={{ background: 'var(--bg)', color: 'var(--label2)' }}>
                {lesson.difficulty}
            </span>
        </div>
        <div className="space-y-1">
            <h3 className="t-headline line-clamp-1">
                {lesson.title[locale as 'en' | 'mn']}
            </h3>
            <p className="t-footnote line-clamp-2" style={{ color: 'var(--label2)' }}>
                {lesson.description[locale as 'en' | 'mn']}
            </p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
            <span className="t-caption2 uppercase tracking-widest" style={{ color: 'var(--label3)' }}>{lesson.category}</span>
            {lesson.isUnlocked ? (
                <Link href={`/lessons/${lesson._id}`} className="t-caption font-bold flex items-center gap-1" style={{ color: 'var(--blue)' }}>
                    Start <ChevronRight size={14} />
                </Link>
            ) : (
                <button 
                    onClick={() => onUnlock(lesson._id)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: 10, padding: '4px 12px' }}
                >
                    Unlock <CreditCard size={12} className="ml-1" />
                </button>
            )}
        </div>
    </motion.div>
);

export default function MemberDashboard() {
   const locale = useLocale();
   const { data: session, status } = useSession();
   const isLoaded = status !== "loading";
   const user = session?.user;
   const router = useRouter();

   const [userData, setUserData] = useState<UserData | null>(null);
   const [userApps, setUserApps] = useState<any[]>([]);
   const [attendedEvents, setAttendedEvents] = useState<EventData[]>([]);
   const [availableEvents, setAvailableEvents] = useState<EventData[]>([]);
   const [lessons, setLessons] = useState<LessonData[]>([]);
   const [studentDash, setStudentDash] = useState<StudentDashboard | null>(null);
   const [loading, setLoading] = useState(true);
   const [alert, setAlert] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [dashRes, lmsRes] = await Promise.all([
               fetch('/api/user/dashboard'),
               fetch("/api/student/dashboard"),
            ]);

            if (dashRes.ok) {
               const data = await dashRes.json();
               if (data.user?.role === 'admin') {
                  router.replace('/admin');
                  return;
               }
               setUserData(data.user);
               setUserApps(data.applications || []);
               setAttendedEvents(data.attendedEvents || []);
               setAvailableEvents(data.availableEvents || []);
               setLessons(data.lessons || []);
            } else {
               setUserData({ _id: "new", fullName: user?.name || "Guest User", email: user?.email || "", role: "guest" });
            }

            if (lmsRes.ok) {
               const lms = await lmsRes.json();
               setStudentDash(lms);
            }
         } catch (e) {
            console.error("Dashboard Error:", e);
         } finally {
            setLoading(false);
         }
      };

      if (isLoaded && (user as any)?.role === 'admin') {
         router.replace('/admin');
         return;
      }
      if (isLoaded && (user as any)?.role?.startsWith('general_')) {
         router.replace('/general');
         return;
      }

      if (isLoaded && user) fetchData();
      else if (isLoaded && !user) router.replace('/sign-in');
   }, [isLoaded, user, router]);

   const handleRegisterEvent = async (eventId: string) => {
       try {
           const res = await fetch(`/api/events/${eventId}`, { method: 'POST' });
           if (res.ok) {
               const eventToMove = availableEvents.find(e => e._id === eventId);
               if (eventToMove) {
                   setAvailableEvents(prev => prev.filter(e => e._id !== eventId));
                   setAttendedEvents(prev => [eventToMove, ...prev]);
               }
               setAlert({ title: "Амжилттай!", message: "Арга хэмжээнд бүртгэгдлээ.", type: 'success' });
           } else {
               const data = await res.json();
               setAlert({ title: "Алдаа", message: data.error || "Бүртгэл амжилтгүй боллоо.", type: 'error' });
           }
       } catch (error) { setAlert({ title: "Алдаа", message: "Холболт амжилтгүй боллоо.", type: 'error' }); }
   };

   const handleCancelEvent = async (eventId: string) => {
       try {
           const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
           if (res.ok) {
               const eventToMove = attendedEvents.find(e => e._id === eventId);
               if (eventToMove) {
                   setAttendedEvents(prev => prev.filter(e => e._id !== eventId));
                   setAvailableEvents(prev => [eventToMove, ...prev]);
               }
               setAlert({ title: "Амжилттай!", message: "Бүртгэл цуцлагдлаа.", type: 'info' });
           } else {
               const data = await res.json();
               setAlert({ title: "Алдаа", message: data.error || "Цуцлалт амжилтгүй боллоо.", type: 'error' });
           }
       } catch (error) { setAlert({ title: "Алдаа", message: "Холболт амжилтгүй боллоо.", type: 'error' }); }
   };

   const handleUnlockLesson = async (lessonId: string) => {
       try {
           const res = await fetch(`/api/lessons`, { 
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ lessonId })
           });
           if (res.ok) {
               setLessons(prev => prev.map(l => l._id === lessonId ? { ...l, isUnlocked: true } : l));
           }
       } catch (error) { console.error(error); }
   };

   if (loading || !userData) {
      return (
         <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
            <div className="ios-spinner" />
         </div>
      );
   }

   const isVolunteer = userData.role === 'volunteer' || userData.role === 'student';
   const normalizedStep = (!userData.step || userData.step === "-") ? "Applied" : userData.step;
   const currentStepIndex = STEPS.indexOf(normalizedStep);
   const progressPercent = Math.max(5, ((currentStepIndex + 1) / STEPS.length) * 100);

   return (
      <div className="page">
         <div className="page-inner space-y-8">
            
            {/* WELCOME HEADER */}
            <div className="pt-2">
               <p className="t-caption2 uppercase tracking-widest mb-1" style={{ color: 'var(--blue)' }}>
                  {isVolunteer ? 'Гишүүний хяналтын самбар' : 'Зочны портал'}
               </p>
               <h1 className="t-large-title">
                  Сайн уу,<br />
                  <span style={{ color: 'var(--blue)' }}>{userData.fullName.split(' ')[0]}</span>
               </h1>
            </div>

            {/* LEARNING HUB (LMS) */}
            {studentDash && (
              <section className="mt-8">
                <SectionHeader
                  icon={GraduationCap}
                  title={locale === "mn" ? "Миний сургалт" : "My Learning"}
                  subtitle={
                    locale === "mn"
                      ? "Үзэж буй хичээлүүд, явц, сертификат"
                      : "Courses, progress, and certificates"
                  }
                  action={
                    <Link href="/lessons" className="t-caption font-bold" style={{ color: "var(--blue)" }}>
                      {locale === "mn" ? "Бүгд →" : "All →"}
                    </Link>
                  }
                />

                <div className="space-y-4">
                  <div className="flex gap-4 overflow-x-auto no-scroll -mx-4 px-4 pb-1">
                    {(studentDash.courses || []).slice(0, 6).map((c) => {
                      const title =
                        (c.course.title as any)[locale] ||
                        c.course.title.en ||
                        "Course";
                      const desc =
                        (c.course.description as any)[locale] ||
                        c.course.description.en ||
                        "";
                      return (
                        <Link
                          key={c.course._id}
                          href="/lessons"
                          className="card-sm press w-[280px] flex-shrink-0 overflow-hidden"
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="icon-box-sm"
                                  style={{ background: "var(--blue-dim)", color: "var(--blue)" }}
                                >
                                  <BookOpen size={16} />
                                </div>
                                <div className="min-w-0">
                                  <div className="t-headline truncate" style={{ fontSize: 14 }}>
                                    {title}
                                  </div>
                                  <div className="t-caption truncate">{desc}</div>
                                </div>
                              </div>
                              <span
                                className="badge"
                                style={{
                                  background: "var(--fill2)",
                                  color: "var(--label2)",
                                  fontSize: 10,
                                }}
                              >
                                {c.progressPct}%
                              </span>
                            </div>

                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--fill3)" }}>
                              <div className="h-full" style={{ width: `${c.progressPct}%`, background: "var(--blue)" }} />
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="t-caption2 uppercase tracking-widest" style={{ color: "var(--label3)" }}>
                                {c.completedLessons}/{c.totalLessons} {locale === "mn" ? "хичээл" : "lessons"}
                              </span>
                              <span className="t-caption font-bold flex items-center gap-1" style={{ color: "var(--blue)" }}>
                                {locale === "mn" ? "Үргэлжлүүлэх" : "Continue"} <ChevronRight size={14} />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {(studentDash.certificates?.length ?? 0) > 0 && (
                    <DashboardCard className="!p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="icon-box-sm" style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}>
                            <CheckCircle2 size={16} />
                          </div>
                          <div>
                            <div className="t-headline" style={{ fontSize: 15 }}>
                              {locale === "mn" ? "Сертификатууд" : "Certificates"}
                            </div>
                            <div className="t-caption">
                              {(studentDash.certificates?.length ?? 0)}{" "}
                              {locale === "mn" ? "ширхэг" : "total"}
                            </div>
                          </div>
                        </div>
                        <Link href="/dashboard" className="btn btn-secondary btn-sm">
                          {locale === "mn" ? "Харах" : "View"}
                        </Link>
                      </div>
                    </DashboardCard>
                  )}
                </div>
              </section>
            )}

            {/* STATUS & JOURNEY */}
            <div className="grid grid-cols-2 gap-3">
               <div className="card-sm p-4 space-y-3">
                  <div className="icon-box-sm" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                     <Shield size={16} />
                  </div>
                  <div>
                     <p className="t-caption2 uppercase tracking-widest mb-0.5" style={{ color: 'var(--label3)' }}>Төлөв</p>
                     <p className="t-headline capitalize" style={{ fontSize: 16 }}>{userData.role === 'guest' ? 'Зочин' : userData.role}</p>
                  </div>
               </div>
               <div className="card-sm p-4 space-y-3">
                  <div className="icon-box-sm" style={{ background: 'var(--emerald-dim)', color: 'var(--emerald)' }}>
                     <CheckCircle2 size={16} />
                  </div>
                  <div>
                     <p className="t-caption2 uppercase tracking-widest mb-0.5" style={{ color: 'var(--label3)' }}>Явц</p>
                     <p className="t-headline" style={{ fontSize: 16 }}>{userData.step && userData.step !== "-" ? userData.step : "Бүртгэл"}</p>
                  </div>
               </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 gap-3">
               <Link href="/profile" className="card-sm p-4 press flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="icon-box-sm" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                        <User size={16} />
                     </div>
                     <span className="t-headline" style={{ fontSize: 15 }}>Профайл</span>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--label3)' }} />
               </Link>

               <Link href="/shop" className="card-sm p-4 press flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="icon-box-sm" style={{ background: 'var(--orange-dim)', color: 'var(--orange)' }}>
                        <ShoppingBag size={16} />
                     </div>
                     <span className="t-headline" style={{ fontSize: 15 }}>Дэлгүүр</span>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--label3)' }} />
               </Link>

               <button onClick={() => {}} className="card-sm p-4 press flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="icon-box-sm" style={{ background: 'var(--fill2)', color: 'var(--label2)' }}>
                        <Settings size={16} />
                     </div>
                     <span className="t-headline" style={{ fontSize: 15 }}>Тохиргоо</span>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--label3)' }} />
               </button>

               <button
                  type="button"
                  onClick={() => void signOutToSignIn(locale)}
                  className="card-sm p-4 press flex items-center justify-between"
               >
                  <div className="flex items-center gap-3">
                     <div className="icon-box-sm" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
                        <LogOut size={16} />
                     </div>
                     <span className="t-headline" style={{ fontSize: 15, color: 'var(--red)' }}>Гарах</span>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--label3)' }} />
               </button>
            </div>

            {/* PROGRESS BAR (Volunteers only) */}
            {isVolunteer && (
                <section>
                    <SectionHeader 
                        icon={Activity} 
                        title="Миний аялал" 
                        subtitle="Хөтөлбөрт хамрагдах явц"
                    />
                    <DashboardCard className="!p-6">
                        <div className="flex justify-between items-center mb-3">
                            <span className="t-headline" style={{ fontSize: 15 }}>{normalizedStep}</span>
                            <span className="t-caption font-bold" style={{ color: 'var(--blue)' }}>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} className="h-full" style={{ background: 'var(--blue)' }} />
                        </div>
                        <div className="mt-6 flex justify-between">
                            {STEPS.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                return (
                                    <div key={step} className={`w-2 h-2 rounded-full ${isCompleted ? '' : 'opacity-20'}`} style={{ background: isCompleted ? 'var(--blue)' : 'var(--label4)' }} />
                                );
                            })}
                        </div>
                    </DashboardCard>
                </section>
            )}

            {/* APPLICATIONS */}
            <section>
               <SectionHeader 
                  icon={ClipboardList} 
                  title="Миний өргөдлүүд" 
                  subtitle="Таны илгээсэн хөтөлбөрийн хүсэлтүүд"
                  action={
                     <Link href="/programs" className="t-caption font-bold" style={{ color: 'var(--blue)' }}>
                        Шинэ +
                     </Link>
                  }
               />
               <div className="space-y-3">
                  {userApps.length === 0 ? (
                     <div className="card-sm p-8 flex flex-col items-center justify-center text-center border border-dashed" style={{ borderColor: 'var(--sep)', background: 'var(--bg)' }}>
                        <div className="icon-box mb-3" style={{ background: 'var(--fill2)', color: 'var(--label3)' }}>
                           <ClipboardList size={20} />
                        </div>
                        <p className="t-footnote" style={{ color: 'var(--label3)' }}>Одоогоор өргөдөл байхгүй байна.</p>
                     </div>
                  ) : (
                     userApps.map(app => (
                        <div key={app._id} className="card-sm p-4 flex items-center gap-4 press">
                           <div className="icon-box-sm" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                              <Plus size={16} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="t-headline truncate" style={{ fontSize: 15 }}>{app.programId}</h4>
                              <p className="t-caption" style={{ color: 'var(--label3)' }}>{new Date(app.createdAt).toLocaleDateString()}</p>
                           </div>
                           <div className="badge text-[10px]" style={{ background: 'var(--orange-dim)', color: 'var(--orange)' }}>
                              {app.status || 'Хүлээгдэж буй'}
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </section>

            {/* EVENTS */}
            <section>
               <SectionHeader 
                  icon={Calendar} 
                  title="Арга хэмжээ" 
                  subtitle="Танд санал болгож буй үйл ажиллагаанууд"
                  action={
                     <Link href="/events" className="t-caption font-bold" style={{ color: 'var(--blue)' }}>
                        Бүгд →
                     </Link>
                  }
               />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
                  {availableEvents.slice(0, 2).map(event => (
                     <EventCard 
                        key={event._id} 
                        event={event} 
                        onRegister={handleRegisterEvent}
                        isRegistered={attendedEvents.some(e => e._id === event._id)}
                        locale={locale}
                     />
                  ))}
               </div>
            </section>

            {/* LESSONS */}
            <section>
               <SectionHeader 
                  icon={BookOpen} 
                  title="Сургалт & Хичээл" 
                  subtitle="Мэдлэгээ тэлж, өөрийгөө хөгжүүлээрэй"
                  action={
                     <Link href="/lessons" className="t-caption font-bold" style={{ color: 'var(--blue)' }}>
                        Бүгд →
                     </Link>
                  }
               />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
                  {lessons.slice(0, 4).map(lesson => (
                     <LessonCard 
                        key={lesson._id} 
                        lesson={lesson} 
                        onUnlock={handleUnlockLesson}
                        locale={locale}
                     />
                  ))}
               </div>
            </section>

         </div>

         <IOSAlert 
            isOpen={!!alert} 
            onClose={() => setAlert(null)} 
            title={alert?.title || ""} 
            message={alert?.message || ""} 
            type={alert?.type} 
         />
      </div>
   );
}
