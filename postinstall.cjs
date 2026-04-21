/**
 * postinstall.cjs
 * Patches @capacitor-community/text-to-speech build.gradle to replace
 * the deprecated 'proguard-android.txt' with 'proguard-android-optimize.txt'
 * which is required for Gradle 10+ / AGP 8+ compatibility.
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  'node_modules',
  '@capacitor-community',
  'text-to-speech',
  'android',
  'build.gradle'
);

if (!fs.existsSync(target)) {
  console.log('[postinstall] TTS plugin build.gradle not found — skipping patch.');
  process.exit(0);
}

const original = fs.readFileSync(target, 'utf8');
const patched = original.replace(
  /getDefaultProguardFile\('proguard-android\.txt'\)/g,
  "getDefaultProguardFile('proguard-android-optimize.txt')"
);

if (original === patched) {
  console.log('[postinstall] TTS plugin already patched — nothing to do.');
} else {
  fs.writeFileSync(target, patched, 'utf8');
  console.log('[postinstall] Patched @capacitor-community/text-to-speech build.gradle ✓');
}
