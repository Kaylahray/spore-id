"use client";

import { useEffect, useRef, useState } from "react";
import { useSigner, ccc } from "@ckb-ccc/connector-react";

export type MintedSpore = {
  id: string;
  imageUrl: string;
  contentType: string;
  sizeBytes: number;
  ckbCapacity: string;
  name: string;
  role: string;
  bio: string;
};

// Binary format: [uint32 LE: metaLen][meta JSON bytes][raw image bytes]
function serializeSporeID(
  meta: { name: string; role: string; bio: string; imageMimeType: string },
  imageBytes: Uint8Array,
): Uint8Array<ArrayBuffer> {
  const metaBytes = new TextEncoder().encode(JSON.stringify(meta));
  const buf = new ArrayBuffer(4 + metaBytes.length + imageBytes.length);
  const result = new Uint8Array(buf);
  new DataView(buf).setUint32(0, metaBytes.length, true);
  result.set(metaBytes, 4);
  result.set(imageBytes, 4 + metaBytes.length);
  return result;
}

function deserializeSporeID(rawBytes: Uint8Array): {
  name: string;
  role: string;
  bio: string;
  imageMimeType: string;
  imageBytes: Uint8Array<ArrayBuffer>;
} {
  const buf = new ArrayBuffer(rawBytes.byteLength);
  new Uint8Array(buf).set(rawBytes);
  const view = new DataView(buf);
  const metaLen = view.getUint32(0, true);
  const all = new Uint8Array(buf);
  const meta = JSON.parse(
    new TextDecoder().decode(all.subarray(4, 4 + metaLen)),
  ) as { name?: string; role?: string; bio?: string; imageMimeType?: string };
  const imgSlice = all.subarray(4 + metaLen);
  const imageBytes = new Uint8Array(new ArrayBuffer(imgSlice.length));
  imageBytes.set(imgSlice);
  return {
    name: meta.name ?? "",
    role: meta.role ?? "",
    bio: meta.bio ?? "",
    imageMimeType: meta.imageMimeType ?? "application/octet-stream",
    imageBytes,
  };
}

export function useSpore() {
  const signer = useSigner();
  const [isMinting, setIsMinting] = useState(false);
  const [isLoadingSpores, setIsLoadingSpores] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "error" | "success";
    message: string;
  }>({ type: "idle", message: "" });
  const [mintedImageUrl, setMintedImageUrl] = useState<string | null>(null);
  const [mintedSpores, setMintedSpores] = useState<MintedSpore[]>([]);
  const mintedImageUrlRef = useRef<string | null>(null);
  const mintedSporesRef = useRef<MintedSpore[]>([]);

  const mintSpore = async (
    file: File,
    name: string,
    role: string,
    bio: string,
  ) => {
    if (!signer) {
      setStatus({
        type: "error",
        message: "Please connect your wallet first.",
      });
      return;
    }

    setIsMinting(true);
    setStatus({ type: "idle", message: "Reading image data..." });

    try {
      if (file.size > 50 * 1024) {
        throw new Error("Avatar must be under 50KB to keep CKB cost low.");
      }

      const arrayBuffer = await file.arrayBuffer();
      const imageBytes = new Uint8Array(
        new ArrayBuffer(arrayBuffer.byteLength),
      );
      imageBytes.set(new Uint8Array(arrayBuffer));

      const content = serializeSporeID(
        { name, role, bio, imageMimeType: file.type },
        imageBytes,
      );
      const contentType = "application/spore-id";

      setStatus({ type: "idle", message: "Drafting Spore transaction..." });

      const { tx: sporeTx, id: sporeId } = await ccc.spore.createSpore({
        signer,
        data: {
          contentType,
          content,
        },
      });

      await sporeTx.completeFeeBy(signer, 2000);

      setStatus({ type: "idle", message: "Waiting for wallet approval..." });
      const txHash = await signer.sendTransaction(sporeTx);

      setStatus({
        type: "idle",
        message: "Transaction sent! Waiting for confirmation...",
      });
      await signer.client.waitTransaction(txHash);

      setStatus({
        type: "success",
        message: `Spore minted! ID: ${sporeId.slice(0, 10)}...`,
      });

      // Use in-memory bytes for instant preview — no chain re-query needed
      const avatarUrl = URL.createObjectURL(
        new Blob([imageBytes], { type: file.type }),
      );
      if (mintedImageUrlRef.current) {
        URL.revokeObjectURL(mintedImageUrlRef.current);
      }
      setMintedImageUrl(avatarUrl);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to mint Spore.",
      });
    } finally {
      setIsMinting(false);
    }
  };

  const clearSpores = () => {
    setMintedSpores((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.imageUrl));
      return [];
    });
  };

  const loadMintedSpores = async (limit = 12) => {
    if (!signer) {
      clearSpores();
      return;
    }

    setIsLoadingSpores(true);
    try {
      const loaded: MintedSpore[] = [];
      for await (const found of ccc.spore.findSporesBySigner({
        signer,
        order: "desc",
        limit,
      })) {
        const storedContentType =
          found.sporeData.contentType || "application/octet-stream";
        const sporeId =
          found.spore.cellOutput.type?.args ?? crypto.randomUUID();

        const ckbCapacity = (
          Number(BigInt(String(found.spore.cellOutput.capacity))) / 100_000_000
        ).toFixed(2);

        if (storedContentType === "application/spore-id") {
          try {
            const rawBytes = Uint8Array.from(
              ccc.bytesFrom(found.sporeData.content),
            );
            const { name, role, bio, imageMimeType, imageBytes } =
              deserializeSporeID(rawBytes);
            const imageUrl = URL.createObjectURL(
              new Blob([imageBytes], { type: imageMimeType }),
            );
            loaded.push({
              id: sporeId,
              imageUrl,
              contentType: imageMimeType,
              sizeBytes: imageBytes.byteLength,
              ckbCapacity,
              name,
              role,
              bio,
            });
          } catch {
            continue;
          }
        } else if (storedContentType === "application/json") {
          // Legacy JSON+base64 spore
          try {
            const bytes = Uint8Array.from(
              ccc.bytesFrom(found.sporeData.content),
            );
            const parsed = JSON.parse(new TextDecoder().decode(bytes)) as {
              name?: string;
              role?: string;
              bio?: string;
              imageMimeType?: string;
              imageData?: string;
            };
            if (!parsed.imageData || !parsed.imageMimeType) continue;
            const binary = atob(parsed.imageData);
            const imgBytes = new Uint8Array(new ArrayBuffer(binary.length));
            for (let i = 0; i < binary.length; i++) {
              imgBytes[i] = binary.charCodeAt(i);
            }
            const imageUrl = URL.createObjectURL(
              new Blob([imgBytes], { type: parsed.imageMimeType }),
            );
            loaded.push({
              id: sporeId,
              imageUrl,
              contentType: parsed.imageMimeType,
              sizeBytes: imgBytes.byteLength,
              ckbCapacity,
              name: parsed.name ?? "",
              role: parsed.role ?? "",
              bio: parsed.bio ?? "",
            });
          } catch {
            continue;
          }
        } else if (storedContentType.startsWith("image/")) {
          // Legacy image-only spore
          const bytes = Uint8Array.from(ccc.bytesFrom(found.sporeData.content));
          const imageUrl = URL.createObjectURL(
            new Blob([bytes], { type: storedContentType }),
          );
          loaded.push({
            id: sporeId,
            imageUrl,
            contentType: storedContentType,
            sizeBytes: bytes.byteLength,
            ckbCapacity,
            name: "",
            role: storedContentType.replace("image/", "").toUpperCase(),
            bio: "",
          });
        }
      }

      setMintedSpores((prev) => {
        prev.forEach((item) => URL.revokeObjectURL(item.imageUrl));
        return loaded;
      });
    } catch (error) {
      console.error("Failed to load minted spores:", error);
      setStatus({ type: "error", message: "Failed to load minted spores." });
    } finally {
      setIsLoadingSpores(false);
    }
  };

  useEffect(() => {
    mintedImageUrlRef.current = mintedImageUrl;
  }, [mintedImageUrl]);

  useEffect(() => {
    mintedSporesRef.current = mintedSpores;
  }, [mintedSpores]);

  useEffect(() => {
    if (!signer) {
      clearSpores();
      if (mintedImageUrlRef.current) {
        URL.revokeObjectURL(mintedImageUrlRef.current);
      }
      setMintedImageUrl(null);
      setStatus({ type: "idle", message: "" });
      return;
    }

    void loadMintedSpores();
  }, [signer]);

  useEffect(() => {
    return () => {
      mintedSporesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.imageUrl),
      );
      if (mintedImageUrlRef.current) {
        URL.revokeObjectURL(mintedImageUrlRef.current);
      }
    };
  }, []);

  const resetSpore = () => {
    if (mintedImageUrl) {
      URL.revokeObjectURL(mintedImageUrl);
    }
    setMintedImageUrl(null);
    setStatus({ type: "idle", message: "" });
  };

  return {
    mintSpore,
    loadMintedSpores,
    isMinting,
    isLoadingSpores,
    status,
    mintedImageUrl,
    mintedSpores,
    resetSpore,
  };
}
