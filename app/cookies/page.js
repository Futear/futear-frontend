import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Política de Cookies - Futear",
  description:
    "Uso de cookies en Futear para autenticación, analítica y publicidad.",
};

export default function CookiesPolicyPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen mt-[56px] md:mt-[64px] py-24 px-4">
        <main className="max-w-4xl mx-auto rounded-xl shadow-xl p-6 bg-[var(--primary)] dark:bg-[var(--secondary)] text-white">
          <h1 className="text-3xl font-bold text-center mb-8">
            Política de Cookies
          </h1>

          <section className="space-y-4 leading-relaxed">
            <p>
              Futear utiliza cookies para mejorar la experiencia del usuario.
            </p>

            <h2 className="font-bold text-xl">Tipos de cookies</h2>
            <ul className="list-disc pl-6">
              <li>Cookies esenciales (login y seguridad).</li>
              <li>Cookies de rendimiento.</li>
              <li>Cookies analíticas.</li>
              <li>Cookies publicitarias (AdSense).</li>
            </ul>

            <h2 className="font-bold text-xl">Gestión</h2>
            <p>
              El usuario puede desactivar cookies desde su navegador en
              cualquier momento.
            </p>

            <h2 className="font-bold text-xl">Contacto</h2>
            <p>futear.app@gmail.com</p>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
