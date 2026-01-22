"use client";

interface CloudinaryPlayerProps {
    publicId: string;
    className?: string;
    cloudName?: string;
}

const CloudinaryPlayer = ({ publicId, className, cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME }: CloudinaryPlayerProps) => {
    // Fallback if no cloudName provided
    const cName = cloudName || "dxoxdiuwr"; 

    const baseUrl = `https://res.cloudinary.com/${cName}/video/upload`;
    
    // Construct URLs with optimizations
    // q_auto: Automatic quality adjustment
    // vc_auto: Automatic video codec selection (h265/vp9/etc if supported)
    // f_auto: standard format delivery, but for source tags we specify mp4/webm explicitly
    
    const posterUrl = `${baseUrl}/q_auto,f_auto,so_0/${publicId}.jpg`;

    return (
        <div className={`${className} relative overflow-hidden`}>
            <video
                className="object-cover w-full h-full"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster={posterUrl}
                style={{ objectFit: 'cover' }}
                // @ts-ignore - fetchpriority is a valid attribute but React types might not have it yet
                fetchpriority="high" 
            >
                {/* Prefer WebM for better compression/quality ratio on supported browsers */}
                <source src={`${baseUrl}/q_auto,vc_auto,f_webm/${publicId}.webm`} type="video/webm" />
                {/* Fallback to MP4 */}
                <source src={`${baseUrl}/q_auto,vc_auto,f_mp4/${publicId}.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default CloudinaryPlayer;
