"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { setHoveredProject } from "@/lib/world/interaction-store";

export type ProjectCardData = {
  id: string;
  index: number;
  name: string;
  codename: string;
  role: string;
  year: string;
  description: string;
  stack: string[];
  href: string;
  hrefLabel: string;
  image: string;
  imageAlt: string;
};

/**
 * Tarjeta HTML de un proyecto: es la capa accesible (texto, enlace, captura
 * de respaldo). Su portal 3D se ilumina al pasar el puntero o enfocar.
 * La captura se oculta en pantallas grandes cuando el portal 3D está activo.
 */
export function ProjectCard({ project, total }: { project: ProjectCardData; total: number }) {
  const on = () => setHoveredProject(project.id);
  const off = () => setHoveredProject(null);
  const right = project.index % 2 === 1;

  return (
    <article
      data-project={project.id}
      onPointerEnter={on}
      onPointerLeave={off}
      className={`flex min-h-[85svh] items-center py-10 ${right ? "lg:justify-end" : ""}`}
    >
      <div className="glass-panel w-full max-w-md rounded-3xl p-7 sm:p-8">
        <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span className="text-primary">
            {String(project.index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span>
            {project.role} · {project.year}
          </span>
        </div>

        <div className="world-fallback-shot relative mt-5 aspect-[2/1] overflow-hidden rounded-xl border border-white/10">
          <Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 768px) 100vw, 448px" className="object-cover object-top" />
        </div>

        <h3 className="mt-6 font-display text-3xl font-semibold tracking-tight">{project.name}</h3>
        <p className="mt-1 font-mono text-xs text-primary/80">{project.codename}</p>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{project.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span key={tech} className="rounded-md border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[11px] text-primary">
              {tech}
            </span>
          ))}
        </div>

        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          onFocus={on}
          onBlur={off}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-accent"
        >
          {project.hrefLabel}
          <span className="sr-only">: {project.name}</span>
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
