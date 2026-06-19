import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus } from 'lucide-react';
import { furnitureCategories, furnitureAssets, getAssetsByCategory } from '../lib/furnitureData';
import type { FurnitureAsset } from '../lib/types';

interface FurnitureSidebarProps {
  onAddItem: (asset: FurnitureAsset) => void;
  onAddCustom: (asset: FurnitureAsset) => void;
}

export default function FurnitureSidebar({ onAddItem, onAddCustom }: FurnitureSidebarProps) {
  const [activeCategory, setActiveCategory] = useState<string>(furnitureCategories[0]);
  const [customAssets, setCustomAssets] = useState<FurnitureAsset[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const allAssets = [...furnitureAssets, ...customAssets];
  const assets = getAssetsByCategory(activeCategory).length > 0
    ? getAssetsByCategory(activeCategory)
    : allAssets.filter(a => a.category === activeCategory);

  const displayAssets = [...getAssetsByCategory(activeCategory), ...customAssets.filter(a => a.category === activeCategory)];

  const handleCustomUpload = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 300;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = (h / w) * maxDim; w = maxDim; }
          else { w = (w / h) * maxDim; h = maxDim; }
        }
        const asset: FurnitureAsset = {
          id: `custom-${Date.now()}`,
          name: file.name.replace(/\.[^.]+$/, ''),
          category: activeCategory,
          src: reader.result as string,
          defaultWidth: Math.round(w),
          defaultHeight: Math.round(h),
        };
        setCustomAssets(prev => [...prev, asset]);
        onAddCustom(asset);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong rounded-3xl shadow-luxe-lg w-72 max-h-[calc(100vh-140px)] flex flex-col overflow-hidden"
    >
      <div className="p-4 border-b border-white/30">
        <h3 className="font-display text-lg text-espresso">Furniture</h3>
        <p className="text-xs text-taupe mt-0.5">Click to place on canvas</p>
      </div>

      <div className="px-3 pt-3 flex flex-wrap gap-1.5">
        {furnitureCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-espresso text-linen shadow-luxe'
                : 'bg-white/40 text-taupe hover:bg-white/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="columns-2 gap-2">
          <AnimatePresence mode="popLayout">
            {displayAssets.map((asset) => (
              <motion.button
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onAddItem(asset)}
                className="group block w-full mb-2 break-inside-avoid"
              >
                <div className="rounded-xl bg-white/50 p-2 shadow-luxe group-hover:shadow-luxe-lg transition-all overflow-hidden">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-champagne/30 to-almond/20 flex items-center justify-center">
                    <img
                      src={asset.src}
                      alt={asset.name}
                      className="max-w-full max-h-full object-contain"
                      draggable={false}
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-taupe text-center truncate">{asset.name}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          className="mt-3 w-full py-3 rounded-xl border-2 border-dashed border-taupe/30 text-xs text-taupe hover:border-mocha hover:text-mocha transition-colors flex items-center justify-center gap-2"
        >
          <Upload size={14} />
          Upload Custom PNG
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => handleCustomUpload(e.target.files?.[0])}
        />
      </div>
    </motion.div>
  );
}
