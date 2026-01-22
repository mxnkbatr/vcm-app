import { Loader2 } from "lucide-react";

export default function BookingLoading() {
    return (
        <div className="min-h-[100dvh] bg-[#F8F9FC] font-sans pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Skeleton */}
                <div className="text-center mb-16 space-y-4">
                    <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg mx-auto" />
                    <div className="h-12 w-96 bg-slate-200 animate-pulse rounded-lg mx-auto" />
                    <div className="h-6 w-[600px] bg-slate-200 animate-pulse rounded-lg mx-auto" />
                </div>

                {/* Main Content Skeleton */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6 md:p-10">
                        <div className="h-8 w-full bg-slate-200 animate-pulse rounded-lg mb-8" />
                        <div className="space-y-4">
                            <div className="h-32 w-full bg-slate-100 animate-pulse rounded-3xl" />
                            <div className="h-32 w-full bg-slate-100 animate-pulse rounded-3xl" />
                            <div className="h-32 w-full bg-slate-100 animate-pulse rounded-3xl" />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl h-full">
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-10 h-10 animate-spin text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
