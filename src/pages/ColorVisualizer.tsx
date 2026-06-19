import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, Redo2, Download, Eye, Palette, Pipette, RotateCcw, AlertCircle, MoveHorizontal, Frame } from 'lucide-react';
import UploadZone from '../components/UploadZone';
import Questionnaire from '../components/Questionnaire';
import PremiumColorPicker from '../components/PremiumColorPicker';
import LoadingShimmer from '../components/LoadingShimmer';
import { preprocessImage, loadImageFromUrl, downloadCanvas } from '../lib/imageUtils';
import { hexToRgb } from '../lib/colors';
import { stylePalettes } from '../lib/stylePalettes';
import type { ProcessedImage } from '../lib/imageUtils';
import type { QuestionnaireData, ColorPalette, WallPolygon } from '../lib/types';

export default function ColorVisualizer() {
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [walls, setWalls] = useState<number[][][]>([]);
  const [selectedColor, setSelectedColor] = useState('#D8CFC4');
  const [opacity, setOpacity] = useState(0.75);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [palette, setPalette] = useState<ColorPalette[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [history, setHistory] = useState<{ color: string; opacity: number }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showSlider, setShowSlider] = useState(false);
  const [showWallOutlines, setShowWallOutlines] = useState(false);
  const [stage, setStage] = useState<'upload' | 'editor'>('upload');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleUpload = async (file: File) => {
    try {
      setError('');
      const processed = await preprocessImage(file);
      setProcessedImage(processed);
      const img = await loadImageFromUrl(processed.dataUrl);
      setImage(img);
      setStage('editor');
      setShowQuestionnaire(true);
    } catch {
      setError('Failed to process image. Please try a different file.');
    }
  };

  const detectWalls = async (questionnaire?: QuestionnaireData) => {
    if (!processedImage) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/gemini-walls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: processedImage.base64,
          mimeType: processedImage.mimeType,
          width: processedImage.width,
          height: processedImage.height,
        }),
      });
      const text = await res.text();
      if (!text) throw new Error('The AI returned an empty response. Please try again.');
      let data;
      try { data = JSON.parse(text); } catch { throw new Error('The AI response was malformed. Please try again.'); }
      if (!res.ok) throw new Error(data.error || 'Failed to detect walls');
      setWalls(data.walls.map((w: WallPolygon) => w.polygon));
      setHistory([{ color: selectedColor, opacity }]);
      setHistoryIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect walls. Please ensure your Gemini API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const getPalette = async (questionnaire: QuestionnaireData) => {
    if (!processedImage) return;
    try {
      const res = await fetch('/api/gemini-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: processedImage.base64,
          mimeType: processedImage.mimeType,
          questionnaire,
        }),
      });
      const text = await res.text();
      if (!text) return;
      let data;
      try { data = JSON.parse(text); } catch { return; }
      if (!res.ok) throw new Error(data.error);
      setPalette(data.palette);
    } catch {
      if (questionnaire.styles.length > 0 && stylePalettes[questionnaire.styles[0]]) {
        setPalette(stylePalettes[questionnaire.styles[0]]);
      }
    }
  };

  const handleQuestionnaireSubmit = (data: QuestionnaireData) => {
    setShowQuestionnaire(false);
    detectWalls(data);
    getPalette(data);
  };

  const handleQuestionnaireSkip = () => {
    setShowQuestionnaire(false);
    detectWalls();
    setShowPicker(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    // Draw original image
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(image, 0, 0, w, h);

    if (walls.length === 0) return;

    // Step 1: Create a mask canvas with wall polygons (with slight dilation for edge coverage)
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = w;
    maskCanvas.height = h;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    maskCtx.fillStyle = 'white';
    walls.forEach((polygon) => {
      // Slightly expand the polygon outward from centroid for dilation effect
      let cx = 0, cy = 0;
      polygon.forEach(p => { cx += p[0]; cy += p[1]; });
      cx /= polygon.length;
      cy /= polygon.length;
      const dilation = 3; // pixels to expand

      maskCtx.beginPath();
      polygon.forEach((point, i) => {
        const dx = point[0] - cx;
        const dy = point[1] - cy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const ex = point[0] + (dx / len) * dilation;
        const ey = point[1] + (dy / len) * dilation;
        if (i === 0) maskCtx.moveTo(ex, ey);
        else maskCtx.lineTo(ex, ey);
      });
      maskCtx.closePath();
      maskCtx.fill();
    });

    // Step 2: Feather the mask edges with a slight blur for smooth transitions
    maskCtx.filter = 'blur(2px)';
    maskCtx.globalCompositeOperation = 'copy';
    maskCtx.drawImage(maskCanvas, 0, 0);
    maskCtx.filter = 'none';
    maskCtx.globalCompositeOperation = 'source-over';

    // Step 3: Create the paint color canvas
    const paintCanvas = document.createElement('canvas');
    paintCanvas.width = w;
    paintCanvas.height = h;
    const paintCtx = paintCanvas.getContext('2d');
    if (!paintCtx) return;

    const [r, g, b] = hexToRgb(selectedColor);
    // For multiply blend: we want the color to interact with the original texture
    // Lower opacity = closer to original, higher opacity = more paint color
    const ar = Math.round(255 + (r - 255) * opacity);
    const ag = Math.round(255 + (g - 255) * opacity);
    const ab = Math.round(255 + (b - 255) * opacity);
    paintCtx.fillStyle = `rgb(${ar}, ${ag}, ${ab})`;
    paintCtx.fillRect(0, 0, w, h);

    // Step 4: Apply the feathered mask to the paint canvas (only paint where mask is)
    paintCtx.globalCompositeOperation = 'destination-in';
    paintCtx.drawImage(maskCanvas, 0, 0);
    paintCtx.globalCompositeOperation = 'source-over';

    // Step 5: Blend the masked paint onto the original image using multiply
    // This preserves texture, lighting, and shadows while applying the color
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(paintCanvas, 0, 0);

    // Step 6: Add a subtle overlay blend for more natural color integration
    // This adds a slight soft-light effect at the paint edges
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }, [image, walls, selectedColor, opacity]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (walls.length > 0 && historyIndex >= 0) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ color, opacity });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSelectedColor(history[newIndex].color);
      setOpacity(history[newIndex].opacity);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSelectedColor(history[newIndex].color);
      setOpacity(history[newIndex].opacity);
    }
  };

  const handleDownload = (format: 'png' | 'jpg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadCanvas(canvas, `maison-color-${Date.now()}.${format}`, format);
  };

  const handleReset = () => {
    setProcessedImage(null);
    setImage(null);
    setWalls([]);
    setPalette([]);
    setHistory([]);
    setHistoryIndex(-1);
    setSelectedColor('#D8CFC4');
    setOpacity(0.75);
    setShowSlider(false);
    setShowPicker(false);
    setShowWallOutlines(false);
    setError('');
    setStage('upload');
  };

  const handleSliderDrag = (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const handleMove = (ev: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      setSliderPosition(Math.max(0, Math.min(100, (x / rect.width) * 100)));
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  if (stage === 'upload') {
    return (
      <>
        <UploadZone onUpload={handleUpload} title="Color Scheme Visualizer" description="Upload a photo of your room and let AI detect walls to visualize new paint colors in real-time with texture-preserving blend technology." />
        {error && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-strong rounded-2xl px-5 py-3 shadow-luxe flex items-center gap-2 text-sm text-mocha">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-6 px-4 md:px-6">
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        <div className="flex-1 flex flex-col items-center">
          <div ref={containerRef} className="relative w-full max-w-3xl">
            <canvas
              ref={canvasRef}
              width={processedImage?.width}
              height={processedImage?.height}
              className="block w-full h-auto rounded-2xl shadow-luxe"
            />

            {showSlider && processedImage && (
              <>
                <div
                  className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img src={processedImage.dataUrl} className="block w-full h-full" alt="Original" />
                </div>
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white/90 cursor-ew-resize shadow-lg"
                  style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                  onPointerDown={handleSliderDrag}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                    <MoveHorizontal size={16} className="text-espresso" />
                  </div>
                </div>
              </>
            )}

            {showWallOutlines && walls.length > 0 && processedImage && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${processedImage.width} ${processedImage.height}`} preserveAspectRatio="none">
                {walls.map((polygon, i) => (
                  <polygon
                    key={i}
                    points={polygon.map((p) => p.join(',')).join(' ')}
                    fill="rgba(108, 81, 67, 0.12)"
                    stroke="rgba(108, 81, 67, 0.7)"
                    strokeWidth="3"
                    strokeDasharray="8 4"
                  />
                ))}
              </svg>
            )}

            {loading && (
              <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <LoadingShimmer message="Detecting walls..." submessage="Gemini Vision is analyzing your room" />
              </div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 glass-strong rounded-2xl p-4 max-w-3xl w-full flex items-start gap-3"
            >
              <AlertCircle size={20} className="text-mocha flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-espresso">{error}</p>
                <button onClick={() => detectWalls()} className="mt-2 text-xs text-mocha hover:underline">
                  Retry detection
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:w-80 flex-shrink-0">
          <div className="glass-strong rounded-3xl shadow-luxe p-5 space-y-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-taupe">Walls Detected</p>
                <p className="font-display text-xl text-espresso">
                  {loading ? '...' : walls.length > 0 ? `${walls.length} walls` : 'Pending'}
                </p>
              </div>
              <button onClick={handleReset} className="text-xs text-taupe hover:text-espresso transition-colors flex items-center gap-1">
                <RotateCcw size={12} />
                New Image
              </button>
            </div>

            {palette.length > 0 && (
              <div>
                <p className="text-xs font-medium text-espresso mb-2 flex items-center gap-1.5">
                  <Palette size={14} />
                  AI Palette
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {palette.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => handleColorSelect(c.hex)}
                      className={`group rounded-xl overflow-hidden shadow-luxe transition-all hover:scale-105 ${selectedColor === c.hex ? 'ring-2 ring-espresso ring-offset-2' : ''}`}
                    >
                      <div className="h-14" style={{ backgroundColor: c.hex }} />
                      <p className="text-[10px] text-taupe py-1 px-1 truncate bg-white/50">{c.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowPicker(!showPicker)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/40 hover:bg-white/60 transition-colors text-sm text-espresso"
            >
              <span className="flex items-center gap-2">
                <Pipette size={14} />
                Custom Color
              </span>
              <span className="w-6 h-6 rounded-full shadow-sm border border-white/60" style={{ backgroundColor: selectedColor }} />
            </button>

            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2">
                    <PremiumColorPicker color={selectedColor} onChange={handleColorSelect} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-espresso">Opacity</label>
                <span className="text-xs text-taupe">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity * 100}
                onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/40 hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm text-espresso"
              >
                <Undo2 size={16} />
                Undo
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/40 hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm text-espresso"
              >
                <Redo2 size={16} />
                Redo
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowSlider(!showSlider)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-colors ${
                  showSlider ? 'bg-espresso text-linen' : 'bg-white/40 text-espresso hover:bg-white/60'
                }`}
              >
                <Eye size={16} />
                Before / After
              </button>
              <button
                onClick={() => setShowWallOutlines(!showWallOutlines)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-colors ${
                  showWallOutlines ? 'bg-espresso text-linen' : 'bg-white/40 text-espresso hover:bg-white/60'
                }`}
              >
                <Frame size={16} />
                Show Wall Regions
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/30">
              <button
                onClick={() => handleDownload('png')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-mocha text-linen hover:shadow-luxe transition-all text-sm font-medium"
              >
                <Download size={16} />
                PNG
              </button>
              <button
                onClick={() => handleDownload('jpg')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-espresso text-linen hover:shadow-luxe transition-all text-sm font-medium"
              >
                <Download size={16} />
                JPG
              </button>
            </div>
          </div>
        </div>
      </div>

      <Questionnaire
        open={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        onSubmit={handleQuestionnaireSubmit}
        onSkip={handleQuestionnaireSkip}
      />
    </div>
  );
}
