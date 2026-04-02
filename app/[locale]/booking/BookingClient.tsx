"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Motion as motion } from "@/app/components/MotionProxy";
import {
   Search,
   ShoppingBag,
   Package,
   Filter,
   Loader2,
   Tag,
   ChevronDown
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

interface ShoppingItem {
   _id: string;
   name: { en: string; mn: string; de: string };
   description: { en: string; mn: string; de: string };
   price: number;
   image: string;
   category: string;
   stock: number;
   isActive: boolean;
}

const CATEGORIES = ["all", "electronics", "clothing", "food", "accessories", "general"];

const cardVar = {
   hidden: { opacity: 0, y: 20 },
   visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" }
   }),
};

export default function ShoppingClient() {
   const locale = useLocale();
   const [items, setItems] = useState<ShoppingItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [activeCategory, setActiveCategory] = useState("all");
   const [showFilters, setShowFilters] = useState(false);

   useEffect(() => {
      const fetchItems = async () => {
         try {
            const res = await fetch("/api/shopping");
            if (res.ok) {
               const data = await res.json();
               setItems(data);
            }
         } catch (error) {
            console.error("Failed to fetch shopping items", error);
         } finally {
            setLoading(false);
         }
      };
      fetchItems();
   }, []);

   const filteredItems = useMemo(() => {
      return items.filter((item) => {
         const name = locale === "mn" ? item.name.mn : locale === "de" ? (item.name.de || item.name.en) : item.name.en;
         const desc = locale === "mn" ? item.description.mn : locale === "de" ? (item.description.de || item.description.en) : item.description.en;
         const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            desc.toLowerCase().includes(searchTerm.toLowerCase());
         const matchesCategory =
            activeCategory === "all" || item.category === activeCategory;
         return matchesSearch && matchesCategory;
      });
   }, [items, searchTerm, activeCategory, locale]);

   const getName = (item: ShoppingItem) =>
      locale === "mn" ? item.name.mn : locale === "de" ? (item.name.de || item.name.en) : item.name.en;
   const getDesc = (item: ShoppingItem) =>
      locale === "mn" ? item.description.mn : locale === "de" ? (item.description.de || item.description.en) : item.description.en;

   const formatPrice = (price: number) => {
      let formatLocale = "en-US";
      if (locale === "mn") formatLocale = "mn-MN";
      if (locale === "de") formatLocale = "de-DE";
      return new Intl.NumberFormat(formatLocale).format(price) + "₮";
   };

   return (
      <div className="min-h-[100dvh] bg-[#F8F9FC] text-slate-800 font-sans selection:bg-red-500 selection:text-white pt-32 pb-20 px-4 md:px-8">
         <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">Shopping Market</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                  Discover Our <span className="text-red-600 underline decoration-wavy decoration-emerald-200">Products</span>
               </h1>
               <p className="text-slate-500 font-medium max-w-xl mx-auto">
                  Browse our curated collection of products. Find what you need and shop with confidence.
               </p>
            </div>

            {/* Search & Filters */}
            <div className="mb-10 space-y-4">
               <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                     <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products..."
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all shadow-sm"
                     />
                  </div>
                  {/* Filter Toggle */}
                  <button
                     onClick={() => setShowFilters(!showFilters)}
                     className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 hover:border-red-200 transition-all shadow-sm"
                  >
                     <Filter size={18} />
                     Filter
                     <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </button>
               </div>

               {/* Category Filters */}
               <AnimatePresence>
                  {showFilters && (
                     <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                     >
                        <div className="flex flex-wrap gap-2 pt-2">
                           {CATEGORIES.map((cat) => (
                              <button
                                 key={cat}
                                 onClick={() => setActiveCategory(cat)}
                                 className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                                    activeCategory === cat
                                       ? "bg-red-600 text-white shadow-lg shadow-red-200"
                                       : "bg-white text-slate-500 border-2 border-slate-100 hover:border-red-200 hover:text-red-600"
                                 }`}
                              >
                                 {cat}
                              </button>
                           ))}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Loading State */}
            {loading && (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-red-500" size={40} />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading products...</p>
               </div>
            )}

            {/* Empty State */}
            {!loading && filteredItems.length === 0 && (
               <div className="text-center py-20">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Package size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">No products found</h3>
                  <p className="text-slate-500 font-medium">
                     {searchTerm ? "Try a different search term or category." : "Products will appear here once added."}
                  </p>
               </div>
            )}

            {/* Products Grid */}
            {!loading && filteredItems.length > 0 && (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item, index) => (
                     <motion.div
                        key={item._id}
                        custom={index}
                        variants={cardVar}
                        initial="hidden"
                        animate="visible"
                        className="group bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition-all duration-300"
                     >
                        {/* Image */}
                        <div className="relative aspect-square bg-slate-50 overflow-hidden">
                           {item.image ? (
                              <Image
                                 src={item.image}
                                 alt={getName(item)}
                                 fill
                                 className="object-cover group-hover:scale-105 transition-transform duration-500"
                                 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                 <ShoppingBag size={48} className="text-slate-200" />
                              </div>
                           )}
                           {/* Category Badge */}
                           <div className="absolute top-4 left-4">
                              <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm border border-white/50">
                                 {item.category}
                              </span>
                           </div>
                           {/* Stock Badge */}
                           {item.stock <= 0 && (
                              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                 <span className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                                    Out of Stock
                                 </span>
                              </div>
                           )}
                        </div>

                        {/* Content */}
                        <div className="p-5">
                           <h3 className="font-black text-slate-900 text-lg mb-1 leading-tight line-clamp-1 group-hover:text-red-600 transition-colors">
                              {getName(item)}
                           </h3>
                           <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2 leading-relaxed">
                              {getDesc(item)}
                           </p>

                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <Tag size={14} className="text-emerald-500" />
                                 <span className="text-xl font-black text-emerald-600">
                                    {formatPrice(item.price)}
                                 </span>
                              </div>
                              {item.stock > 0 && (
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">
                                    {item.stock} in stock
                                 </span>
                              )}
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </div>
            )}

            {/* Results Count */}
            {!loading && filteredItems.length > 0 && (
               <div className="text-center mt-10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                     Showing {filteredItems.length} of {items.length} products
                  </p>
               </div>
            )}
         </div>
      </div>
   );
}