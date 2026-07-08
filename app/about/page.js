import Image from "next/image";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

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
            <h2 className="text-2xl font-bold mb-4">
              ¿Qué puedes encontrar en Futear?
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>Juegos diarios con nuevos desafíos.</li>
              <li>Trivias de fútbol mundial.</li>
              <li>Adivinar jugadores, clubes y selecciones.</li>
              <li>Juegos de camisetas históricas.</li>
              <li>Canciones de cancha.</li>
              <li>Rankings, rachas y progresión.</li>
              <li>Desafíos competitivos para todos los niveles.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">
              Una plataforma para todo el fútbol
            </h2>

            <p className="leading-relaxed">
              Futear no está limitado a un club, liga o país. Es una plataforma
              global donde cualquier fanático del fútbol puede aprender,
              competir y divertirse cada día.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Nuestra misión</h2>

            <p className="leading-relaxed">
              Crear el lugar donde cualquier persona pueda disfrutar del fútbol
              de una forma diferente: jugando, aprendiendo y compitiendo en
              experiencias digitales únicas.
            </p>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
