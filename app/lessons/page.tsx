"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   FaBook,
   FaLanguage,
   FaGlobe,
   FaCheckCircle,
   FaLock,
   FaPlay,
   FaUserGraduate
} from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

// --- TYPES ---
interface Lesson {
   _id: string;
   title: { mn: string; en: string };
   description: { mn: string; en: string };
   image?: string;
   imageUrl?: string; // Handle inconsistent naming if any
   category: string;
   difficulty: string; // beginner, intermediate, advanced
   status: string;
   attendees: Array<{ _id: string, clerkId: string }>;
}

export default function LessonsPage() {
   const { user, isLoaded, isSignedIn } = useUser();
   const router = useRouter();

   // State
   const [lessons, setLessons] = useState<Lesson[]>([]);
   const [loading, setLoading] = useState(true);
   const [registeringId, setRegisteringId] = useState<string | null>(null);

   // Fetch Lessons
   const fetchLessons = async () => {
      try {
         const res = await fetch('/api/lessons');
         if (res.ok) {
            const data = await res.json();
            setLessons(data);
         }
      } catch (e) {
         console.error("Failed to fetch lessons", e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchLessons();
   }, []);

   // Handlers
   const handleRegister = async (lessonId: string) => {
      if (!isSignedIn) {
         router.push("/sign-in");
         return;
      }

      setRegisteringId(lessonId);
      try {
         const res = await fetch('/api/lessons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lessonId })
         });

         if (res.ok) {
            // Refresh list to update attendee status (or we could manually update local state)
            fetchLessons();
            // alert("Successfully joined the lesson!"); 
         } else {
            alert("Failed to join.");
         }
      } catch (e) {
         console.error(e);
      } finally {
         setRegisteringId(null);
      }
   };

   // Helpers
   const isRegistered = (lesson: Lesson) => {
      if (!user) return false;
      // Check if our user ID matches any attendee
      if (!lesson.attendees) return false;
      return lesson.attendees.some(a => a.clerkId === user.id);
   };

   const getDifficultyColor = (diff: string) => {
      switch (diff) {
         case 'beginner': return "bg-green-100 text-green-700";
         case 'intermediate': return "bg-blue-100 text-blue-700";
         case 'advanced': return "bg-purple-100 text-purple-700";
         default: return "bg-slate-100 text-slate-600";
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-red-600" size={40} />
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-800 pb-20">

         {/* Header / Hero */}
         <div className="bg-white pt-32 pb-16 px-6 shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto text-center">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 mb-6 border border-blue-100">
                  <FaUserGraduate size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Au Pair Academy</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
                  Хэлний <span className="text-red-600">Хичээлүүд</span>
               </h1>
               <p className="max-w-2xl mx-auto text-slate-500 text-lg font-medium leading-relaxed">
                  Au Pair хөтөлбөрт шаардлагатай хэлний мэдлэг олгох, соёлын ойлголт өгөх тусгай хичээлүүд.
               </p>
            </div>
         </div>

         {/* Content */}
         <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {lessons.map((lesson) => {
                  const registered = isRegistered(lesson);
                  // Fallback for image field name, in case admin saved as imageUrl or image
                  const displayImage = lesson.image || lesson.imageUrl;

                  return (
                     <motion.div
                        key={lesson._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full group"
                     >
                        {/* Image / Visual */}
                        <div className="h-48 rounded-[1.5rem] bg-slate-100 relative overflow-hidden mb-6">
                           {displayImage ? (
                              <Image src={displayImage} alt={lesson.title.mn} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                 <FaBook size={48} />
                              </div>
                           )}

                           {/* Badges */}
                           <div className="absolute top-4 left-4 flex gap-2">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${getDifficultyColor(lesson.difficulty)}`}>
                                 {lesson.difficulty}
                              </span>
                           </div>

                           {/* Status Overlay if registered */}
                           {registered && (
                              <div className="absolute inset-0 bg-emerald-500/80 backdrop-blur-[2px] flex items-center justify-center text-white font-black uppercase tracking-widest gap-2">
                                 <FaCheckCircle size={20} /> Registered
                              </div>
                           )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 px-2 flex flex-col">
                           <div className="mb-4">
                              <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1" title={lesson.title.mn}>{lesson.title.mn}</h3>
                              <p className="text-sm text-slate-500 font-medium line-clamp-2">{lesson.description.mn}</p>
                           </div>

                           <div className="mt-auto grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                                 <FaLanguage size={14} className="text-blue-500" /> {lesson.category || 'Language'}
                              </div>
                              <div className="text-right">
                                 {registered ? (
                                    <span className="text-emerald-500 font-bold text-xs flex items-center justify-end gap-1">
                                       <FaCheckCircle /> Joined
                                    </span>
                                 ) : (
                                    <button
                                       onClick={() => handleRegister(lesson._id)}
                                       disabled={registeringId === lesson._id}
                                       className="w-full bg-slate-900 text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                       {registeringId === lesson._id ? <Loader2 className="animate-spin" size={14} /> : "Join Class"}
                                    </button>
                                 )}
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  );
               })}
            </div>

            {lessons.length === 0 && !loading && (
               <div className="text-center py-20 text-slate-400">
                  <FaBook size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold">No lessons available at the moment.</p>
               </div>
            )}
         </div>
      </div>
   );
}