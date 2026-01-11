/**
 * PWA Icon Generator Script
 *
 * This script generates PNG icons from the SVG source.
 * Requires: sharp (npm install sharp)
 *
 * Run: node scripts/generate-icons.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

// Check if sharp is available
let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  console.log(
    "Sharp is not installed. Install it with: npm install sharp --save-dev"
  );
  console.log("");
  console.log(
    "Alternatively, use an online tool to convert the SVG icons to PNG:"
  );
  console.log("1. Open public/icons/icon-512x512.svg");
  console.log("2. Use https://svgtopng.com/ or similar tool");
  console.log(
    "3. Generate icons at sizes: 72, 96, 128, 144, 152, 192, 384, 512"
  );
  console.log("4. Save them as icon-{size}x{size}.png in public/icons/");
  process.exit(0);
}

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SOURCE_SVG = path.join(__dirname, "../public/icons/icon-512x512.svg");
const OUTPUT_DIR = path.join(__dirname, "../public/icons");

async function generateIcons() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read SVG source
  const svgBuffer = fs.readFileSync(SOURCE_SVG);

  console.log("Generating PWA icons...\n");

  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

    await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);

    console.log(`✓ Generated: icon-${size}x${size}.png`);
  }

  console.log("\n✅ All icons generated successfully!");
}

generateIcons().catch(console.error);
