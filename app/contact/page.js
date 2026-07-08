import { Mail } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Contacto - Futear",
  description:
    "Contacto con Futear para sugerencias, soporte, reportes o colaboraciones.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen mt-[56px] md:mt-[64px] flex items-center justify-center px-4">
        <main className="max-w-3xl mx-auto rounded-xl shadow-xl p-6 bg-[var(--primary)] dark:bg-[var(--secondary)] text-white">
          <h1 className="text-3xl font-bold text-center mb-8">Contacto</h1>

          <p className="text-center mb-10 leading-relaxed">
            En Futear valoramos cada mensaje de la comunidad. Si tenés
            sugerencias, encontraste un error o querés colaborar con el
            proyecto, podés escribirnos.
          </p>

          <div className="flex justify-center">
            <a
              href="mailto:futear.app@gmail.com"
              className="flex items-center gap-3 text-lg hover:opacity-80"
            >
              <Mail className="w-6 h-6" />
              futear.app@gmail.com
            </a>
          </div>

          <p className="text-center mt-10 text-sm opacity-80">
            Respondemos todos los mensajes lo antes posible.
          </p>
        </main>
      </div>

      <Footer />
    </>
  );
}
