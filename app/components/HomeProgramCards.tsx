"use client";

import { Link } from "@/navigation";
import { ChevronRight, ClipboardList } from "lucide-react";
import ProgramGlyph from "./ui/ProgramGlyph";

export type HomeProgram = {
  id: string;
  slug: string;
  label: string;
  sub: string;
  href: string;
};

export default function HomeProgramCards({
  programs,
}: {
  programs: HomeProgram[];
}) {
  return (
    <div className="home-prog-rail">
      {programs.map((p) => (
        <Link key={p.id} href={p.href} prefetch className="home-prog-card press glass-press">
          <span className="home-prog-card__icon">
            <ProgramGlyph id={p.slug || p.id} size={22} />
          </span>
          <span className="home-prog-card__body">
            <span className="home-prog-card__title">{p.label}</span>
            {p.sub ? <span className="home-prog-card__sub">{p.sub}</span> : null}
          </span>
          <ChevronRight size={16} strokeWidth={1.75} className="home-prog-card__chev" />
        </Link>
      ))}
      <Link href="/programs/apply" prefetch className="home-prog-card home-prog-card--cta press glass-press">
        <span className="home-prog-card__icon home-prog-card__icon--cta">
          <ClipboardList size={22} strokeWidth={1.75} />
        </span>
        <span className="home-prog-card__body">
          <span className="home-prog-card__title">Нэгдэх</span>
          <span className="home-prog-card__sub">Өргөдөл илгээх</span>
        </span>
        <ChevronRight size={16} strokeWidth={1.75} className="home-prog-card__chev" />
      </Link>
    </div>
  );
}
