import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Política de Privacidad - Futear",
  description:
    "Conoce cómo Futear recopila, utiliza y protege la información de sus usuarios.",
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
            Última actualización: Julio 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">1. Introducción</h2>

            <p className="leading-relaxed">
              En Futear respetamos la privacidad de nuestros usuarios y nos
              comprometemos a proteger la información personal que pueda ser
              recopilada durante el uso de la plataforma. Esta Política de
              Privacidad explica qué datos recopilamos, cómo los utilizamos,
              cómo los protegemos y cuáles son los derechos de los usuarios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              2. Información que recopilamos
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                Datos de cuenta como nombre de usuario y dirección de correo
                electrónico.
              </li>
              <li>
                Progreso, puntuaciones, estadísticas y logros obtenidos dentro
                de los juegos.
              </li>
              <li>Preferencias de uso y configuración de la plataforma.</li>
              <li>
                Información técnica del navegador, dispositivo y sistema
                operativo.
              </li>
              <li>
                Datos anónimos relacionados con el rendimiento y la analítica
                del sitio.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              3. Finalidad del tratamiento de los datos
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>Permitir el correcto funcionamiento de la plataforma.</li>
              <li>Guardar el progreso y las estadísticas de cada usuario.</li>
              <li>Personalizar la experiencia de juego.</li>
              <li>
                Detectar errores técnicos y prevenir actividades fraudulentas.
              </li>
              <li>
                Analizar el rendimiento del sitio para introducir mejoras.
              </li>
              <li>Mostrar publicidad cuando corresponda.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              4. Base legal del tratamiento
            </h2>

            <p className="leading-relaxed">
              El tratamiento de los datos personales se realiza cuando resulta
              necesario para prestar los servicios ofrecidos por Futear, cumplir
              obligaciones legales, proteger la seguridad de la plataforma o
              cuando el usuario haya otorgado su consentimiento para
              determinadas finalidades, como el uso de cookies o la
              personalización de anuncios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">5. Cookies</h2>

            <p className="leading-relaxed">
              Utilizamos cookies para mantener la sesión del usuario, recordar
              preferencias, analizar el uso del sitio y mejorar la experiencia
              de navegación. Para obtener más información puedes consultar
              nuestra Política de Cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">6. Publicidad</h2>

            <p className="leading-relaxed">
              Futear puede mostrar publicidad mediante Google AdSense u otros
              proveedores publicitarios. Estos servicios pueden utilizar cookies
              y tecnologías similares para mostrar anuncios relevantes, medir
              campañas publicitarias y limitar la repetición de anuncios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              7. Conservación de los datos
            </h2>

            <p className="leading-relaxed">
              Conservaremos la información únicamente durante el tiempo
              necesario para prestar nuestros servicios, cumplir obligaciones
              legales, resolver disputas o proteger la seguridad de la
              plataforma. Cuando los datos ya no resulten necesarios podrán ser
              eliminados o anonimizados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              8. Seguridad de la información
            </h2>

            <p className="leading-relaxed">
              Aplicamos medidas técnicas y organizativas destinadas a proteger
              la información frente a accesos no autorizados, pérdidas,
              alteraciones o usos indebidos. Aunque ningún sistema es
              completamente seguro, trabajamos continuamente para mejorar la
              protección de los datos de nuestros usuarios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">9. Derechos del usuario</h2>

            <p className="mb-4 leading-relaxed">
              Los usuarios podrán ejercer, cuando corresponda, los siguientes
              derechos sobre sus datos personales:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Acceder a la información almacenada.</li>
              <li>Solicitar la rectificación de datos incorrectos.</li>
              <li>Solicitar la eliminación de la información.</li>
              <li>Limitar u oponerse al tratamiento de determinados datos.</li>
              <li>
                Solicitar la portabilidad de la información cuando resulte
                aplicable.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              10. Transferencias internacionales
            </h2>

            <p className="leading-relaxed">
              Algunos proveedores tecnológicos utilizados por Futear pueden
              procesar información desde distintos países. En estos casos se
              procurará trabajar únicamente con proveedores que ofrezcan niveles
              adecuados de protección para los datos personales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              11. Cambios en esta política
            </h2>

            <p className="leading-relaxed">
              Futear podrá actualizar esta Política de Privacidad cuando resulte
              necesario para reflejar cambios legales, técnicos o funcionales de
              la plataforma. La versión vigente será siempre la publicada en
              esta página junto con su fecha de actualización.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">12. Contacto</h2>

            <p className="leading-relaxed">
              Si tienes preguntas relacionadas con esta Política de Privacidad o
              deseas ejercer alguno de tus derechos, puedes comunicarte con
              nosotros mediante el siguiente correo electrónico:
            </p>

            <p className="mt-3 font-semibold">futear.app@gmail.com</p>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
