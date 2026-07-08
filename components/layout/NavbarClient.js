"use client";

import dynamic from "next/dynamic";

const UserButton = dynamic(() => import("@/components/auth/UserMenu"), {
  ssr: false,
});
const DarkModeButton = dynamic(() => import("./DarkModeButton"), {
  ssr: false,
});
const CafecitoButton = dynamic(() => import("./CafecitoButton"), {
  ssr: false,
});
const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });

export default function NavbarClient() {
  return (
    <>
      <div className="hidden md:flex items-center gap-3">
        <CafecitoButton />
        <DarkModeButton />
        <UserButton />
      </div>

      <div className="md:hidden">
        <MobileMenu />
      </div>
    </>
  );
}
