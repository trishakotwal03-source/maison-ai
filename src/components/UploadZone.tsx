import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (file: File) => void;
  title: string;
  description: string;
}

export default function UploadZone({ onUpload, title, description }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    onUpload(file);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl"
      >
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
          whileHover={{ y: -4 }}
          className={`glass-strong rounded-3xl p-12 md:p-16 text-center cursor-pointer transition-all duration-300 shadow-luxe ${
            dragging ? 'ring-2 ring-mocha scale-[1.02] shadow-luxe-lg' : ''
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <motion.div
            animate={{ y: dragging ? -8 : 0 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-champagne to-almond flex items-center justify-center shadow-luxe mb-6"
          >
            <Upload size={32} className="text-mocha" />
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl text-espresso mb-3">{title}</h2>
          <p className="text-taupe text-base md:text-lg max-w-md mx-auto leading-relaxed">{description}</p>
          <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-espresso text-linen text-sm font-medium shadow-luxe">
            <ImageIcon size={16} />
            Choose Image
          </div>
          <p className="mt-4 text-xs text-taupe/70">JPG, PNG · Max 10MB · Drag & drop or click</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
