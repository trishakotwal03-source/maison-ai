import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, hslToHex, hexToHsl } from '../lib/colors';

interface PremiumColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export default function PremiumColorPicker({ color, onChange }: PremiumColorPickerProps) {
  const [h, setH] = useState(0);
  const [s, setS] = useState(0);
  const [l, setL] = useState(50);
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const [hh, ss, ll] = hexToHsl(color);
    setH(hh);
    setS(ss);
    setL(ll);
  }, [color]);

  const drawWheel = useCallback(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    const radius = size / 2 - 2;
    const cx = size / 2;
    const cy = size / 2;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * size + x) * 4;
        if (dist <= radius) {
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          const hue = (angle + 360) % 360;
          const sat = Math.min(100, (dist / radius) * 100);
          const [r, g, b] = hslToRgb(hue, sat, 50);
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        } else {
          data[idx + 3] = 0;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  useEffect(() => { drawWheel(); }, [drawWheel]);

  const handleWheelInteraction = (clientX: number, clientY: number) => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = rect.width / 2 - 2;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const newH = (angle + 360) % 360;
    const newS = Math.min(100, (dist / radius) * 100);
    const newColor = hslToHex(newH, newS, l);
    setH(newH);
    setS(newS);
    onChange(newColor);
  };

  const updateFromHsl = (newH: number, newS: number, newL: number) => {
    setH(newH);
    setS(newS);
    setL(newL);
    onChange(hslToHex(newH, newS, newL));
  };

  const [r, g, b] = hexToRgb(color);
  const wheelSize = 200;
  const wheelRadius = wheelSize / 2 - 2;
  const indicatorX = wheelRadius + (s / 100) * wheelRadius * Math.cos(h * Math.PI / 180);
  const indicatorY = wheelRadius + (s / 100) * wheelRadius * Math.sin(h * Math.PI / 180);

  return (
    <div className="space-y-5">
      <div className="flex gap-5">
        <div className="relative flex-shrink-0">
          <canvas
            ref={wheelRef}
            width={wheelSize}
            height={wheelSize}
            className="rounded-full cursor-crosshair shadow-luxe"
            style={{ width: wheelSize, height: wheelSize }}
            onPointerDown={(e) => {
              setDragging(true);
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              handleWheelInteraction(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => dragging && handleWheelInteraction(e.clientX, e.clientY)}
            onPointerUp={() => setDragging(false)}
          />
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none"
            style={{
              left: indicatorX - 8,
              top: indicatorY - 8,
              backgroundColor: color,
            }}
          />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-xs text-taupe mb-1.5">Lightness</label>
            <input
              type="range"
              min="0"
              max="100"
              value={l}
              onChange={(e) => updateFromHsl(h, s, Number(e.target.value))}
              className="w-full"
              style={{
                background: `linear-gradient(to right, ${hslToHex(h, s, 0)}, ${hslToHex(h, s, 50)}, ${hslToHex(h, s, 100)})`,
              }}
            />
          </div>

          <div className="rounded-xl overflow-hidden h-12 shadow-luxe" style={{ backgroundColor: color }} />

          <div className="space-y-2">
            <div>
              <label className="block text-xs text-taupe mb-1">Hex</label>
              <input
                type="text"
                value={color.toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-Fa-f]{6}$/.test(val)) onChange(val);
                }}
                className="w-full px-3 py-2 rounded-lg bg-white/40 border border-white/50 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-mocha/30"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['R', 'G', 'B'] as const).map((label, i) => (
                <div key={label}>
                  <label className="block text-xs text-taupe mb-1">{label}</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={[r, g, b][i]}
                    onChange={(e) => {
                      const vals = [r, g, b];
                      vals[i] = Math.max(0, Math.min(255, Number(e.target.value) || 0));
                      onChange(rgbToHex(vals[0], vals[1], vals[2]));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-white/40 border border-white/50 text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-mocha/30"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([['H', h, 360], ['S', s, 100], ['L', l, 100]] as const).map(([label, val, max]) => (
                <div key={label}>
                  <label className="block text-xs text-taupe mb-1">{label}</label>
                  <input
                    type="number"
                    min="0"
                    max={max}
                    value={val}
                    onChange={(e) => {
                      const newV = Math.max(0, Math.min(max, Number(e.target.value) || 0));
                      if (label === 'H') updateFromHsl(newV, s, l);
                      if (label === 'S') updateFromHsl(h, newV, l);
                      if (label === 'L') updateFromHsl(h, s, newV);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-white/40 border border-white/50 text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-mocha/30"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
