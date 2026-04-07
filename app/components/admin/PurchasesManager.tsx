"use client";

import React, { useState, useEffect } from "react";
import { Copy, CheckCircle2, AlertCircle, ShoppingCart } from "lucide-react";

export default function PurchasesManager() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await fetch("/api/purchases");
      if (res.ok) {
        const data = await res.json();
        setPurchases(data);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Loading purchases...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="text-sky-500" />
            Purchases & Orders
          </h2>
          <p className="text-slate-500 text-sm mt-1">View all items purchased through QPay</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4">Item</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
              {purchases.map((purchase) => (
                <tr key={purchase._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                    {purchase.itemId?.name?.en || purchase.itemId?.name?.mn || "Unknown Item"}
                  </td>
                  <td className="p-4 font-bold text-sky-600 dark:text-sky-400">
                    {purchase.phoneNumber}
                  </td>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    ${purchase.amount}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20">
                      {purchase.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-max ${purchase.status === "completed" ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:border-green-500/20" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                      {purchase.status === "completed" && <CheckCircle2 size={12} />}
                      {purchase.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">
                    {new Date(purchase.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    No purchases found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
