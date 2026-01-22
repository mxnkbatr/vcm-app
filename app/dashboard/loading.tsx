import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-[#FAFAFA]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#E31B23]" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    Loading Dashboard...
                </p>
            </div>
        </div>
    );
}
