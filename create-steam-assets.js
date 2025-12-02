// Script to create Steam assets from icon.png
// Run with: node create-steam-assets.js

const fs = require("fs");
const path = require("path");

// Create steam assets directory structure
const steamDir = path.join(__dirname, "assets", "steam");
if (!fs.existsSync(steamDir)) {
  fs.mkdirSync(steamDir, { recursive: true });
}

console.log("📁 Steam assets directory created:", steamDir);

// Steam asset specifications
const steamAssets = {
  "capsule_header.jpg": {
    width: 460,
    height: 215,
    description: "Steam Store Header",
  },
  "capsule_library.jpg": {
    width: 374,
    height: 448,
    description: "Steam Library Capsule",
  },
  "capsule_main.jpg": {
    width: 616,
    height: 353,
    description: "Steam Main Store Capsule",
  },
  "achievement_placeholder.png": {
    width: 64,
    height: 64,
    description: "Achievement Icon Template",
  },
  "trading_card_placeholder.png": {
    width: 184,
    height: 184,
    description: "Trading Card Template",
  },
};

console.log("🎮 Steam Asset Specifications:");
Object.entries(steamAssets).forEach(([filename, specs]) => {
  console.log(
    `  ${filename}: ${specs.width}x${specs.height} - ${specs.description}`
  );
});

console.log("\n📋 Next Steps:");
console.log("1. Use your icon.png as base");
console.log("2. Create Steam capsules with proper dimensions");
console.log("3. Design achievement icons (64x64)");
console.log("4. Create trading cards (184x184)");
console.log("5. Add game screenshots for Steam store");

console.log("\n🎨 Recommended tools:");
console.log("  - GIMP (free)");
console.log("  - Photoshop");
console.log("  - Canva (online)");
console.log("  - Figma (online)");
