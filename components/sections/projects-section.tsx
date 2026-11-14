import { featuredProjects } from "@/lib/data/projects";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localize } from "@/lib/i18n/localized";
import { SectionHeading } from "@/components/section-heading";
import { ProjectCard } from "@/components/sections/project-card";

/**
 * Nueve proyectos: cada tarjeta ocupa ~una pantalla y alterna lado, dejando
 * el otro lado libre para su portal 3D (la escena sincroniza el portal activo
 * con el progreso de esta sección).
 */
export function ProjectsSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.projects;
  return (
    <section id="proyectos" data-world-section="projects" className="relative px-6 pt-28 sm:pt-36">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <div className="mx-auto max-w-6xl">
        {featuredProjects.map((p, index) => (
          <ProjectCard
            key={p.id}
            total={featuredProjects.length}
            project={{
              id: p.id,
              index,
              name: p.name,
              codename: p.codename,
              role: localize(p.role, locale),
              year: p.year,
              description: localize(p.description, locale),
              stack: p.stack,
              href: p.href,
              hrefLabel: localize(p.hrefLabel, locale),
              image: p.image,
              imageAlt: `${t.screenshotAlt} ${p.name}`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
