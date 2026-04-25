"use client";

import { motion } from "framer-motion";
import {
  Fingerprint,
  Hexagon,
  Download,
  FileImage,
  FileText,
} from "lucide-react";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface SporeCardProps {
  id: string;
  name: string;
  role: string;
  bio?: string;
  avatar: string;
  capacity: string;
  accent: "acid" | "shock" | "cobalt" | "lime";
  isMain?: boolean;
}

const ACCENT_BG: Record<SporeCardProps["accent"], string> = {
  acid: "bg-acid",
  shock: "bg-shock",
  cobalt: "bg-cobalt",
  lime: "bg-lime",
};

const ACCENT_TEXT: Record<SporeCardProps["accent"], string> = {
  acid: "text-ink",
  shock: "text-paper",
  cobalt: "text-paper",
  lime: "text-ink",
};

export function SporeCard({
  id,
  name,
  role,
  bio,
  avatar,
  capacity,
  accent,
  isMain,
}: SporeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const filename = `${id}-${name.replace(/\s+/g, "_")}`;

  const renderPng = async () => {
    if (!cardRef.current) {
      throw new Error("No card");
    }

    return await toPng(cardRef.current, {
      pixelRatio: 3,
      cacheBust: false,
      backgroundColor: "#f6f4ee",
    });
  };

  const handlePng = async () => {
    try {
      setBusy("png");
      const dataUrl = await renderPng();
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("PNG exported", { description: `${filename}.png` });
    } catch (e) {
      toast.error("Export failed", { description: (e as Error).message });
    } finally {
      setBusy(null);
      setMenuOpen(false);
    }
  };

  const handlePdf = async () => {
    try {
      setBusy("pdf");
      const dataUrl = await renderPng();
      const img = new Image();
      img.src = dataUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error("Failed to load image for PDF export"));
      });

      const w = img.width;
      const h = img.height;
      const pdf = new jsPDF({
        orientation: h > w ? "portrait" : "landscape",
        unit: "px",
        format: [w, h],
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, w, h);
      pdf.save(`${filename}.pdf`);
      toast.success("PDF exported", { description: `${filename}.pdf` });
    } catch (e) {
      toast.error("Export failed", { description: (e as Error).message });
    } finally {
      setBusy(null);
      setMenuOpen(false);
    }
  };

  return (
    <motion.div
      whileHover={{ x: -3, y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="relative"
    >
      <div className="absolute -top-3 -right-3 z-20" data-html2canvas-ignore>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Export card"
          className="bg-ink text-acid border-[3px] border-ink w-10 h-10 flex items-center justify-center hover:bg-shock hover:text-paper transition-colors shadow-brutal"
          type="button"
        >
          <Download className="w-4 h-4" strokeWidth={3} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-paper border-[3px] border-ink shadow-brutal">
            <button
              onClick={handlePng}
              disabled={busy !== null}
              className="w-full flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-widest font-bold hover:bg-acid disabled:opacity-50 border-b-[3px] border-ink"
              type="button"
            >
              <FileImage className="w-3.5 h-3.5" />
              {busy === "png" ? "Saving..." : "PNG Image"}
            </button>
            <button
              onClick={handlePdf}
              disabled={busy !== null}
              className="w-full flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-widest font-bold hover:bg-shock hover:text-paper disabled:opacity-50"
              type="button"
            >
              <FileText className="w-3.5 h-3.5" />
              {busy === "pdf" ? "Saving..." : "PDF File"}
            </button>
          </div>
        )}
      </div>

      <div
        ref={cardRef}
        className={`relative bg-paper border-[5px] border-ink shadow-brutal-lg ${isMain ? "p-6" : "p-4"}`}
      >
        <div
          className={`flex items-center justify-between mb-4 px-4 py-2 border-b-[5px] border-ink ${ACCENT_BG[accent]} ${ACCENT_TEXT[accent]} ${isMain ? "-mx-6 -mt-6" : "-mx-4 -mt-4"}`}
        >
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest font-bold min-w-0">
            <Fingerprint className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{id}</span>
          </div>
          <Hexagon className="w-4 h-4" />
        </div>

        <div
          className={`relative border-[3px] border-ink overflow-hidden mb-4 mx-auto ${isMain ? "w-full aspect-square max-w-70" : "w-full aspect-square"}`}
        >
          <img
            src={avatar}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-ink/80 text-paper px-2 py-1 font-mono text-[9px] uppercase tracking-widest">
            {role}
          </div>
        </div>

        <h3
          className={`font-display uppercase tracking-tight leading-none mb-2 ${isMain ? "text-3xl" : "text-lg"}`}
        >
          {name}
        </h3>

        {isMain && bio && (
          <p className="font-sans text-sm text-muted-foreground mb-4 leading-snug">
            {bio}
          </p>
        )}

        <div className="border-t-[3px] border-ink pt-3 mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
          <span className="text-muted-foreground">Capacity</span>
          <span className="bg-ink text-acid px-2 py-0.5 font-bold">
            {capacity} CKB
          </span>
        </div>
      </div>
    </motion.div>
  );
}
