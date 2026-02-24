"use client";

import type { CSSProperties } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import leaf1 from "@/assets/leaves/1.png";
import leaf2 from "@/assets/leaves/2.png";
import leaf3 from "@/assets/leaves/3.png";
import leaf4 from "@/assets/leaves/4.png";
import leaf5 from "@/assets/leaves/5.png";
import leaf6 from "@/assets/leaves/6.png";
import leaf7 from "@/assets/leaves/7.png";
import snowType1 from "@/assets/snow/snow-type-1.png";
import snowType2 from "@/assets/snow/snow-type-2.png";
import snowGround from "@/assets/snow/snow-ground.png";

type LeafSpec = {
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  rotate: number;
  image: string;
};

type GroundLeafSpec = {
  left: number;
  bottom: number;
  size: number;
  rotate: number;
  opacity: number;
  image: string;
  zIndex: number;
};

const fallingImages = [leaf1.src, leaf2.src, leaf3.src, leaf4.src];
const groundImages = [leaf5.src, leaf6.src, leaf7.src];
const snowFallingImages = [snowType1.src, snowType2.src];

const leaves: LeafSpec[] = [
  {
    left: 4,
    delay: -8,
    duration: 13,
    size: 96,
    drift: 32,
    rotate: 220,
    image: fallingImages[0],
  },
  {
    left: 10,
    delay: -2,
    duration: 11,
    size: 82,
    drift: -28,
    rotate: -190,
    image: fallingImages[1],
  },
  {
    left: 16,
    delay: -5,
    duration: 15,
    size: 102,
    drift: 36,
    rotate: 250,
    image: fallingImages[2],
  },
  {
    left: 22,
    delay: -1,
    duration: 12,
    size: 88,
    drift: -24,
    rotate: -210,
    image: fallingImages[3],
  },
  {
    left: 29,
    delay: -9,
    duration: 16,
    size: 106,
    drift: 40,
    rotate: 270,
    image: fallingImages[1],
  },
  {
    left: 35,
    delay: -4,
    duration: 14,
    size: 92,
    drift: -30,
    rotate: -230,
    image: fallingImages[0],
  },
  {
    left: 42,
    delay: -7,
    duration: 13,
    size: 84,
    drift: 22,
    rotate: 200,
    image: fallingImages[3],
  },
  {
    left: 48,
    delay: -3,
    duration: 10,
    size: 78,
    drift: -18,
    rotate: -170,
    image: fallingImages[2],
  },
  {
    left: 54,
    delay: -6,
    duration: 15,
    size: 94,
    drift: 34,
    rotate: 240,
    image: fallingImages[0],
  },
  {
    left: 60,
    delay: -11,
    duration: 17,
    size: 114,
    drift: -44,
    rotate: -280,
    image: fallingImages[1],
  },
  {
    left: 66,
    delay: -2,
    duration: 12,
    size: 90,
    drift: 26,
    rotate: 210,
    image: fallingImages[2],
  },
  {
    left: 72,
    delay: -8,
    duration: 14,
    size: 100,
    drift: -32,
    rotate: -240,
    image: fallingImages[3],
  },
  {
    left: 78,
    delay: -5,
    duration: 11,
    size: 82,
    drift: 19,
    rotate: 170,
    image: fallingImages[1],
  },
  {
    left: 84,
    delay: -10,
    duration: 15,
    size: 94,
    drift: -36,
    rotate: -260,
    image: fallingImages[0],
  },
  {
    left: 90,
    delay: -3,
    duration: 13,
    size: 86,
    drift: 24,
    rotate: 200,
    image: fallingImages[3],
  },
  {
    left: 96,
    delay: -7,
    duration: 16,
    size: 98,
    drift: -30,
    rotate: -230,
    image: fallingImages[2],
  },
];

const ironFallingLeaves: LeafSpec[] = [
  {
    left: 4,
    delay: -8,
    duration: 13,
    size: 96,
    drift: 32,
    rotate: 220,
    image: snowFallingImages[0],
  },
  {
    left: 10,
    delay: -2,
    duration: 11,
    size: 82,
    drift: -28,
    rotate: -190,
    image: snowFallingImages[1],
  },
  {
    left: 16,
    delay: -5,
    duration: 15,
    size: 102,
    drift: 36,
    rotate: 250,
    image: snowFallingImages[0],
  },
  {
    left: 22,
    delay: -1,
    duration: 12,
    size: 88,
    drift: -24,
    rotate: -210,
    image: snowFallingImages[1],
  },
  {
    left: 29,
    delay: -9,
    duration: 16,
    size: 106,
    drift: 40,
    rotate: 270,
    image: snowFallingImages[0],
  },
  {
    left: 35,
    delay: -4,
    duration: 14,
    size: 92,
    drift: -30,
    rotate: -230,
    image: snowFallingImages[1],
  },
  {
    left: 42,
    delay: -7,
    duration: 13,
    size: 84,
    drift: 22,
    rotate: 200,
    image: snowFallingImages[0],
  },
  {
    left: 48,
    delay: -3,
    duration: 10,
    size: 78,
    drift: -18,
    rotate: -170,
    image: snowFallingImages[1],
  },
  {
    left: 54,
    delay: -6,
    duration: 15,
    size: 94,
    drift: 34,
    rotate: 240,
    image: snowFallingImages[0],
  },
  {
    left: 60,
    delay: -11,
    duration: 17,
    size: 114,
    drift: -44,
    rotate: -280,
    image: snowFallingImages[1],
  },
  {
    left: 66,
    delay: -2,
    duration: 12,
    size: 90,
    drift: 26,
    rotate: 210,
    image: snowFallingImages[0],
  },
  {
    left: 72,
    delay: -8,
    duration: 14,
    size: 100,
    drift: -32,
    rotate: -240,
    image: snowFallingImages[1],
  },
  {
    left: 78,
    delay: -5,
    duration: 11,
    size: 82,
    drift: 19,
    rotate: 170,
    image: snowFallingImages[0],
  },
  {
    left: 84,
    delay: -10,
    duration: 15,
    size: 94,
    drift: -36,
    rotate: -260,
    image: snowFallingImages[1],
  },
  {
    left: 90,
    delay: -3,
    duration: 13,
    size: 86,
    drift: 24,
    rotate: 200,
    image: snowFallingImages[0],
  },
  {
    left: 96,
    delay: -7,
    duration: 16,
    size: 98,
    drift: -30,
    rotate: -230,
    image: snowFallingImages[1],
  },
];

function seeded(seed: number): number {
  const value = Math.sin(seed * 932.314) * 43758.5453;
  return value - Math.floor(value);
}

const groundRows = 3;
const groundCols = 42;
const groundLeaves: GroundLeafSpec[] = Array.from(
  { length: groundRows * groundCols },
  (_, index) => {
    const row = Math.floor(index / groundCols);
    const col = index % groundCols;
    const seed = index + 1;
    const r1 = seeded(seed * 1.13);
    const r2 = seeded(seed * 2.17);
    const r3 = seeded(seed * 3.29);
    const r4 = seeded(seed * 4.07);
    const r5 = seeded(seed * 5.11);

    const step = 100 / (groundCols - 1);
    const rowOffset = (row % 2) * (step * 0.45);
    const jitter = (r1 - 0.5) * step * 0.7;
    const left = Math.max(0, Math.min(100, col * step + rowOffset + jitter));

    return {
      left,
      bottom: -9 + row * 2.6 + r2 * 1.3,
      size: 56 + r3 * 72,
      rotate: -35 + r4 * 70,
      opacity: 0.52 + r5 * 0.33,
      image: groundImages[index % groundImages.length],
      zIndex: row + 1,
    };
  },
);

export default function ThemeEffects() {
  const { themeId } = useTheme();

  const isAutumn = themeId === "autumn-harvest";
  const isIron = themeId === "throne-iron";

  if (!isAutumn && !isIron) {
    return null;
  }

  const activeFallingLeaves = isIron ? ironFallingLeaves : leaves;
  const effectClass = isIron ? "theme-effects-iron" : "theme-effects-autumn";

  return (
    <div aria-hidden className={`theme-effects ${effectClass}`}>
      <div className="autumn-fall-layer opacity-20">
        {activeFallingLeaves.map((leaf, index) => {
          const visualSize =
            isIron && leaf.image === snowFallingImages[1]
              ? leaf.size * 0.5
              : leaf.size;

          const style = {
            "--leaf-left": `${leaf.left}%`,
            "--leaf-delay": `${leaf.delay}s`,
            "--leaf-duration": `${leaf.duration}s`,
            "--leaf-size": `${visualSize}px`,
            "--leaf-drift": `${leaf.drift}px`,
            "--leaf-rotate": `${leaf.rotate}deg`,
            backgroundImage: `url("${leaf.image}")`,
          } as CSSProperties;

          return (
            <span
              key={`leaf-${index}`}
              className="autumn-leaf autumn-leaf-image"
              style={style}
            />
          );
        })}
      </div>
      {isIron ? (
        <div className="iron-ground-layer">
          <span
            className="iron-ground-strip autumn-leaf-image"
            style={{ backgroundImage: `url("${snowGround.src}")` }}
          />
        </div>
      ) : (
        <div className="autumn-ground-layer">
          {groundLeaves.map((leaf, index) => {
            const style = {
              "--ground-left": `${leaf.left}%`,
              "--ground-bottom": `${leaf.bottom}vh`,
              "--ground-size": `${leaf.size}px`,
              "--ground-rotate": `${leaf.rotate}deg`,
              "--ground-opacity": `${leaf.opacity}`,
              "--ground-z": `${leaf.zIndex}`,
              backgroundImage: `url("${leaf.image}")`,
            } as CSSProperties;

            return (
              <span
                key={`ground-leaf-${index}`}
                className="autumn-ground-leaf autumn-leaf-image"
                style={style}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
