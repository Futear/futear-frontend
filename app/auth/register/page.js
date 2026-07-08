// import RegisterForm from "@/components/auth/RegisterForm";
import Navbar from "@/components/layout/Navbar";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center py-10 mt-[56px] md:mt-[64px]">
        <Suspense fallback={null}>
          {/* <RegisterForm /> */}
          <p className="opacity-70">
            Esta funcionalidad estará disponible próximamente.
          </p>
        </Suspense>
      </div>
    </>
  );
}
