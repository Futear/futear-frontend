"use client";

import { useState } from "react";
import Image from "next/image";
// import { CLUB_LIST } from "@/config/club";

export default function ClubMemberSelector({ onSelect, exclude = [] }) {
  const [selectedClub, setSelectedClub] = useState(null);

  const filteredClubs = CLUB_LIST.filter((club) => !exclude.includes(club.id));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {filteredClubs.length === 0 && (
        <p className="text-sm text-gray-400 col-span-2 text-center">
          Ya pertenecés a todos los clubes disponibles.
        </p>
      )}

      {filteredClubs.map((club) => (
        <button
          key={club.id}
          onClick={() => {
            setSelectedClub(club.id);
            onSelect(club);
          }}
          className={`
            flex items-center gap-3 p-2 rounded-lg border transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
            ${
              selectedClub === club.id
                ? "bg-[var(--hover)] border-[var(--primary)]"
                : "bg-[var(--background)] hover:bg-[var(--hover)] border-[var(--secondary)]"
            }
          `}
        >
          <Image
            src={club.shield}
            alt={club.name}
            width={40}
            height={40}
            className="rounded object-contain"
            priority={false}
          />
          <span className="text-sm font-medium text-[var(--text)] truncate">
            {club.name}
          </span>
        </button>
      ))}
    </div>
  );
}
