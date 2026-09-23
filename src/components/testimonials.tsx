"use client";

import { useRef, useState } from "react";
import type { SiteContent } from "@/content/site";
import { AssetIcon } from "./ui";

export function Testimonials({ content: c }: { content: SiteContent }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [desktopStart, setDesktopStart] = useState(0);
  function goTo(index: number) {
    const target = (index + c.testimonials.items.length) % c.testimonials.items.length;
    if (track.current && track.current.scrollWidth <= track.current.clientWidth) {
      setDesktopStart(target);
      setActive(target);
      return;
    }
    const element = track.current?.children[target] as HTMLElement | undefined;
    if (element && track.current) track.current.scrollTo({ left: element.offsetLeft - track.current.offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    setActive(target);
  }
  return <section className="section tinted" id="testimonials"><div className="container">
    <div className="section-heading"><h2>{c.testimonials.title}</h2><div className="carousel-controls"><button className="previous-arrow" onClick={() => goTo(active - 1)} aria-label={c.ui.previous}><AssetIcon file="de25f.svg" width={33} height={33} /></button><button className="next-arrow" onClick={() => goTo(active + 1)} aria-label={c.ui.next}><AssetIcon file="de25f.svg" width={33} height={33} /></button></div></div>
    <div className="testimonial-track" ref={track} onScroll={() => { if (track.current) { const card = track.current.children[0] as HTMLElement; setActive(Math.round(track.current.scrollLeft / (card.offsetWidth + 20))); } }}>
      {c.testimonials.items.map((_, index) => c.testimonials.items[(index + desktopStart) % c.testimonials.items.length]).map(item => <figure className="testimonial" key={item.name}><div className="quote-top"><AssetIcon file="5bcf0.svg" width={75} height={54} /><span>{item.tag}</span></div><blockquote>{item.text}</blockquote><figcaption><strong>{item.name}</strong><span>{item.detail}</span></figcaption></figure>)}
    </div><div className="carousel-dots">{c.testimonials.items.map((item, index) => <button key={item.name} onClick={() => goTo(index)} aria-label={`${c.testimonials.title}: ${item.name}`} aria-current={active === index ? "true" : undefined} />)}</div>
  </div></section>;
}
