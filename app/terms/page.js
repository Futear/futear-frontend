import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Términos y Condiciones - Futear",
  description:
    "Términos de uso de la plataforma Futear y condiciones del servicio.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen mt-[56px] md:mt-[64px] py-24 px-4">
        <main className="max-w-5xl mx-auto rounded-xl shadow-xl p-6 bg-[var(--primary)] dark:bg-[var(--secondary)] text-white">
          <h1 className="text-3xl font-bold text-center mb-8">
            Términos y Condiciones
          </h1>

          <section className="space-y-4 leading-relaxed">
            <p>Al utilizar Futear aceptas estos términos.</p>

            <h2 className="font-bold text-xl">Uso del servicio</h2>
            <p>
              El usuario se compromete a utilizar la plataforma de forma
              responsable.
            </p>

            <h2 className="font-bold text-xl">Propiedad intelectual</h2>
            <p>
              Todo el contenido de Futear pertenece a la plataforma o a sus
              respectivos licenciantes.
            </p>

            <h2 className="font-bold text-xl">Disponibilidad</h2>
            <p>No garantizamos disponibilidad continua del servicio.</p>

            <h2 className="font-bold text-xl">Modificaciones</h2>
            <p>Futear puede modificar estos términos en cualquier momento.</p>

            <h2 className="font-bold text-xl">Contacto</h2>
            <p>futear.app@gmail.com</p>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
