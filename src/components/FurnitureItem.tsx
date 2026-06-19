import { useRef } from 'react';
import type { FurnitureInstance } from '../lib/types';

interface FurnitureItemProps {
  item: FurnitureInstance;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<FurnitureInstance>) => void;
}

export default function FurnitureItem({ item, selected, onSelect, onUpdate }: FurnitureItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startItemX = item.x;
    const startItemY = item.y;

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      onUpdate(item.id, { x: startItemX + dx, y: startItemY + dy });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = item.width;
    const startH = item.height;

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const rad = -item.rotation * Math.PI / 180;
      const localDx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const localDy = dx * Math.sin(rad) + dy * Math.cos(rad);
      onUpdate(item.id, {
        width: Math.max(30, startW + localDx),
        height: Math.max(30, startH + localDy),
      });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const handleRotateStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    const rect = itemRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const handleMove = (ev: PointerEvent) => {
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI + 90;
      const normalized = ((angle % 360) + 360) % 360;
      onUpdate(item.id, { rotation: Math.round(normalized) });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const transform = `rotate(${item.rotation}deg) perspective(800px) rotateX(${item.perspective}deg)`;

  return (
    <div
      ref={itemRef}
      onPointerDown={handleDragStart}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className="absolute cursor-move select-none"
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform,
        zIndex: item.zIndex,
      }}
    >
      <img
        src={item.src}
        alt={item.name}
        draggable={false}
        className="w-full h-full object-contain pointer-events-none"
        style={{
          filter: item.shadow ? 'drop-shadow(0 8px 16px rgba(59,42,36,0.25))' : 'none',
        }}
      />

      {selected && (
        <>
          <div className="absolute inset-0 border-2 border-mocha rounded-sm pointer-events-none" />

          <div
            onPointerDown={handleRotateStart}
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing border border-mocha/30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-mocha">
              <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </div>

          {[
            { cls: '-bottom-2 -right-2 cursor-nwse-resize' },
            { cls: '-bottom-2 -left-2 cursor-nesw-resize' },
            { cls: '-top-2 -right-2 cursor-nwse-resize' },
            { cls: '-top-2 -left-2 cursor-nesw-resize' },
          ].map((h, i) => (
            <div
              key={i}
              onPointerDown={handleResizeStart}
              className={`absolute ${h.cls} w-6 h-6 rounded-full bg-white shadow-lg border-2 border-mocha`}
            />
          ))}
        </>
      )}
    </div>
  );
}
