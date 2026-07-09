#!/bin/bash
cat << 'INNEREOF' > replacer7.cjs
const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const startIndex = code.indexOf('  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {');
const endIndex = code.indexOf('  // --- Coupons Logic ---');

const fix = `  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setProductForm(prev => ({
      ...prev,
      images: [...(prev.images || []), croppedImage]
    }));
    setCropImageSrc(null);
  };

  const handleRemoveImage = (index: number) => {
    setProductForm(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setProductForm(prev => {
      const newImages = [...(prev.images || [])];
      if (direction === 'up' && index > 0) {
        [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      } else if (direction === 'down' && index < newImages.length - 1) {
        [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
      }
      return { ...prev, images: newImages };
    });
  };

`;

code = code.substring(0, startIndex) + fix + code.substring(endIndex);

fs.writeFileSync('src/pages/Admin.tsx', code);
INNEREOF
node replacer7.cjs
