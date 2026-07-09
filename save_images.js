const fs = require('fs');
const path = require('path');

function processImages(images) {
  if (!images || !Array.isArray(images)) return [];
  const uploadDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return images.map(img => {
    if (img.startsWith('data:image/')) {
      const matches = img.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1];
        const base64Data = matches[2];
        const filename = `img-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, base64Data, 'base64');
        return `/uploads/${filename}`;
      }
    }
    return img;
  });
}
