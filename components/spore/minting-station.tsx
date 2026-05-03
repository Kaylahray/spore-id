"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  UploadCloud,
  Database,
  ChevronDown,
  Asterisk,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
} from "lucide-react";
import { useSporeContext } from "@/context/app-provider";
import { useWallet } from "@/hooks/use-wallet";

const ROLES = ["BUILDER", "DEVELOPER", "ARTIST", "COMMUNITY"];
const DEFAULT_NAME = "PROFILE PICTURE";
const DEFAULT_BIO = "";

export function MintingStation() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState("BUILDER");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalBytes, setOriginalBytes] = useState(0);
  const [compressedBytes, setCompressedBytes] = useState(0);
  const [compressionNote, setCompressionNote] = useState<string | null>(null);

  const { signer } = useWallet();
  const { mintSpore, isMinting, status, mintedImageUrl, resetSpore } =
    useSporeContext();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setOriginalBytes(file.size);

    const compressed = await compressForProfile(file);
    setSelectedFile(compressed.file);
    setCompressedBytes(compressed.file.size);
    setCompressionNote(compressed.note);
    setPreviewUrl(URL.createObjectURL(compressed.file));
  };

  const handleMint = async () => {
    if (!selectedFile) {
      return;
    }

    await mintSpore(selectedFile, DEFAULT_NAME, role, DEFAULT_BIO);
  };

  const { metaBytes, imageBytes, totalBytes } = useMemo(() => {
    const metaJson = new TextEncoder().encode(
      JSON.stringify({
        name: DEFAULT_NAME,
        role,
        bio: DEFAULT_BIO,
        imageMimeType: selectedFile?.type ?? "",
      }),
    ).length;
    const metaBytes = 4 + metaJson; // 4-byte uint32 header + JSON
    const imageBytes = selectedFile?.size ?? 0;
    return { metaBytes, imageBytes, totalBytes: metaBytes + imageBytes };
  }, [role, selectedFile]);

  return (
    <div className="bg-paper border-[5px] border-ink shadow-brutal-xl p-6 md:p-8 relative">
      <div className="absolute -top-4 -left-4 bg-shock text-paper border-[3px] border-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest font-bold -rotate-3 shadow-brutal">
        № 001 / Mint
      </div>
      <div className="absolute -top-4 -right-4 bg-acid border-[3px] border-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest font-bold rotate-2 shadow-brutal">
        Live ●
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6" />
        <h2 className="font-display text-3xl uppercase">Mint Profile Picture</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 mb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative aspect-square w-full border-[5px] border-ink overflow-hidden group bg-paper"
          type="button"
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
                width={480}
                height={480}
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/70 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-paper font-mono text-xs uppercase tracking-widest">
                  Replace ↻
                </span>
              </div>
              <div className="absolute top-2 right-2 bg-lime border-2 border-ink px-1.5 py-0.5 font-mono text-[9px] uppercase font-bold">
                ON-CHAIN
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center halftone gap-2">
              <UploadCloud className="w-10 h-10" />
              <span className="font-mono text-xs uppercase tracking-widest font-bold">
                Upload profile photo
              </span>
            </div>
          )}
        </button>

        <div className="space-y-4">
          <div>
            <Label>Role</Label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none bg-paper border-[3px] border-ink px-4 py-3 font-mono text-sm uppercase font-bold focus:outline-none focus:bg-acid transition-colors cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
            </div>
          </div>
          {compressionNote ? (
            <div className="border-[3px] border-ink bg-paper px-3 py-2 font-mono text-[10px] uppercase tracking-widest">
              {compressionNote}
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-ink text-paper border-[5px] border-ink p-5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 stripes opacity-20" />
        <div className="flex items-center justify-between mb-3 relative">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-acid">
            <Database className="w-3.5 h-3.5" />
            Storage Cost
          </div>
          <Asterisk className="w-4 h-4 text-shock" />
        </div>
        <div className="flex items-end gap-2 mb-4">
          <span className="font-display text-6xl leading-none">
            {totalBytes > 0 ? `~${totalBytes}` : "~0"}
          </span>
          <span className="font-mono text-sm pb-2">bytes</span>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[10px] uppercase tracking-wider">
          <div className="border border-paper/30 px-2 py-1.5">
            <div className="text-paper/50">Compressed</div>
            <div className="text-acid font-bold">
              {imageBytes > 0 ? `${imageBytes} B` : "—"}
            </div>
          </div>
          <div className="border border-paper/30 px-2 py-1.5">
            <div className="text-paper/50">Metadata</div>
            <div className="text-acid font-bold">{metaBytes} B</div>
          </div>
          <div className="border border-paper/30 px-2 py-1.5">
            <div className="text-paper/50">Original</div>
            <div className="text-acid font-bold">
              {originalBytes > 0 ? `${originalBytes} B` : "—"}
            </div>
          </div>
          <div className="border border-paper/30 px-2 py-1.5">
            <div className="text-paper/50">Savings</div>
            <div className="text-acid font-bold">
              {originalBytes > 0 && compressedBytes > 0
                ? `${Math.max(0, originalBytes - compressedBytes)} B`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {status.message && (
        <div
          className={`mb-6 border-[3px] border-ink px-4 py-3 flex items-start gap-3 font-mono text-xs uppercase tracking-widest ${status.type === "error" ? "bg-shock text-paper" : status.type === "success" ? "bg-lime text-ink" : "bg-paper text-ink"}`}
        >
          {status.type === "error" && (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          {status.type === "success" && (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          {status.type === "idle" && <Info className="w-5 h-5 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      {mintedImageUrl && (
        <div className="mb-6 border-[5px] border-ink p-4 bg-paper">
          <div className="font-mono text-[10px] uppercase tracking-widest bg-ink text-acid px-2 py-1 inline-block mb-3">
            Latest Mint
          </div>
          <div className="aspect-square border-[3px] border-ink overflow-hidden">
            <img
              src={mintedImageUrl}
              alt="Minted spore"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={resetSpore}
            type="button"
            className="mt-3 bg-paper border-[3px] border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-acid transition-colors"
          >
            Clear Mint Preview
          </button>
        </div>
      )}

      <motion.button
        whileHover={{ x: -3, y: -3 }}
        whileTap={{ x: 3, y: 3 }}
        className="w-full bg-shock text-paper border-[5px] border-ink py-5 font-display text-2xl uppercase tracking-tight shadow-brutal-lg flex items-center justify-center gap-3 hover-shake"
        type="button"
        onClick={handleMint}
        disabled={!selectedFile || isMinting || !signer}
      >
        <Sparkles className="w-6 h-6" />
        {isMinting ? "Minting to chain..." : "Mint profile picture"}
        {!isMinting && <ArrowRight className="w-5 h-5" />}
      </motion.button>
      {!signer ? (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Connect wallet from the top bar to mint.
        </p>
      ) : null}
    </div>
  );
}

async function compressForProfile(
  file: File,
): Promise<{ file: File; note: string }> {
  if (!file.type.startsWith("image/")) {
    return { file, note: "Using original file format." };
  }

  const originalKb = file.size / 1024;
  const bitmap = await fileToImage(file);
  const maxSide = 1024;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.floor(bitmap.width * scale));
  const height = Math.max(1, Math.floor(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { file, note: "Compression unavailable; using original image." };
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  const qualityLevels = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5];
  let bestBlob: Blob | null = null;
  for (const quality of qualityLevels) {
    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (!blob) continue;
    if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
    if (blob.size <= 20 * 1024) break;
  }

  if (!bestBlob || bestBlob.size >= file.size) {
    return {
      file,
      note: `Original ${originalKb.toFixed(1)}KB kept (already optimized).`,
    };
  }

  const compressedFile = new File(
    [bestBlob],
    file.name.replace(/\.[^.]+$/, ".jpg"),
    { type: "image/jpeg" },
  );

  return {
    file: compressedFile,
    note: `${originalKb.toFixed(1)}KB compressed to ${(compressedFile.size / 1024).toFixed(1)}KB`,
  };
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image decode failed."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mime, quality);
  });
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1.5">
      {children}
    </label>
  );
}

