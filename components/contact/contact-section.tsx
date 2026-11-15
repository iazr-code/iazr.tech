import { siteConfig } from "@/lib/data/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { BrandIcon } from "@/components/home/brand-icon";
import { ContactForm } from "@/components/contact/contact-form";
import { BookingButton } from "@/components/booking/booking-button";
import { PortalButton } from "@/components/passkey/portal-button";

/** Contact: direct channels on the left, the enquiry form on the right. */
export function ContactSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.contact;
  const channels = [
    { id: "whatsapp", icon: "whatsapp", value: siteConfig.author.whatsappDisplay, href: siteConfig.socials.whatsapp, ...t.channels.whatsapp },
    { id: "email", icon: "gmail", value: siteConfig.author.email, href: siteConfig.socials.email, ...t.channels.email },
    { id: "linkedin", icon: "linkedin", value: "in/iazr96", href: siteConfig.socials.linkedin, ...t.channels.linkedin },
    { id: "instagram", icon: "instagram", value: "@iazr.tech", href: siteConfig.socials.instagram, ...t.channels.instagram },
  ];

  return (
    <section id="contacto" data-world-section="contact" className="section g-cobalt border-t border-border">
      <div className="wrap grid h-full gap-x-6 gap-y-12 max-lg:gap-y-8 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-5">
          <h2 className="t-h2">{t.title}</h2>
          <p className="t-lead mt-4">{t.description}</p>
          <h3 className="t-label mt-10 text-muted-foreground">{t.channelsTitle}</h3>
          <ul className="mt-3">
            {channels.map((c) => (
              <li key={c.id}>
                <a
                  href={c.href}
                  target={c.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group flex min-h-14 items-center gap-4 border-t border-border py-2"
                >
                  <BrandIcon name={c.icon} className="!size-9 !rounded-[8px] [&_img]:!size-[20px]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] text-muted-foreground">{c.label}</span>
                    <span className="block truncate font-medium">{c.value}</span>
                  </span>
                  <span className="link text-[14px] max-sm:sr-only">{c.cta}</span>
                </a>
              </li>
            ))}
          </ul>
          <BookingButton source="contact" variant="secondary" className="mt-8 self-start max-sm:w-full">
            {dict.hud.book}
          </BookingButton>
          <div className="card-dark mt-8 p-5">
            <h3 className="font-medium">{dict.portal.title}</h3>
            <p className="mt-1 text-[14px] text-muted-foreground">{dict.portal.teaser}</p>
            <PortalButton t={dict.portal} className="mt-4 max-sm:w-full" />
          </div>
        </div>
        <div className="card p-8 max-sm:p-5 lg:col-span-7">
          <h3 className="t-h3">{t.formTitle}</h3>
          <div className="mt-6">
            <ContactForm dict={t} locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}
