// import LoginForm from "@/components/auth/LoginForm";
import Navbar from "@/components/layout/Navbar";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen mt-[56px] md:mt-[64px] flex items-center justify-center">
        <Suspense fallback={null}>
          <p className="opacity-70">
            Esta funcionalidad estará disponible próximamente.
          </p>
          {/* <LoginForm /> */}
        </Suspense>
      </div>
    </>
  );
}
