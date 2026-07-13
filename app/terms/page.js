import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Términos y Condiciones - Futear",
  description:
    "Conoce los términos y condiciones de uso de Futear, la plataforma de juegos y desafíos de fútbol.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen mt-[56px] md:mt-[64px] py-24 px-4">
        <main className="max-w-5xl mx-auto rounded-xl shadow-xl p-6 bg-[var(--primary)] dark:bg-[var(--secondary)] text-white">
          <h1 className="text-3xl font-bold text-center mb-4">
            Términos y Condiciones
          </h1>

          <p className="text-center opacity-80 mb-10">
            Última actualización: Julio 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">1. Objeto del servicio</h2>

            <p className="leading-relaxed">
              Futear es una plataforma digital dedicada a ofrecer juegos,
              desafíos y contenido interactivo relacionado con el fútbol.
              Nuestro objetivo es brindar una experiencia entretenida para
              aficionados de todas las edades mediante diferentes modalidades de
              juego basadas en jugadores, clubes, selecciones, competiciones,
              camisetas y otros elementos históricos y actuales del deporte.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              2. Aceptación de los términos
            </h2>

            <p className="leading-relaxed">
              Al acceder o utilizar Futear aceptas cumplir estos Términos y
              Condiciones, así como la Política de Privacidad y la Política de
              Cookies. Si no estás de acuerdo con alguno de estos términos,
              deberás abstenerte de utilizar la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">3. Uso permitido</h2>

            <p className="leading-relaxed">
              El usuario se compromete a utilizar Futear de forma responsable,
              respetando las leyes aplicables y evitando cualquier acción que
              pueda afectar negativamente al funcionamiento del sitio, a otros
              usuarios o a los servicios ofrecidos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">4. Conductas prohibidas</h2>

            <p className="mb-4 leading-relaxed">
              Con el fin de garantizar una experiencia justa para toda la
              comunidad, queda prohibido:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Manipular el funcionamiento de los juegos.</li>
              <li>Intentar acceder a áreas restringidas del sitio.</li>
              <li>Automatizar el uso mediante bots o scripts.</li>
              <li>Alterar rankings o estadísticas de forma fraudulenta.</li>
              <li>
                Copiar, distribuir o reutilizar contenido sin autorización.
              </li>
              <li>
                Realizar actividades que puedan comprometer la seguridad del
                servicio.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">5. Cuentas de usuario</h2>

            <p className="leading-relaxed">
              Algunas funciones de Futear pueden requerir la creación de una
              cuenta. El usuario es responsable de mantener la confidencialidad
              de sus credenciales y de todas las actividades realizadas desde su
              cuenta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">6. Propiedad intelectual</h2>

            <p className="leading-relaxed">
              El diseño, código fuente, identidad visual, logotipos,
              ilustraciones, textos y demás elementos desarrollados para Futear
              pertenecen a la plataforma o a sus respectivos titulares y se
              encuentran protegidos por la legislación aplicable sobre propiedad
              intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              7. Disponibilidad del servicio
            </h2>

            <p className="leading-relaxed">
              Trabajamos para mantener Futear disponible de forma continua,
              aunque no podemos garantizar un funcionamiento ininterrumpido.
              Podrán producirse interrupciones por tareas de mantenimiento,
              mejoras técnicas, incidencias de infraestructura o causas ajenas a
              nuestro control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              8. Limitación de responsabilidad
            </h2>

            <p className="leading-relaxed">
              Futear no será responsable por pérdidas o daños derivados del uso
              o imposibilidad de uso de la plataforma, interrupciones del
              servicio, errores técnicos, información incorrecta proporcionada
              por terceros o cualquier circunstancia fuera de nuestro control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">9. Enlaces externos</h2>

            <p className="leading-relaxed">
              Algunas secciones de Futear pueden contener enlaces hacia sitios
              web de terceros. No controlamos el contenido ni las políticas de
              dichos sitios, por lo que recomendamos revisar sus propios
              términos y condiciones antes de utilizarlos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">10. Modificaciones</h2>

            <p className="leading-relaxed">
              Nos reservamos el derecho de actualizar estos Términos y
              Condiciones cuando resulte necesario para reflejar cambios en la
              plataforma, nuevas funcionalidades, requisitos legales o mejoras
              del servicio. La versión vigente será siempre la publicada en esta
              página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Contacto</h2>

            <p className="leading-relaxed">
              Si tienes preguntas relacionadas con estos Términos y Condiciones,
              puedes escribirnos a:
            </p>

            <p className="mt-3 font-semibold">futear.app@gmail.com</p>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
