// Footer.jsx

"use client";

import { memo } from "react";
import Link from "next/link";
import { Heart, Instagram, Mail, Twitter } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

// Defaults globales
const DEFAULT_TITLE = "Futear";
const DEFAULT_LOGO = "/images/logo.png";
const DEFAULT_HOME = "/";

// Redes por defecto
export const DEFAULT_SOCIALS = [
  {
    icon: Twitter,
    label: "Twitter",
    name: "Twitter",
    url: "https://x.com/futear_app",
    even: true,
  },
  {
    icon: Instagram,
    label: "Instagram",
    name: "Instagram",
    url: "https://www.instagram.com/futear.app/",
    even: false,
  },
  {
    icon: Mail,
    label: "Email",
    name: "Contacto",
    url: "mailto:futear.app@gmail.com",
    even: true,
  },
];

function Footer({
  title = DEFAULT_TITLE,

  // 🔥 ahora recibe shield y logo
  shield = "",
  logo = DEFAULT_LOGO,

  homeUrl = DEFAULT_HOME,
  socials = DEFAULT_SOCIALS,
  showCuervo = true,

  fanBase = "Fútbol",
  fanBasePrimaryColor = "var(--primary)",
  fanBaseSecondaryColor = "var(--primary)",
}) {
  // 🔥 prioridad al shield
  const displayLogo = shield || logo || DEFAULT_LOGO;

  return (
    <footer className="relative w-full px-6 py-4 bg-[var(--footer-bg)] text-[var(--footer-text)] mt-12 transition-colors">
      {/* Cuervo flotante */}
      {showCuervo && (
        <div className="absolute right-4 -top-[42px] pointer-events-none hidden sm:block">
          <Image
            src="/images/cuervo.png"
            alt="Cuervo"
            className="w-12 h-12 object-contain -scale-x-100"
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <div className="relative z-10 w-full">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2 max-sm:w-full">
            {/* LOGO + TITLE */}
            <Link
              href={homeUrl}
              prefetch={false}
              className="flex items-center gap-3 cursor-pointer max-sm:mb-10"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Image
                  src={displayLogo}
                  alt={`Logo ${title}`}
                  width={26}
                  height={40}
                  className="object-contain"
                />
              </div>

              <span className="text-md font-black uppercase text-[var(--footer-text)]">
                {title}
              </span>
            </Link>

            <div className="text-[0.7rem] md:text-sm text-center flex items-center gap-1 absolute md:static left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 max-sm:top-14 max-sm:w-full justify-center">
              <span className="text-[var(--footer-muted-text)]">Hecho con</span>

              <Heart
                size={14}
                className="text-red-500 fill-current animate-pulse"
              />

              <span className="text-[var(--footer-muted-text)]">
                para los fanáticos de
              </span>

              {/* Fanbase customizable */}
              <span className="font-semibold">
                <span style={{ color: fanBasePrimaryColor }}>
                  {fanBase.split(" ")[0]}
                </span>{" "}
                {fanBase.split(" ")[1] && (
                  <span style={{ color: fanBaseSecondaryColor }}>
                    {fanBase.split(" ")[1]}
                  </span>
                )}
              </span>
            </div>

            {/* Redes sociales */}
            <TooltipProvider delayDuration={0}>
              <div className="flex gap-3">
                {socials.map(({ icon: Icon, label, name, url, even }) => {
                  const bg = even
                    ? "hover:bg-[var(--footer-social-hover-bg-primary)]"
                    : "hover:bg-[var(--footer-social-hover-bg-secondary)]";

                  const tipBg = even
                    ? "bg-[var(--footer-tooltip-bg-primary)] text-[var(--footer-tooltip-text-primary)]"
                    : "bg-[var(--footer-tooltip-bg-secondary)] text-[var(--footer-tooltip-text-secondary)]";

                  const iconHover = even
                    ? "group-hover:text-[var(--footer-icon-hover-text-primary)]"
                    : "group-hover:text-[var(--footer-icon-hover-text-secondary)]";

                  return (
                    <Tooltip key={label}>
                      <TooltipTrigger asChild>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className={`group p-2.5 rounded-xl transition duration-300 hover:scale-110 hover:shadow-lg text-[var(--footer-text)] ${bg}`}
                        >
                          <Icon
                            size={18}
                            className={`transition ${iconHover}`}
                          />
                        </a>
                      </TooltipTrigger>

                      <TooltipContent
                        side="top"
                        className={`border-none rounded-lg ${tipBg}`}
                      >
                        {name}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-[var(--footer-divider)]" />
          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/about"
              prefetch={false}
              className="text-[var(--footer-muted-text)] hover:text-[var(--footer-text)]"
            >
              Sobre Nosotros
            </Link>

            <Link
              href="/privacy-policy"
              prefetch={false}
              className="text-[var(--footer-muted-text)] hover:text-[var(--footer-text)]"
            >
              Política de Privacidad
            </Link>

            <Link
              href="/terms"
              prefetch={false}
              className="text-[var(--footer-muted-text)] hover:text-[var(--footer-text)]"
            >
              Términos y Condiciones
            </Link>

            <Link
              href="/cookies"
              prefetch={false}
              className="text-[var(--footer-muted-text)] hover:text-[var(--footer-text)]"
            >
              Política de Cookies
            </Link>

            <Link
              href="/contact"
              prefetch={false}
              className="text-[var(--footer-muted-text)] hover:text-[var(--footer-text)]"
            >
              Contáctanos
            </Link>
          </div>
          {/* Copy */}
          <div className="flex justify-center">
            <p className="text-xs text-center text-[var(--footer-muted-text)]">
              © 2025 {title}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
