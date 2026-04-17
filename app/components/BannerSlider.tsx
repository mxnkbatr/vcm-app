'use client'; 
 
 import React, { useState, useEffect, useCallback } from 'react'; 
 import Image from 'next/image'; 
 import { m, AnimatePresence, Variants } from 'framer-motion'; 
 import { ChevronLeft, ChevronRight } from 'lucide-react'; 
 
 import { Banner } from '@/models/Banner'; 
 import { getApiUrl } from '@/lib/utils'; 
 import { Motion } from './MotionProxy'; 
 
 const FALLBACK_BANNERS: Banner[] = [
   {
     id: 'fallback-1',
     title: 'Inspiration in Action',
     image: 'https://scontent.fuln2-2.fna.fbcdn.net/v/t39.30808-6/574080514_1254673616704746_2734634584703551112_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=b895b5&_nc_ohc=uYLUQuf89tsQ7kNvwGYoJEF&_nc_oc=Adr5B5mRR_G_oHJ4YZFJ8Oj3sprfLF43RPikOwJL6QbS3I9q22yWgOsYoIkgPns8jdA&_nc_zt=23&_nc_ht=scontent.fuln2-2.fna&_nc_gid=7jGdMiJroBpPsgBPaSM5sA&_nc_ss=7a3a8&oh=00_Af06quI8sJ5jVTAAJTpvavP1wWO29hw7FXUT2bph8ZfM0g&oe=69E5073D',
     link: '/about',
     active: true,
   },
   {
     id: 'fallback-2',
     title: 'Shoebox Project Mongolia',
     image: 'https://scontent.fuln8-1.fna.fbcdn.net/v/t39.30808-6/617134620_1318655110306596_6087394076990716216_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=105&ccb=1-7&_nc_sid=b895b5&_nc_ohc=0Teggzw7IzIQ7kNvwF3Gki7&_nc_oc=AdoBmfXYXrs5HrVSWILuIEEZpXG7siHhksp0GK7O6Faj-ORep2wqv2fBJqEs50_68ms&_nc_zt=23&_nc_ht=scontent.fuln8-1.fna&_nc_gid=eAn8Gar149Kvu1K4ldrS5w&_nc_ss=7a3a8&oh=00_Af2OiwWGy3wRlAOIZB0HlLhiJM_LqwNFVD3OYxAX16cmdw&oe=69E525DF',
     link: '/events',
     active: true,
   },
 ];
 
 export default function BannerSlider() { 
   const [banners, setBanners] = useState<Banner[]>([]); 
   const [isLoading, setIsLoading] = useState(true); 
   const [currentIndex, setCurrentIndex] = useState(0); 
   const [direction, setDirection] = useState(0); // -1 for left, 1 for right 
   const [isHovered, setIsHovered] = useState(false); 
 
   const nextSlide = useCallback(() => { 
     if (banners.length === 0) return; 
     setDirection(1); 
     setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length); 
   }, [banners.length]); 
 
   const prevSlide = useCallback(() => { 
     if (banners.length === 0) return; 
     setDirection(-1); 
     setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length); 
   }, [banners.length]); 
 
   useEffect(() => { 
     if (currentIndex >= banners.length && banners.length > 0) { 
       setCurrentIndex(0); 
     } 
   }, [banners.length, currentIndex]); 
 
   useEffect(() => { 
     const fetchBanners = async () => { 
       try { 
         const response = await fetch(getApiUrl('/api/banners')); 
         if (!response.ok) { 
           throw new Error(`HTTP error! status: ${response.status}`); 
         } 
         
         const contentType = response.headers.get('content-type'); 
         if (!contentType || !contentType.includes('application/json')) { 
           throw new TypeError("Oops, we haven't got JSON!"); 
         } 
 
         const data = await response.json(); 
         if (data.banners && data.banners.length > 0) {
           setBanners(data.banners); 
         } else {
           setBanners(FALLBACK_BANNERS);
         }
       } catch (err) { 
         console.error('Error fetching banners:', err); 
         // Fallback to mock data if fetch fails 
         setBanners(FALLBACK_BANNERS); 
       } finally { 
         setIsLoading(false); 
       } 
     }; 
 
     fetchBanners(); 
   }, []); 
 
   useEffect(() => { 
     if (isHovered || banners.length <= 1) return; 
     const interval = setInterval(nextSlide, 5000); 
     return () => clearInterval(interval); 
   }, [nextSlide, isHovered, banners.length]); 
 
   const variants: Variants = { 
     enter: (_direction: number) => ({ 
       opacity: 0, 
     }), 
     center: { 
       zIndex: 1, 
       opacity: 1, 
     }, 
     exit: (_direction: number) => ({ 
       zIndex: 0, 
       opacity: 0, 
     }), 
   }; 
 
   if (isLoading || banners.length === 0) { 
     return ( 
       <div className="w-full px-5 pt-3">
         <div className="w-full animate-pulse" style={{ 
           borderRadius: 'var(--r-2xl)', 
           background: 'var(--fill2)', 
           aspectRatio: '16/9', 
         }} /> 
       </div>
     ); 
   } 
 
   return ( 
     <section className="w-full px-5 pt-3">
       <div 
         className="relative w-full overflow-hidden group" 
         style={{ 
           borderRadius: 'var(--r-2xl)', 
           boxShadow: '0 2px 20px rgba(0,0,0,0.10)', 
           aspectRatio: '16/9',  /* mobile дээр 16:9 */ 
         }} 
         onMouseEnter={() => setIsHovered(true)} 
         onMouseLeave={() => setIsHovered(false)} 
       > 
         <AnimatePresence initial={false} custom={direction} mode="popLayout"> 
           <Motion.div 
             key={currentIndex} 
             custom={direction} 
             variants={variants} 
             initial="enter" 
             animate="center" 
             exit="exit" 
             transition={{ opacity: { duration: 0.4, ease: 'easeInOut' } }} 
             className="absolute inset-0 w-full h-full" 
           > 
             <div className="relative w-full h-full"> 
               <Image 
                 src={banners[currentIndex]?.image || ''} 
                 alt={banners[currentIndex]?.title || `Banner ${currentIndex + 1}`} 
                 fill 
                 priority={currentIndex === 0} 
                 className="object-cover" 
                 sizes="(max-width: 768px) 100vw, (max-width: 1400px) 100vw, 1400px" 
               /> 
             </div> 
           </Motion.div> 
         </AnimatePresence> 
 
         {/* Navigation Arrows - Hidden on Mobile, Visible on Hover for Desktop */} 
         <div className="absolute inset-0 z-10 hidden sm:flex items-center justify-between px-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"> 
           <Motion.button 
             whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }} 
             whileTap={{ scale: 0.9 }} 
             onClick={prevSlide} 
             className="press p-2 rounded-full bg-white/50 backdrop-blur-md text-gray-800 shadow-sm pointer-events-auto" 
           > 
             <ChevronLeft className="w-5 h-5" /> 
           </Motion.button> 
           <Motion.button 
             whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }} 
             whileTap={{ scale: 0.9 }} 
             onClick={nextSlide} 
             className="press p-2 rounded-full bg-white/50 backdrop-blur-md text-gray-800 shadow-sm pointer-events-auto" 
           > 
             <ChevronRight className="w-5 h-5" /> 
           </Motion.button> 
         </div> 
 
         {/* Indicators */} 
         <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5"> 
           {banners.map((_: any, i: number) => ( 
             <button key={i} onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }} className="press p-1"> 
               <div className={`rounded-full transition-all duration-300 ${ 
                 i === currentIndex 
                   ? 'w-5 h-1.5 bg-white' 
                   : 'w-1.5 h-1.5 bg-white/50' 
               }`} /> 
             </button> 
           ))} 
         </div> 
 
         {/* Autoplay Progress Bar */} 
         <div className="absolute bottom-0 left-0 h-0.5 bg-white/20 w-full z-20"> 
           <Motion.div 
             key={currentIndex} 
             initial={{ width: 0 }} 
             animate={{ width: isHovered ? '0%' : '100%' }} 
             transition={{ duration: isHovered ? 0 : 5, ease: 'linear' }} 
             className="h-full bg-white/60" 
           /> 
         </div> 
       </div>
     </section> 
   ); 
 }
