import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/data/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { Button } from "@/components/ui/button";
import { CV_URL, PORTRAIT_SRC } from "@/components/home/founder";

export function AboutHeader({ locale, dict }: { locale: Locale; dict: Dictionary["about"] }) {
  return (
    <header className="pb-24 pt-[calc(var(--nav)+64px)] max-sm:pb-16 max-sm:pt-[calc(var(--nav)+40px)]">
      <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-7">
          <p className="t-label inline-flex self-start rounded-full bg-secondary px-3 py-1.5 text-[14px]">{dict.badge}</p>
          <h1 className="t-h1 mt-5">{siteConfig.author.name} Romo</h1>
          <p className="t-lead mt-5 measure">{dict.lead}</p>
          <div className="btn-row btn-row--stack mt-8">
            <Button asChild>
              <Link href={`/${locale}#contacto`}>{dict.ctaContact}</Link>
            </Button>
            <Button variant="secondary" asChild>
              <a href={CV_URL} target="_blank" rel="noopener noreferrer">
                CV
              </a>
            </Button>
            <Link href={`/${locale}#casos`} className="link ml-2 max-sm:ml-0 max-sm:self-start">
              {dict.ctaProjects}
            </Link>
          </div>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="portrait-card">
            <div className="relative aspect-square overflow-hidden rounded-full">
              <Image src={PORTRAIT_SRC} alt={dict.portraitAlt} fill priority sizes="(max-width: 640px) 70vw, 300px" quality={90} className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
