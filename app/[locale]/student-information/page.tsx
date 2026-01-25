"use client";

import StudentInformation from "@/app/components/StudentInformation";

export default function StudentInformationPage() {
  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto mb-12 text-center">
         <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-tight">
            Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31B23] to-rose-500">Profile.</span>
         </h1>
      </div>
      <div className="max-w-6xl mx-auto">
        <StudentInformation />
      </div>
    </div>
  );
}