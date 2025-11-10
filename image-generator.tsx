import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, ImageIcon } from 'lucide-react';

export default function ImageGenerator() {
  const [image, setImage] = useState(null);
  const [style, setStyle] = useState('logo-only');
  const [logo, setLogo] = useState('SPN');
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('white');
  const [fontSize, setFontSize] = useState(72);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const logoImages = useRef({});

  // Logo SVGs
  const logos = {
    SPN: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="white" stroke="black" stroke-width="4"/>
      <text x="100" y="120" font-family="Arial, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="black">SPN</text>
    </svg>`,
    Flatwater: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white" rx="10"/>
      <path d="M40 100 Q100 60 160 100" stroke="#0066cc" stroke-width="8" fill="none"/>
      <path d="M40 120 Q100 80 160 120" stroke="#0066cc" stroke-width="8" fill="none"/>
      <text x="100" y="160" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#0066cc">FLATWATER</text>
    </svg>`,
    Documenters: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#1a1a1a" rx="10"/>
      <rect x="60" y="40" width="80" height="100" fill="white" rx="4"/>
      <line x1="70" y1="60" x2="130" y2="60" stroke="#1a1a1a" stroke-width="3"/>
      <line x1="70" y1="80" x2="130" y2="80" stroke="#1a1a1a" stroke-width="3"/>
      <line x1="70" y1="100" x2="130" y2="100" stroke="#1a1a1a" stroke-width="3"/>
      <text x="100" y="170" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="white">DOCUMENTERS</text>
    </svg>`
  };

  useEffect(() => {
    // Load logos
    const loadLogos = async () => {
      for (const key of Object.keys(logos)) {
        const img = new Image();
        const blob = new Blob([logos[key]], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        await new Promise((resolve) => {
          img.onload = () => {
            logoImages.current[key] = img;
            resolve();
          };
          img.src = url;
        });
      }
      drawImage();
    };
    loadLogos();
  }, []);

  useEffect(() => {
    drawImage();
  }, [image, style, logo, text, textColor, fontSize]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 1920;
    canvas.height = 1080;

    // Fill background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw and convert image to grayscale
    if (image) {
      const scale = Math.max(
        canvas.width / image.width,
        canvas.height / image.height
      );
      const x = (canvas.width / 2) - (image.width / 2) * scale;
      const y = (canvas.height / 2) - (image.height / 2) * scale;
      
      ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
      
      // Convert to grayscale
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    const logoImg = logoImages.current[logo];
    if (!logoImg) return;

    if (style === 'logo-only') {
      // Center logo
      const logoSize = 300;
      ctx.drawImage(
        logoImg,
        (canvas.width - logoSize) / 2,
        (canvas.height - logoSize) / 2,
        logoSize,
        logoSize
      );
    } else if (style === 'with-text') {
      // Logo in bottom right
      const logoSize = 200;
      const padding = 40;
      ctx.drawImage(
        logoImg,
        canvas.width - logoSize - padding,
        canvas.height - logoSize - padding,
        logoSize,
        logoSize
      );

      // Draw text (top left, semi-transparent)
      if (text) {
        ctx.fillStyle = textColor;
        ctx.globalAlpha = 0.85;
        ctx.font = `bold ${fontSize}px Impact, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const lines = wrapText(ctx, text.toUpperCase(), canvas.width - 80);
        lines.forEach((line, i) => {
          const y = 40 + (i * fontSize * 1.2);
          ctx.fillText(line, 40, y);
        });
        
        ctx.globalAlpha = 1.0;
      }
    }
  };

  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'image.webp';
    link.href = canvas.toDataURL('image/webp', 0.95);
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">Image Generator</h1>
          <p className="text-gray-400">Create branded images with custom styles</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Canvas Preview */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Preview
            </h2>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-auto"
                style={{ maxHeight: '600px' }}
              />
            </div>
            <button
              onClick={downloadImage}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download Image (1920x1080 WebP)
            </button>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Image
              </h2>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all border-2 border-dashed border-gray-600 hover:border-gray-500"
              >
                Choose Image
              </button>
            </div>

            {/* Style Selection */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Style Options</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="logo-only">Grayscale with Centered Logo</option>
                  <option value="with-text">Grayscale with Text & Logo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Logo
                </label>
                <select
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="SPN">SPN</option>
                  <option value="Flatwater">Flatwater</option>
                  <option value="Documenters">Documenters</option>
                </select>
              </div>

              {style === 'with-text' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Text
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter your text"
                      rows="3"
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Text Color
                    </label>
                    <select
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="white">White</option>
                      <option value="black">Black</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Font Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="150"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Info */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Features:</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Output size: 1920x1080 pixels</li>
                <li>• Images converted to grayscale</li>
                <li>• Logo placement varies by style</li>
                <li>• Text at 85% opacity (with-text style)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}