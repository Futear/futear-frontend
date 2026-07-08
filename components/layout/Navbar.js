import Image from "next/image";
import Link from "next/link";
import NavbarClient from "@/components/layout/NavbarClient";

export default function Navbar({
  title = "Futear",
  logo = "/images/logo.png",
  homeUrl = "/",
}) {
  return (
    <nav className="w-full h-[56px] md:h-[64px] px-6 flex items-center justify-between fixed z-50 bg-[var(--navbar-bg)] text-[var(--navbar-text)]">
      <Link href={homeUrl} className="flex items-center gap-3">
        <Image
          src={logo}
          alt={title}
          width={48}
          height={48}
          priority
          style={{ width: "auto", height: "48px" }}
        />

        <span className="hidden sm:block font-black uppercase">{title}</span>
      </Link>

      <NavbarClient />
    </nav>
  );
}
