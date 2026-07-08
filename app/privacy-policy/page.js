import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Política de Privacidad - Futear",
  description:
    "Política de privacidad de Futear: datos, cookies, analítica y uso de la plataforma.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen mt-[56px] md:mt-[64px] py-24 px-4">
        <main className="max-w-5xl mx-auto rounded-xl shadow-xl p-6 bg-[var(--primary)] dark:bg-[var(--secondary)] text-white">
          <h1 className="text-3xl font-bold text-center mb-4">
            Política de Privacidad
          </h1>

          <p className="text-center opacity-80 mb-10">
            Última actualización: Junio 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">1. Introducción</h2>
            <p>
              En Futear respetamos tu privacidad y nos comprometemos a proteger
              la información de nuestros usuarios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              2. Información que recopilamos
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Datos de cuenta (email, usuario).</li>
              <li>Progreso y estadísticas de juegos.</li>
              <li>Preferencias dentro de la plataforma.</li>
              <li>Datos técnicos del navegador y dispositivo.</li>
              <li>Datos anónimos de analítica.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">3. Uso de datos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proveer funcionalidades de la plataforma.</li>
              <li>Guardar progreso y estadísticas.</li>
              <li>Mejorar experiencia del usuario.</li>
              <li>Detectar errores y prevenir abuso.</li>
              <li>Analítica y rendimiento.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">4. Cookies</h2>
            <p>
              Usamos cookies para autenticación, preferencias, rendimiento y
              analítica.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">5. Publicidad</h2>
            <p>
              Podemos utilizar Google AdSense y otros socios publicitarios que
              pueden usar cookies para mostrar anuncios relevantes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">6. Derechos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceso a datos.</li>
              <li>Rectificación.</li>
              <li>Eliminación.</li>
              <li>Limitación del uso.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Contacto</h2>
            <p>futear.app@gmail.com</p>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
