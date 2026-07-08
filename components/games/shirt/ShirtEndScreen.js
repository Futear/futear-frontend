"use client";

import EndScreen from "@/components/screens/EndScreen";

export default function ShirtEndScreen({ result, state, homeUrl }) {
  const shirt = state?.shirt;

  const won = result?.win;

  return (
    <EndScreen
      result={result}
      homeUrl={homeUrl}
      // title={won ? "¡Correcto!" : "No fue esta vez"}
      // subtitle={shirt?.owner?.name || "Camiseta"}
      left={
        <div className="flex items-center justify-center h-full">
          <img
            src={
              shirt?.images?.full?.[0] ||
              shirt?.images?.withBrand ||
              shirt?.images?.base
            }
            alt={shirt?.owner?.name || "Camiseta"}
            className="max-h-[90%] object-contain"
          />
        </div>
      }
      rightStats={
        <>
          <tr>
            <td className="py-2 font-semibold">
              {shirt?.ownerType === "club" ? "Club" : "Selección"}
            </td>

            <td className="py-2 text-right">{shirt?.owner?.shortName}</td>
          </tr>

          <tr>
            <td className="py-2 font-semibold">Marca</td>

            <td className="py-2 text-right">{shirt?.brand}</td>
          </tr>

          <tr>
            {shirt?.sponsors?.length > 0 && (
              <td className="py-2 font-semibold">
                Sponsor{shirt?.sponsors?.length > 1 ? "es" : ""}
              </td>
            )}
            {shirt?.sponsors?.length > 0 && (
              <td className="py-2 text-right">{shirt?.sponsors?.join(", ")}</td>
            )}
          </tr>

          <tr>
            <td className="py-2 font-semibold">
              Año{shirt?.yearsUsed?.length > 1 ? "s" : ""}
            </td>

            <td className="py-2 text-right">{shirt?.yearsUsed?.join(", ")}</td>
          </tr>

          <tr>
            <td className="py-2 font-semibold">Tipo</td>

            <td className="py-2 text-right">{shirt?.type}</td>
          </tr>
        </>
      }
    />
  );
}
