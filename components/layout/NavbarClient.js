"use client";

import UserButton from "@/components/auth/UserMenu";
import DarkModeButton from "./DarkModeButton";
import CafecitoButton from "./CafecitoButton";
import MobileMenu from "./MobileMenu";

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
