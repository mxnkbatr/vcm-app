import { NextResponse } from 'next/server';
import { Banner } from '@/models/Banner';

export const revalidate = 300;

export async function GET() {
  // Mock data for banners
  const banners: Banner[] = [
      {
        id: '1',
        title: 'Inspiration in Action',
        image: 'https://scontent.fuln2-2.fna.fbcdn.net/v/t39.30808-6/574080514_1254673616704746_2734634584703551112_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=b895b5&_nc_ohc=uYLUQuf89tsQ7kNvwGYoJEF&_nc_oc=Adr5B5mRR_G_oHJ4YZFJ8Oj3sprfLF43RPikOwJL6QbS3I9q22yWgOsYoIkgPns8jdA&_nc_zt=23&_nc_ht=scontent.fuln2-2.fna&_nc_gid=7jGdMiJroBpPsgBPaSM5sA&_nc_ss=7a3a8&oh=00_Af06quI8sJ5jVTAAJTpvavP1wWO29hw7FXUT2bph8ZfM0g&oe=69E5073D',
        link: '/about',
        active: true,
      },
      {
        id: '2',
        title: 'Shoebox Project Mongolia',
        image: 'https://scontent.fuln8-1.fna.fbcdn.net/v/t39.30808-6/617134620_1318655110306596_6087394076990716216_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=105&ccb=1-7&_nc_sid=b895b5&_nc_ohc=0Teggzw7IzIQ7kNvwF3Gki7&_nc_oc=AdoBmfXYXrs5HrVSWILuIEEZpXG7siHhksp0GK7O6Faj-ORep2wqv2fBJqEs50_68ms&_nc_zt=23&_nc_ht=scontent.fuln8-1.fna&_nc_gid=eAn8Gar149Kvu1K4ldrS5w&_nc_ss=7a3a8&oh=00_Af2OiwWGy3wRlAOIZB0HlLhiJM_LqwNFVD3OYxAX16cmdw&oe=69E525DF',
        link: '/events',
        active: true,
      },
    ];

  return NextResponse.json({ banners }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
  });
}
