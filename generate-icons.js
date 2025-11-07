// Simple icon generator for PWA
// Creates basic colored icons as placeholders
const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient (indigo)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1');
  gradient.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Add some rounded corners effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(size * 0.7, size * 0.3, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Draw a simple "F" for FocusFlow
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('F', size / 2, size / 2);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated ${outputPath}`);
}

// Generate icons
try {
  generateIcon(192, 'public/icon-192x192.png');
  generateIcon(512, 'public/icon-512x512.png');
  console.log('Icons generated successfully!');
} catch (error) {
  console.error('Error generating icons:', error.message);
  console.log('\nNote: This script requires the "canvas" package.');
  console.log('If you see this error, you can:');
  console.log('1. Install canvas: npm install canvas');
  console.log('2. Or create your own icons and place them in the public/ folder');
  console.log('   - icon-192x192.png (192x192 pixels)');
  console.log('   - icon-512x512.png (512x512 pixels)');
}
