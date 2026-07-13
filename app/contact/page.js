import { Mail } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Contacto - Futear",
  description:
    "Ponte en contacto con Futear para realizar consultas, enviar sugerencias, reportar errores o colaborar con el proyecto.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen mt-[56px] md:mt-[64px] py-24 px-4">
        <main className="max-w-4xl mx-auto rounded-xl shadow-xl p-6 bg-[var(--primary)] dark:bg-[var(--secondary)] text-white">
          <h1 className="text-3xl font-bold text-center mb-4">Contacto</h1>

          <p className="text-center opacity-80 mb-10 leading-relaxed">
            En Futear valoramos la opinión de nuestra comunidad. Si tienes
            consultas, sugerencias, encontraste algún error o deseas colaborar
            con el proyecto, estaremos encantados de recibir tu mensaje.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">
              ¿En qué podemos ayudarte?
            </h2>

            <p className="mb-4 leading-relaxed">
              Puedes comunicarte con nosotros para cualquier tema relacionado
              con la plataforma. Revisamos todos los mensajes recibidos y
              procuramos responder en el menor tiempo posible.
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Reportar errores o problemas técnicos.</li>
              <li>Sugerir nuevos juegos o modos de juego.</li>
              <li>Proponer jugadores, clubes o competiciones.</li>
              <li>Realizar consultas generales sobre Futear.</li>
              <li>
                Solicitar la eliminación o actualización de datos personales.
              </li>
              <li>Consultas comerciales o publicitarias.</li>
              <li>Propuestas de colaboración o alianzas.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Correo electrónico</h2>

            <p className="mb-6 leading-relaxed">
              Si deseas ponerte en contacto con nosotros, puedes escribirnos al
              siguiente correo electrónico:
            </p>

            <div className="flex justify-center">
              <a
                href="mailto:futear.app@gmail.com"
                className="flex items-center gap-3 text-lg font-semibold hover:opacity-80 transition-opacity"
              >
                <Mail className="w-6 h-6" />
                futear.app@gmail.com
              </a>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">
              Tiempo estimado de respuesta
            </h2>

            <p className="leading-relaxed">
              Nuestro objetivo es responder todas las consultas lo antes
              posible. Aunque el tiempo de respuesta puede variar según el
              volumen de mensajes recibidos, normalmente contestamos dentro de
              los siguientes días hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              Gracias por ayudarnos a mejorar
            </h2>

            <p className="leading-relaxed">
              Futear continúa evolucionando gracias a las sugerencias y el apoyo
              de la comunidad. Cada comentario nos ayuda a mejorar la plataforma
              y desarrollar nuevas experiencias para los fanáticos del fútbol de
              todo el mundo.
            </p>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
