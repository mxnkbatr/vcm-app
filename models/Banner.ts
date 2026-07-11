export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  active: boolean;
  order?: number;
  intervalSec?: number;
}

export interface BannerDoc {
  _id: string;
  title: { mn: string; en?: string };
  subtitle?: { mn?: string; en?: string };
  image: string;
  link?: string;
  active: boolean;
  order?: number;
  intervalSec?: number;
}
