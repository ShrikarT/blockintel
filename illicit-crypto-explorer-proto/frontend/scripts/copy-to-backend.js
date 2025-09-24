import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const frontendDistPath = path.join(__dirname, '..', 'dist');
const backendStaticPath = path.join(__dirname, '..', '..', 'backend', 'static');

console.log('🚀 Copying frontend build to backend static folder...');
console.log(`Source: ${frontendDistPath}`);
console.log(`Destination: ${backendStaticPath}`);

try {
  // Check if dist folder exists
  if (!fs.existsSync(frontendDistPath)) {
    console.error('❌ Frontend build folder not found. Please run "npm run build" first.');
    process.exit(1);
  }

  // Create backend static directory if it doesn't exist
  if (!fs.existsSync(backendStaticPath)) {
    fs.mkdirSync(backendStaticPath, { recursive: true });
    console.log('📁 Created backend static directory');
  }

  // Remove existing static files
  if (fs.existsSync(backendStaticPath)) {
    const files = fs.readdirSync(backendStaticPath);
    for (const file of files) {
      const filePath = path.join(backendStaticPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
    console.log('🧹 Cleaned existing static files');
  }

  // Copy all files from dist to backend static
  function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const files = fs.readdirSync(src);
      for (const file of files) {
        copyRecursive(path.join(src, file), path.join(dest, file));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  copyRecursive(frontendDistPath, backendStaticPath);
  
  console.log('✅ Successfully copied frontend build to backend static folder!');
  console.log('🌐 Backend can now serve the frontend at http://127.0.0.1:8000');
  
} catch (error) {
  console.error('❌ Error copying files:', error.message);
  process.exit(1);
}
