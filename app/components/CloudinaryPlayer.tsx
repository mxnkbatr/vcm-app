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
    // q_auto:eco: High compression for background videos
    // vc_auto: Automatic video codec selection (h265/vp9/etc if supported)
    // w_800,c_limit: Limit width to 800px for background use to drastically reduce file size
    
    const posterUrl = `https://res.cloudinary.com/${cName}/image/upload/q_auto:best,f_auto,so_0,w_1000/${publicId}.jpg`;

    return (
        <div className={`${className} relative overflow-hidden`}>
            <video
                className="object-cover w-full h-full"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={posterUrl}
                style={{ objectFit: 'cover' }}
                // @ts-ignore
                fetchpriority="low" 
            >
                {/* Prefer WebM for better compression/quality ratio on supported browsers */}
                <source src={`${baseUrl}/q_auto:eco,vc_auto,w_800,c_limit,f_webm/${publicId}.webm`} type="video/webm" />
                {/* Fallback to MP4 */}
                <source src={`${baseUrl}/q_auto:eco,vc_auto,w_800,c_limit,f_mp4/${publicId}.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default CloudinaryPlayer;



