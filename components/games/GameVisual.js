// GameVisual.jsx

"use client";

import Image from "next/image";
import { GameIcon } from "@/components/icons/gameIcons";
import clsx from "clsx";

const layoutMap = {
  stack: "relative w-24 h-24",
  row: "flex items-center justify-center",
  column: "flex flex-col items-center justify-center gap-2",
  corner: "relative w-24 h-24",
};

function isSvg(src = "") {
  return typeof src === "string" && src.endsWith(".svg");
}

export function GameVisual({
  visual,
  scope,
  variant = "home",
  disabled = false,
}) {
  if (!visual?.layers?.length) {
    return <GameIcon name="HelpCircle" size={72} />;
  }

  const isStack = visual.layout === "stack";
  const isCorner = visual.layout === "corner";

  const filterPrefix = variant === "event" ? "event" : "home";

  return (
    <div
      className={clsx(layoutMap[visual.layout])}
      style={{
        filter: disabled ? "grayscale(1) brightness(0.6) opacity(0.5)" : "none",
        transition: "filter 200ms ease",
      }}
    >
      {visual.layers.map((layer, index) => {
        const wrapperClass =
          isStack || isCorner
            ? "absolute inset-0 flex items-center justify-center"
            : "relative flex items-center justify-center";

        const filter =
          layer.filter === "primary"
            ? `var(--${filterPrefix}-image-filter-primary)`
            : layer.filter === "secondary"
              ? `var(--${filterPrefix}-image-filter-secondary)`
              : `var(--${filterPrefix}-image-filter-base)`;

        let imageSrc = layer.value;

        if (layer.type === "scope-federation") {
          imageSrc =
            scope?.identity?.federation?.logo ||
            "/images/federations/default.webp";
        }

        if (layer.type === "scope-league") {
          imageSrc =
            scope?.identity?.league?.logo || "/images/leagues/default.webp";
        }

        const isSVG = isSvg(imageSrc);

        if (layer.type === "icon") {
          return (
            <div
              key={index}
              className={clsx(wrapperClass, layer.className)}
              style={{ filter }}
            >
              <GameIcon name={layer.value} className="w-full h-full" />
            </div>
          );
        }

        if (
          layer.type === "image" ||
          layer.type === "scope-federation" ||
          layer.type === "scope-league"
        ) {
          return (
            <div
              key={index}
              className={clsx(wrapperClass, layer.className)}
              style={{ filter }}
            >
              {isSVG ? (
                <img
                  src={imageSrc}
                  alt=""
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              ) : (
                <Image src={imageSrc} alt="" fill className="object-contain" />
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
