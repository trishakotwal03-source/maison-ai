import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Copy, BringToFront, SendToBack, Download, Sun, Sofa, X } from 'lucide-react';
import UploadZone from '../components/UploadZone';
import FurnitureSidebar from '../components/FurnitureSidebar';
import FurnitureItem from '../components/FurnitureItem';
import { preprocessImage, loadImageFromUrl, downloadCanvas } from '../lib/imageUtils';
import type { FurnitureAsset, FurnitureInstance } from '../lib/types';

export default function FurniturePlacement() {
  const [roomImage, setRoomImage] = useState<string>('');
  const [roomDimensions, setRoomDimensions] = useState({ width: 0, height: 0 });
  const [items, setItems] = useState<FurnitureInstance[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleUpload = async (file: File) => {
    const processed = await preprocessImage(file);
    setRoomImage(processed.dataUrl);
    setRoomDimensions({ width: processed.width, height: processed.height });
    updateScale(processed.width, processed.height);
  };

  const updateScale = (w: number, h: number) => {
    const isMobile = window.innerWidth < 768;
    const maxW = isMobile ? window.innerWidth - 32 : window.innerWidth - 340;
    const maxH = window.innerHeight - 160;
    setScale(Math.min(maxW / w, maxH / h, 1));
  };

  useEffect(() => {
    if (roomDimensions.width === 0) return;
    const handleResize = () => updateScale(roomDimensions.width, roomDimensions.height);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [roomDimensions]);

  const addFurniture = (asset: FurnitureAsset) => {
    const newItem: FurnitureInstance = {
      id: `item-${Date.now()}`,
      assetId: asset.id,
      src: asset.src,
      name: asset.name,
      x: roomDimensions.width / 2 - asset.defaultWidth / 2,
      y: roomDimensions.height / 2 - asset.defaultHeight / 2,
      width: asset.defaultWidth,
      height: asset.defaultHeight,
      rotation: 0,
      zIndex: items.length + 1,
      shadow: true,
      perspective: 0,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
    setShowMobileSidebar(false);
  };

  const updateItem = (id: string, updates: Partial<FurnitureInstance>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedItemId(null);
  };

  const duplicateItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newItem: FurnitureInstance = {
      ...item,
      id: `item-${Date.now()}`,
      x: item.x + 30,
      y: item.y + 30,
      zIndex: Math.max(...items.map((i) => i.zIndex)) + 1,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  };

  const bringForward = (id: string) => {
    setItems((prev) => {
      const maxZ = Math.max(...prev.map((i) => i.zIndex));
      return prev.map((i) => (i.id === id ? { ...i, zIndex: maxZ + 1 } : i));
    });
  };

  const sendBackward = (id: string) => {
    setItems((prev) => {
      const minZ = Math.min(...prev.map((i) => i.zIndex));
      return prev.map((i) => (i.id === id ? { ...i, zIndex: minZ - 1 } : i));
    });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!selectedItemId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteItem(selectedItemId);
      }
      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        duplicateItem(selectedItemId);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedItemId, items]);

  const exportComposition = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = roomDimensions.width;
    canvas.height = roomDimensions.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const roomImg = await loadImageFromUrl(roomImage);
    ctx.drawImage(roomImg, 0, 0, canvas.width, canvas.height);

    const sorted = [...items].sort((a, b) => a.zIndex - b.zIndex);
    for (const item of sorted) {
      const img = await loadImageFromUrl(item.src);
      ctx.save();
      ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
      ctx.rotate((item.rotation * Math.PI) / 180);
      if (item.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
      }
      ctx.drawImage(img, -item.width / 2, -item.height / 2, item.width, item.height);
      ctx.restore();
    }

    downloadCanvas(canvas, `maison-furniture-${Date.now()}.png`, 'png');
  };

  if (!roomImage) {
    return (
      <UploadZone
        onUpload={handleUpload}
        title="Furniture Placement"
        description="Upload a photo of your room and start placing realistic furniture pieces with drag, drop, resize, and rotate controls."
      />
    );
  }

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const toolbarBtn =
    'w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-espresso hover:bg-white/60';

  return (
    <div className="min-h-screen pt-20 pb-6 flex">
      <div className="hidden md:block w-72 flex-shrink-0 pl-4">
        <FurnitureSidebar onAddItem={addFurniture} onAddCustom={addFurniture} />
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
          onClick={() => setSelectedItemId(null)}
        >
          <div ref={canvasRef} className="relative" style={{ width: roomDimensions.width, height: roomDimensions.height }}>
            <img src={roomImage} className="absolute inset-0 w-full h-full rounded-2xl shadow-luxe object-cover" alt="Room" draggable={false} />
            {items.map((item) => (
              <FurnitureItem
                key={item.id}
                item={item}
                selected={item.id === selectedItemId}
                onSelect={() => setSelectedItemId(item.id)}
                onUpdate={updateItem}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] md:hidden"
          >
            <div className="absolute inset-0 bg-espresso/30 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-0 right-0"
            >
              <div className="relative">
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="absolute -top-12 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
                >
                  <X size={20} className="text-espresso" />
                </button>
                <FurnitureSidebar onAddItem={addFurniture} onAddCustom={addFurniture} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="glass-strong rounded-2xl shadow-luxe-lg px-3 py-2.5 flex items-center gap-1">
              <button onClick={() => duplicateItem(selectedItem.id)} className={toolbarBtn} title="Duplicate">
                <Copy size={18} />
              </button>
              <button onClick={() => deleteItem(selectedItem.id)} className={toolbarBtn} title="Delete">
                <Trash2 size={18} />
              </button>
              <div className="w-px h-6 bg-taupe/20" />
              <button onClick={() => bringForward(selectedItem.id)} className={toolbarBtn} title="Bring Forward">
                <BringToFront size={18} />
              </button>
              <button onClick={() => sendBackward(selectedItem.id)} className={toolbarBtn} title="Send Backward">
                <SendToBack size={18} />
              </button>
              <div className="w-px h-6 bg-taupe/20" />
              <button
                onClick={() => updateItem(selectedItem.id, { shadow: !selectedItem.shadow })}
                className={`${toolbarBtn} ${selectedItem.shadow ? 'text-mocha' : ''}`}
                title="Toggle Shadow"
              >
                <Sun size={18} />
              </button>
              <div className="w-px h-6 bg-taupe/20" />
              <div className="px-2 flex items-center gap-2">
                <span className="text-xs text-taupe">Persp</span>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={selectedItem.perspective}
                  onChange={(e) => updateItem(selectedItem.id, { perspective: Number(e.target.value) })}
                  className="w-20"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={exportComposition}
        className="fixed top-24 right-6 z-40 glass-strong rounded-full px-4 py-2.5 shadow-luxe flex items-center gap-2 text-sm text-espresso hover:shadow-luxe-lg transition-all"
      >
        <Download size={16} />
        Export
      </motion.button>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setShowMobileSidebar(true)}
        className="fixed bottom-6 right-6 z-40 md:hidden w-14 h-14 rounded-full bg-espresso text-linen shadow-luxe-lg flex items-center justify-center"
      >
        <Sofa size={24} />
      </motion.button>
    </div>
  );
}
