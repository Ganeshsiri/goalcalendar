import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { calculateGoal } from "./date";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULTS = {
  width: 1080,
  height: 2640,

  // Similar dark presentation to the original service.
  backgroundColor: "#191919",

  completedColor: "#F2F2F2",
  remainingColor: "#6E6E6E",
  todayColor: "#FF9800",
  textColor: "#F2F2F2",
  subtitleColor: "#A8A8A8",

  dotSize: 23,
  dotGap: 80,
  horizontalGap: 60,
  verticalGap: 30,

  topMargin: 1200,
  sideMargin: 100,

  titleSize: 62,
  subtitleSize: 30,

  opacity: 1,
};

function number(value, fallback, min, max) {
  if (value === null || value === undefined || value === "") return fallback;

  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;

  return Math.max(min, Math.min(max, n));
}

function validColor(value, fallback) {
  if (!value) return fallback;

  // Allow hex, rgb/rgba, named colors and CSS-like colors.
  // SVG rendering will validate the final value through Sharp.
  if (
    /^#[0-9a-fA-F]{3,8}$/.test(value) ||
    /^(rgb|rgba|hsl|hsla)\(/i.test(value) ||
    /^[a-zA-Z]+$/.test(value)
  ) {
    return value;
  }

  return fallback;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function resolveBackgroundUrl(url) {
  // Convert Google Drive share links to direct download URLs.
  // e.g. https://drive.google.com/file/d/FILE_ID/view?... -> https://drive.google.com/uc?export=download&id=FILE_ID
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  return url;
}

async function loadBackground(width, height, backgroundUrl) {
  if (!backgroundUrl) {
    return sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  }

  const resolvedUrl = resolveBackgroundUrl(backgroundUrl);
  const response = await fetch(resolvedUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch background image");
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());

  return sharp(imageBuffer)
    .resize(width, height, {
      fit: "cover",
      position: "centre",
    })
    .png()
    .toBuffer();
}

// async function loadBackground(width, height) {
//   const input = path.join(process.cwd(), "public", "background.jpg");

//   return sharp(input)
//     .resize(width, height, {
//       fit: "cover",
//       position: "centre",
//     })
//     .png()
//     .toBuffer();
// }

function createCalendarSvg({
  width,
  height,
  goal,
  elapsedDays,
  totalDays,
  currentIndex,
  completedColor,
  remainingColor,
  todayColor,
  textColor,
  subtitleColor,
  dotSize,
  dotGap,
  horizontalGap,
  verticalGap,
  topMargin,
  sideMargin,
  titleSize,
  subtitleSize,
  showSubtitle,
  opacity,
}) {
  // Determine a grid that fits the requested canvas.
  // The original service is visually similar to a dense dot calendar.
  const availableWidth = width - sideMargin * 2;
  const availableHeight = height - topMargin - 130;

  const step = dotSize * 2 + dotGap;

  const stepX = dotSize * 2 + horizontalGap;
  const stepY = dotSize * 2 + verticalGap;

  // let columns = Math.max(1, Math.floor((availableWidth + dotGap) / step));

  // // Prevent an enormous number of columns on unusual dimensions.
  // columns = Math.min(columns, 7);

  // const rows = Math.ceil(totalDays / columns);

  // const actualStepX =
  //   columns > 1 ? Math.min(step, availableWidth / Math.max(1, columns - 1)) : 0;

  // const actualStepY =
  //   rows > 1 ? Math.min(step, availableHeight / Math.max(1, rows - 1)) : 0;

  // const gridWidth = columns > 1 ? (columns - 1) * actualStepX : 0;

  // const startX = (width - gridWidth) / 2;

  const columns = Math.min(7, totalDays);

  const rows = Math.ceil(totalDays / columns);

  const actualStepX = stepX;
  const actualStepY = stepY;

  const gridWidth = columns > 1 ? (columns - 1) * actualStepX : 0;

  const startX = (width - gridWidth) / 2;

  const titleY = Math.max(80, topMargin * 0.48);
  const subtitleY = titleY + titleSize + 48;

  const pieces = [];

  pieces.push(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
    >
      <style>
        .title {
          font-family: Arial, Helvetica, sans-serif;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .subtitle {
          font-family: Arial, Helvetica, sans-serif;
          font-weight: 400;
        }
      </style>
  `);

  // pieces.push(`
  //   <text
  //     x="${width / 2}"
  //     y="${titleY}"
  //     text-anchor="middle"
  //     class="title"
  //     font-size="${titleSize}"
  //     fill="${escapeXml(textColor)}"
  //     opacity="${opacity}"
  //   >${escapeXml(goal)}</text>
  // `);

  // if (showSubtitle) {
  //   const percent = Math.round((elapsedDays / totalDays) * 100);

  //   pieces.push(`
  //     <text
  //       x="${width / 2}"
  //       y="${subtitleY}"
  //       text-anchor="middle"
  //       class="subtitle"
  //       font-size="${subtitleSize}"
  //       fill="${escapeXml(subtitleColor)}"
  //       opacity="${opacity}"
  //     >${elapsedDays} / ${totalDays} days  •  ${percent}%</text>
  //   `);
  // }

  const gridTop =
    topMargin + titleSize + (showSubtitle ? subtitleSize + 90 : 70);

  // Day-of-week headers: S M T W T F S
  const dayHeaders = ["S", "M", "T", "W", "T", "F", "S"];
  const headerY = gridTop - 30;
  const headerFontSize = Math.max(16, Math.round(subtitleSize * 0.6));

  for (let h = 0; h < columns; h++) {
    const hx = startX + h * actualStepX;
    pieces.push(`
      <text
        x="${hx.toFixed(2)}"
        y="${headerY}"
        text-anchor="middle"
        class="subtitle"
        font-size="${headerFontSize}"
        fill="${escapeXml(subtitleColor)}"
        opacity="${(opacity * 0.7).toFixed(2)}"
      >${dayHeaders[h]}</text>
    `);
  }

  for (let index = 0; index < totalDays; index++) {
    const row = Math.floor(index / columns);
    const column = index % columns;

    const x = startX + column * actualStepX;
    const y = gridTop + row * actualStepY;

    let fill = remainingColor;

    if (index < currentIndex) {
      fill = completedColor;
    } else if (index === currentIndex && elapsedDays > 0) {
      fill = todayColor;
    } else if (index === currentIndex && currentIndex === totalDays - 1) {
      fill = todayColor;
    }

    if (index > currentIndex) {
      const bevelWidth = Math.min(2, dotSize * 0.2);
      const bevelRadius = dotSize - bevelWidth * 0.5;
      const bevelX = x.toFixed(2);
      const bevelY = y.toFixed(2);
      const radius = bevelRadius.toFixed(2);

      pieces.push(`
        <circle cx="${(x + 0.8).toFixed(2)}" cy="${(y + 1.2).toFixed(2)}" r="${radius}" fill="none" stroke="#000000" stroke-width="${(bevelWidth * 2).toFixed(2)}" opacity="${(opacity * 0.4).toFixed(2)}"/>
        <circle cx="${bevelX}" cy="${bevelY}" r="${radius}" fill="none" stroke="${escapeXml(remainingColor)}" stroke-width="${(bevelWidth * 1.4).toFixed(2)}" opacity="${(opacity * 0.85).toFixed(2)}"/>
        <path d="M ${(x + bevelRadius).toFixed(2)} ${bevelY} A ${radius} ${radius} 0 0 0 ${(x - bevelRadius).toFixed(2)} ${bevelY}" fill="none" stroke="#FFFFFF" stroke-width="${(bevelWidth * 0.7).toFixed(2)}" stroke-linecap="round" opacity="${(opacity * 0.55).toFixed(2)}"/>
        <path d="M ${(x - bevelRadius).toFixed(2)} ${bevelY} A ${radius} ${radius} 0 0 0 ${(x + bevelRadius).toFixed(2)} ${bevelY}" fill="none" stroke="#000000" stroke-width="${(bevelWidth * 0.8).toFixed(2)}" stroke-linecap="round" opacity="${(opacity * 0.65).toFixed(2)}"/>
      `);
    } else {
      pieces.push(
        `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${dotSize}" fill="${escapeXml(fill)}" opacity="${opacity}"/>`
      );
    }
  }

  const footerY = height - 250;

  pieces.push(`
    <text
      x="${width / 2}"
      y="${footerY}"
      text-anchor="middle"
      class="subtitle"
      font-size="${Math.max(20, Math.round(subtitleSize * 0.85))}"
      fill="${escapeXml(subtitleColor)}"
      opacity="${opacity}"
    >${totalDays - elapsedDays} days remaining</text>
  `);

  pieces.push("</svg>");

  return Buffer.from(pieces.join(""));
}

export async function generateGoalImage(options = {}) {
  const width = Math.round(number(options.width, DEFAULTS.width, 100, 3000));

  const height = Math.round(number(options.height, DEFAULTS.height, 100, 5000));

  const goal = String(options.goal || "My Goal").slice(0, 200);

  const calendar = calculateGoal(options.startDate, options.goalDate);

  const completedColor = validColor(
    options.completedColor,
    DEFAULTS.completedColor
  );

  const remainingColor = validColor(
    options.remainingColor,
    DEFAULTS.remainingColor
  );

  const todayColor = validColor(options.todayColor, DEFAULTS.todayColor);
  const textColor = validColor(options.textColor, DEFAULTS.textColor);

  const subtitleColor = validColor(
    options.subtitleColor,
    DEFAULTS.subtitleColor
  );

  const dotSize = number(options.dotSize, DEFAULTS.dotSize, 1, 30);

  const dotGap = number(options.dotGap, DEFAULTS.dotGap, 1, 100);
  const horizontalGap = number(
    options.horizontalGap,
    DEFAULTS.horizontalGap,
    0,
    300
  );
  const verticalGap = number(options.verticalGap, DEFAULTS.verticalGap, 0, 300);

  const topMargin = number(
    options.topMargin,
    DEFAULTS.topMargin,
    50,
    Math.floor(height * 0.6)
  );

  const sideMargin = number(
    options.sideMargin,
    DEFAULTS.sideMargin,
    10,
    Math.floor(width * 0.4)
  );

  const titleSize = number(options.titleSize, DEFAULTS.titleSize, 12, 200);

  const subtitleSize = number(
    options.subtitleSize,
    DEFAULTS.subtitleSize,
    10,
    100
  );

  const opacity = number(options.opacity, DEFAULTS.opacity, 0, 1);

  const showSubtitle =
    options.showSubtitle === null ||
    options.showSubtitle === undefined ||
    options.showSubtitle === ""
      ? true
      : !["0", "false", "no", "off"].includes(
          String(options.showSubtitle).toLowerCase()
        );

  const background = await loadBackground(width, height, options.backgroundUrl);

  const overlaySvg = createCalendarSvg({
    width,
    height,
    goal,
    elapsedDays: calendar.elapsedDays,
    totalDays: calendar.totalDays,
    currentIndex: calendar.currentIndex,
    completedColor,
    remainingColor,
    todayColor,
    textColor,
    subtitleColor,
    dotSize,
    dotGap,
    horizontalGap,
    verticalGap,
    topMargin,
    sideMargin,
    titleSize,
    subtitleSize,
    showSubtitle,
    opacity,
  });

  return sharp(background)
    .composite([
      {
        input: await sharp(overlaySvg).png().toBuffer(),
        blend: "over",
      },
    ])
    .png()
    .toBuffer();
}
