import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function ButtonLink({ href, children, outline = false }: { href: string; children: ReactNode; outline?: boolean }) {
  return <Link className={`button${outline ? " button-outline" : ""}`} href={href}>{children}</Link>;
}

export function SectionHeading({ title, description }: { title: string; description?: string }) {
  return <div className="section-heading"><h2>{title}</h2>{description && <p>{description}</p>}</div>;
}

export function Photo({ file, alt = "", className = "", priority = false }: { file: string; alt?: string; className?: string; priority?: boolean }) {
  return <div className={`photo ${className}`}><Image src={file.startsWith("https://") ? file : `/images/${file}`} unoptimized={file.startsWith("https://")} alt={alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1280px) 50vw, 600px" preload={priority} /></div>;
}

export function AssetIcon({ file, width = 28, height = width }: { file: string; width?: number; height?: number }) {
  return <Image src={`/images/${file}`} alt="" width={width} height={height} unoptimized />;
}
