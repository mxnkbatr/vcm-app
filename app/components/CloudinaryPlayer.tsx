"use client";

import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";

interface CloudinaryPlayerProps {
    publicId: string;
    className?: string;
    cloudName?: string;
}

const CloudinaryPlayer = ({ publicId, className, cloudName }: CloudinaryPlayerProps) => {
    return (
        <div className={`${className}`}>
            <CldVideoPlayer
                width="1920"
                height="1080"
                src={publicId}
                autoplay="always"
                loop={true}
                muted={true}
                controls={false}
                className="object-cover w-full h-full"
                sourceTypes={['hls', 'dash', 'mp4']}
                onError={(error: any) => {
                    console.warn('Video player error:', error);
                }}
                config={{
                    cloud: {
                        // Use provided cloudName or fallback to env var (or undefined to let CldVideoPlayer handle it)
                        cloudName: cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                    }
                }}
                transformation={{
                    quality: "auto",
                    fetchFormat: "auto",
                    width: 1400,
                    crop: "limit",
                }}
            />
        </div>
    );
};

export default CloudinaryPlayer;
