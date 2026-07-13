import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Política de Cookies - Futear",
  description:
    "Conoce cómo Futear utiliza cookies para mejorar la experiencia del usuario, ofrecer publicidad relevante y analizar el funcionamiento de la plataforma.",
};

export default function CookiesPolicyPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen mt-[56px] md:mt-[64px] py-24 px-4">
        <main className="max-w-5xl mx-auto rounded-xl shadow-xl p-6 bg-[var(--primary)] dark:bg-[var(--secondary)] text-white">
          <h1 className="text-3xl font-bold text-center mb-4">
            Política de Cookies
          </h1>

          <p className="text-center opacity-80 mb-10">
            Última actualización: Junio 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Introducción</h2>

            <p className="leading-relaxed">
              En Futear utilizamos cookies y tecnologías similares para mejorar
              la experiencia de navegación, recordar determinadas preferencias,
              analizar el uso de la plataforma y, cuando corresponda, mostrar
              publicidad personalizada mediante proveedores como Google AdSense.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">¿Qué son las cookies?</h2>

            <p className="leading-relaxed">
              Las cookies son pequeños archivos de texto que un sitio web guarda
              en el dispositivo del usuario cuando visita una página. Su función
              es recordar información relacionada con la navegación para mejorar
              la experiencia, mantener la sesión iniciada, recordar preferencias
              y recopilar información estadística sobre el funcionamiento del
              sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              ¿Por qué utilizamos cookies?
            </h2>

            <p className="mb-4 leading-relaxed">
              Futear utiliza cookies para ofrecer una experiencia más rápida,
              segura y personalizada.
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Recordar preferencias del usuario.</li>
              <li>Mantener sesiones iniciadas.</li>
              <li>Guardar configuraciones de la plataforma.</li>
              <li>Analizar el rendimiento del sitio.</li>
              <li>Detectar errores técnicos.</li>
              <li>Mostrar publicidad relevante.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Cookies esenciales</h2>

            <p className="leading-relaxed">
              Estas cookies son necesarias para el funcionamiento básico de
              Futear. Permiten mantener la sesión del usuario, proteger la
              seguridad de la plataforma y garantizar que determinadas funciones
              esenciales operen correctamente. Sin ellas, algunos servicios no
              podrían utilizarse.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Cookies de rendimiento</h2>

            <p className="leading-relaxed">
              Estas cookies recopilan información anónima sobre el rendimiento
              del sitio, tiempos de carga, errores y comportamiento general de
              la plataforma. Nos ayudan a identificar oportunidades de mejora y
              optimizar la experiencia de navegación.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Cookies de analítica</h2>

            <p className="leading-relaxed">
              Podemos utilizar herramientas de analítica para conocer cómo los
              usuarios interactúan con Futear. La información recopilada permite
              comprender qué secciones reciben más visitas, cuánto tiempo
              permanecen los usuarios en el sitio y qué mejoras pueden
              implementarse para ofrecer una mejor experiencia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Cookies publicitarias</h2>

            <p className="leading-relaxed">
              Cuando Futear muestre anuncios mediante Google AdSense u otros
              proveedores publicitarios, podrán utilizarse cookies para mostrar
              anuncios más relevantes, limitar la repetición de anuncios y medir
              el rendimiento de las campañas publicitarias. Estas cookies ayudan
              a ofrecer publicidad adaptada a los intereses del usuario siempre
              que la normativa aplicable lo permita.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Cookies de terceros</h2>

            <p className="leading-relaxed">
              Algunos servicios integrados en Futear pueden instalar cookies
              propias. Entre ellos pueden encontrarse proveedores de analítica,
              publicidad, servicios de autenticación o herramientas externas que
              colaboran en el funcionamiento de la plataforma. Cada proveedor
              gestiona sus propias políticas de privacidad y cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              Cómo administrar o eliminar las cookies
            </h2>

            <p className="leading-relaxed">
              El usuario puede eliminar las cookies almacenadas o impedir su
              instalación modificando la configuración de su navegador. Debe
              tenerse en cuenta que algunas funcionalidades de Futear podrían
              dejar de funcionar correctamente si determinadas cookies son
              deshabilitadas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              Configuración del navegador
            </h2>

            <p className="mb-4 leading-relaxed">
              Los principales navegadores permiten administrar las cookies desde
              su configuración de privacidad. Consulta la documentación oficial
              de tu navegador para obtener información específica sobre cómo
              bloquearlas, eliminarlas o configurarlas según tus preferencias.
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Google Chrome</li>
              <li>Mozilla Firefox</li>
              <li>Microsoft Edge</li>
              <li>Safari</li>
              <li>Opera</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Cambios en esta política</h2>

            <p className="leading-relaxed">
              Futear podrá actualizar esta Política de Cookies cuando sea
              necesario para adaptarse a cambios legales, técnicos o de
              funcionamiento de la plataforma. Recomendamos revisar esta página
              periódicamente para mantenerse informado sobre cualquier
              modificación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Contacto</h2>

            <p className="leading-relaxed">
              Si tienes preguntas relacionadas con esta Política de Cookies
              puedes escribirnos a:
            </p>

            <p className="font-semibold mt-3">futear.app@gmail.com</p>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
