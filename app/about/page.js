import Image from "next/image";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export const metadata = {
  title: "Sobre Futear",
  description:
    "Futear es una plataforma de juegos y desafíos de fútbol para fanáticos de todo el mundo. Trivias, jugadores, clubes, camisetas y más.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen mt-[56px] md:mt-[64px] py-24 px-4">
        <main className="max-w-5xl mx-auto rounded-xl shadow-xl p-6 bg-[var(--primary)] dark:bg-[var(--secondary)] text-white">
          <h1 className="text-3xl font-bold text-center mb-10">Sobre Futear</h1>
          <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
            <Image
              src="/images/logo.png"
              alt="Futear Logo"
              width={220}
              height={220}
              priority
            />

            <div className="text-lg leading-relaxed">
              <p className="mb-4">
                <strong>Futear</strong> es una plataforma de juegos y desafíos
                creada para los fanáticos del fútbol de todo el mundo.
              </p>

              <p className="mb-4">
                Nuestro objetivo es transformar el conocimiento futbolero en una
                experiencia divertida, competitiva y accesible para todos.
              </p>

              <p>
                Desde jugadores y clubes hasta camisetas históricas, selecciones
                nacionales, canciones de cancha y momentos icónicos, Futear
                reúne múltiples formas de poner a prueba tu pasión por el
                fútbol.
              </p>
            </div>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Nuestra historia</h2>

            <p className="mb-4 leading-relaxed">
              Futear nació con una idea muy simple: convertir el conocimiento
              futbolero en una experiencia interactiva. Durante años, millones
              de fanáticos debatieron sobre jugadores históricos, camisetas
              memorables, grandes selecciones y partidos inolvidables, pero
              existían muy pocos espacios donde poner realmente a prueba esos
              conocimientos.
            </p>

            <p className="mb-4 leading-relaxed">
              A partir de esa necesidad comenzó el desarrollo de Futear, una
              plataforma creada para que cualquier persona pueda aprender,
              competir y divertirse a través de juegos relacionados con el
              fútbol mundial, independientemente del club o la liga que siga.
            </p>

            <p className="leading-relaxed">
              Nuestro objetivo es seguir ampliando la experiencia con nuevos
              modos de juego, estadísticas y contenido actualizado para que
              siempre exista un desafío diferente por descubrir.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">¿Cómo funciona Futear?</h2>

            <p className="mb-4 leading-relaxed">
              Cada juego disponible en Futear propone un desafío distinto
              relacionado con el mundo del fútbol. Algunos ponen a prueba la
              memoria visual, mientras que otros evalúan el conocimiento sobre
              jugadores, clubes, selecciones, competiciones, camisetas
              históricas o acontecimientos importantes.
            </p>

            <p className="mb-4 leading-relaxed">
              Los juegos están diseñados para completarse en pocos minutos,
              permitiendo que cualquier usuario pueda disfrutar de partidas
              rápidas sin necesidad de dedicar largas sesiones.
            </p>

            <p className="leading-relaxed">
              Cada modalidad cuenta con reglas propias y diferentes sistemas de
              puntuación, fomentando tanto el aprendizaje como la competencia
              entre los jugadores.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">
              ¿Qué puedes encontrar en Futear?
            </h2>

            <p className="mb-4 leading-relaxed">
              Futear reúne diferentes herramientas y experiencias para que cada
              visita sea distinta. Además de los juegos, la plataforma incorpora
              estadísticas, seguimiento del progreso y nuevos desafíos que se
              actualizan constantemente.
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Juegos diarios.</li>
              <li>Estadísticas personales.</li>
              <li>Progreso y rachas.</li>
              <li>Nuevos desafíos.</li>
              <li>Contenido actualizado.</li>
              <li>Experiencias para todos los niveles.</li>
            </ul>

            <p className="mt-4 leading-relaxed">
              Todo el contenido está pensado para que tanto aficionados
              ocasionales como seguidores experimentados encuentren un reto
              acorde a sus conocimientos.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Tipos de juegos</h2>

            <p className="mb-4 leading-relaxed">
              Futear ofrece múltiples modalidades inspiradas en diferentes
              aspectos del fútbol internacional.
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Adivinar jugadores.</li>
              <li>Identificar clubes.</li>
              <li>Reconocer selecciones nacionales.</li>
              <li>Camisetas históricas.</li>
              <li>Competiciones internacionales.</li>
              <li>Historia del fútbol.</li>
              <li>Canciones relacionadas con el fútbol.</li>
              <li>Desafíos especiales.</li>
              <li>Juegos diarios.</li>
            </ul>

            <p className="mt-4 leading-relaxed">
              Continuamente trabajamos en nuevas modalidades para ampliar la
              variedad de desafíos disponibles dentro de la plataforma.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">
              Una plataforma para todo el fútbol
            </h2>

            <p className="mb-4 leading-relaxed">
              Futear no está limitado a un único club, una liga específica o una
              competición concreta. Nuestro propósito es reunir contenido
              relacionado con el fútbol de todas las regiones del mundo.
            </p>

            <p className="mb-4 leading-relaxed">
              Ya sea que sigas la Premier League, LaLiga, Serie A, Bundesliga,
              Libertadores, Champions League, Copa América, Mundial o cualquier
              otra competición, siempre encontrarás desafíos relacionados con
              ese universo.
            </p>

            <p className="leading-relaxed">
              Creemos que el fútbol es un lenguaje universal y queremos que la
              plataforma refleje esa diversidad mediante juegos accesibles para
              cualquier fanático, sin importar su país o el equipo que apoye.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">
              Actualizaciones constantes
            </h2>

            <p className="mb-4 leading-relaxed">
              Trabajamos continuamente para incorporar nuevos modos de juego,
              ampliar la base de datos de jugadores, clubes, selecciones y
              competiciones, además de mejorar la experiencia general de la
              plataforma.
            </p>

            <p className="leading-relaxed">
              Nuestro objetivo es que Futear evolucione junto con el fútbol,
              ofreciendo contenido actualizado durante toda la temporada y
              nuevos desafíos para que siempre exista algo diferente por
              descubrir.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Tecnología utilizada</h2>

            <p className="mb-4 leading-relaxed">
              Futear está desarrollado utilizando tecnologías web modernas que
              permiten ofrecer una experiencia rápida, estable y compatible
              tanto con computadoras como con dispositivos móviles.
            </p>

            <p className="leading-relaxed">
              Trabajamos continuamente en optimizaciones de rendimiento,
              accesibilidad, seguridad y velocidad de carga para garantizar una
              navegación fluida y una experiencia de juego cada vez mejor.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Nuestro compromiso</h2>

            <p className="mb-4 leading-relaxed">
              Nuestro compromiso es seguir construyendo una plataforma segura,
              entretenida y accesible para toda la comunidad futbolera.
            </p>

            <p className="leading-relaxed">
              Escuchamos constantemente las sugerencias de los usuarios para
              incorporar nuevas funciones, corregir errores y mejorar la calidad
              del contenido que ofrecemos diariamente.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Nuestra misión</h2>

            <p className="leading-relaxed">
              Crear el lugar donde cualquier persona pueda disfrutar del fútbol
              de una forma diferente: jugando, aprendiendo y compitiendo
              mediante experiencias digitales que premien el conocimiento y la
              pasión por este deporte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Preguntas frecuentes</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  ¿Futear es gratuito?
                </h3>

                <p>
                  Sí. La mayor parte de la experiencia de Futear puede
                  disfrutarse de forma completamente gratuita.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  ¿Necesito crear una cuenta?
                </h3>

                <p>
                  No es obligatorio, aunque disponer de una cuenta permite
                  guardar el progreso y acceder a futuras funcionalidades.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  ¿Con qué frecuencia se agregan juegos nuevos?
                </h3>

                <p>
                  Trabajamos continuamente para incorporar nuevos desafíos,
                  mejorar el contenido existente y añadir modalidades
                  adicionales.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  ¿Puedo jugar desde el celular?
                </h3>

                <p>
                  Sí. Futear está diseñado para funcionar correctamente tanto en
                  computadoras como en teléfonos y tablets.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  ¿Dónde puedo aprender las reglas de cada juego?
                </h3>

                <p>
                  Puedes consultar la{" "}
                  <Link
                    href="/guide"
                    prefetch={false}
                    className="underline font-semibold"
                  >
                    Guía de Juegos
                  </Link>{" "}
                  donde explicamos el funcionamiento de cada modalidad
                  disponible.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  ¿Cómo puedo enviar sugerencias?
                </h3>

                <p>
                  Siempre estamos abiertos a recibir ideas y comentarios. Puedes
                  hacerlo desde nuestra página de contacto.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
