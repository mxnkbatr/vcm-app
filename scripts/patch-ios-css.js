const fs = require("fs");
const p = "c:/Users/User/Desktop/vcm/vcm/app/globals.css";
let text = fs.readFileSync(p, "utf8");
const start = text.indexOf(" :root {");
const baseMarker = "/* ───────────────────────────────────────────── \n   BASE";
let end = text.indexOf(baseMarker);
if (end < 0) end = text.indexOf("/* ───────────────────────────────────────────── \r\n   BASE");
if (start < 0 || end < 0) {
  console.error("markers not found", start, end);
  process.exit(1);
}

const replacement = ` :root {
   --blue: #1E5BD8;
   --blue-light: #E8EEFB;
   --blue-dim: rgba(30, 91, 216, 0.12);
   --accent: #1E5BD8;
   --cream: #F2F2F7;
   --cream-light: #FFFFFF;
   --cream-warm: #E5E5EA;
   --cream-blue: #F2F2F7;
   --cream-accent: #E5E5EA;
   --cream-border: rgba(60, 60, 67, 0.12);
   --cream-ink: #000000;
   --green: #34C759;
   --emerald: #34C759;
   --emerald-dim: rgba(52, 199, 89, 0.14);
   --orange: #FF9F0A;
   --orange-dim: rgba(255, 159, 10, 0.16);
   --red: #FF3B30;
   --red-dim: rgba(255, 59, 48, 0.12);
   --yellow: #FFD60A;
   --purple: #AF52DE;
   --purple-dim: rgba(175, 82, 222, 0.14);
   --teal: #30B0C7;
   --teal-dim: rgba(48, 176, 199, 0.14);
   --module-programs: #1E5BD8;
   --module-programs-soft: #E8EEFB;
   --module-programs-border: rgba(60, 60, 67, 0.12);
   --module-shop: #1E5BD8;
   --module-shop-soft: #E8EEFB;
   --module-shop-border: rgba(60, 60, 67, 0.12);
   --module-lessons: #1E5BD8;
   --module-lessons-soft: #E8EEFB;
   --module-lessons-border: rgba(60, 60, 67, 0.12);
   --module-events: #1E5BD8;
   --module-events-soft: #E8EEFB;
   --module-events-border: rgba(60, 60, 67, 0.12);
   --program-edu-main: #1E5BD8;
   --program-edu-soft: #E8EEFB;
   --program-edu-from: #1E5BD8;
   --program-edu-to: #1848A8;
   --program-and-main: #1E5BD8;
   --program-and-soft: #E8EEFB;
   --program-and-from: #1E5BD8;
   --program-and-to: #1848A8;
   --program-vclub-main: #1E5BD8;
   --program-vclub-soft: #E8EEFB;
   --program-vclub-from: #1E5BD8;
   --program-vclub-to: #1848A8;
   --bg: #F2F2F7;
   --bg2: #FFFFFF;
   --bg3: #E5E5EA;
   --bg-dark: #000000;
   --bg-dark2: #1C1C1E;
   --card: #FFFFFF;
   --label: #000000;
   --label2: rgba(60, 60, 67, 0.6);
   --label3: rgba(60, 60, 67, 0.6);
   --label4: rgba(60, 60, 67, 0.3);
   --fill: rgba(120, 120, 128, 0.2);
   --fill2: rgba(120, 120, 128, 0.12);
   --fill3: rgba(120, 120, 128, 0.08);
   --sep: rgba(60, 60, 67, 0.12);
   --sep-opaque: #C6C6C8;
   --glass: rgba(255, 255, 255, 0.72);
   --glass-border: rgba(60, 60, 67, 0.12);
   --glass-highlight: rgba(255, 255, 255, 0.9);
   --liquid-blur: 20px;
   --liquid-saturate: 180%;
   --liquid-surface: rgba(255, 255, 255, 0.72);
   --liquid-chrome: rgba(255, 255, 255, 0.72);
   --liquid-border: rgba(60, 60, 67, 0.12);
   --liquid-shadow: none;
   --liquid-shadow-float: none;
   --mesh-1: transparent;
   --mesh-2: transparent;
   --mesh-3: transparent;
   --mesh-4: transparent;
   --mesh-5: transparent;
   --spectrum: none;
   --cream-card-bg: #FFFFFF;
   --cream-inset: none;
   --cream-shadow-soft: none;
   --cream-shadow-lift: none;
   --cream-radius-card: var(--r-xl);
   --space-section: 1.5rem;
   --space-block: 0.75rem;
   --r-xs: 8px;
   --r-sm: 12px;
   --r-md: 12px;
   --r-lg: 20px;
   --r-xl: 20px;
   --r-2xl: 28px;
   --r-3xl: 28px;
   --native-header-bar-h: 44px;
   --safe-top: env(safe-area-inset-top, 0px);
   --native-header-offset: calc(var(--safe-top) + 44px);
   --tab-h: 49px;
   --ios-tab-float: 16px;
   --s-card: none;
   --s-float: none;
   --s-sheet: 0 -8px 32px rgba(0, 0, 0, 0.12);
   --s-modal: 0 16px 48px rgba(0, 0, 0, 0.18);
   --ios-material: rgba(255, 255, 255, 0.72);
 }

.dark {
  --bg: #000000;
  --bg2: #1C1C1E;
  --bg3: #2C2C2E;
  --card: #1C1C1E;
  --cream: #000000;
  --cream-light: #1C1C1E;
  --cream-warm: #2C2C2E;
  --cream-border: rgba(84, 84, 88, 0.65);
  --cream-card-bg: #1C1C1E;
  --label: #FFFFFF;
  --label2: rgba(235, 235, 245, 0.6);
  --label3: rgba(235, 235, 245, 0.6);
  --label4: rgba(235, 235, 245, 0.3);
  --fill: rgba(120, 120, 128, 0.36);
  --fill2: rgba(120, 120, 128, 0.24);
  --fill3: rgba(120, 120, 128, 0.18);
  --sep: rgba(84, 84, 88, 0.65);
  --sep-opaque: #38383A;
  --glass: rgba(30, 30, 30, 0.72);
  --glass-border: rgba(84, 84, 88, 0.65);
  --glass-highlight: rgba(255, 255, 255, 0.08);
  --liquid-surface: rgba(30, 30, 30, 0.72);
  --liquid-chrome: rgba(30, 30, 30, 0.72);
  --liquid-border: rgba(84, 84, 88, 0.65);
  --ios-material: rgba(30, 30, 30, 0.72);
  --s-card: none;
  --s-sheet: 0 -8px 32px rgba(0, 0, 0, 0.45);
}

`;

text = text.slice(0, start) + replacement + text.slice(end);
text = text.replace(
  "font-family: var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;",
  "font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', var(--font-inter), Inter, sans-serif;"
);
text = text.replace("background: #F6F7F9;", "background: #F2F2F7;");
text = text.replace("font-size: 15px;\n  line-height: 1.45;", "font-size: 17px;\n  line-height: 1.4;");

const iosExtras = fs.readFileSync("c:/Users/User/Desktop/vcm/vcm/app/ios-system.css", "utf8");
if (!text.includes("iOS 18 SYSTEM LAYER")) {
  text += "\n" + iosExtras;
}
fs.writeFileSync(p, text);
console.log("patched globals.css", text.length);
