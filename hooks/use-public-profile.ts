"use client";

import { useEffect, useRef } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useQuery } from "@tanstack/react-query";
import { getProfileByUsername } from "@/lib/registry/profile";
import { getUsernameByName } from "@/lib/registry/username";
import { getClient } from "@/lib/registry/client";
import type { StoredProfile, Username } from "@/lib/registry/types";
import type { MintedSpore } from "./use-spore";

export function usePublicProfile(username: string | undefined) {
  const prevAvatarUrlRef = useRef<string | null>(null);
  const query = useQuery({
    queryKey: ["publicProfile", username],
    enabled: Boolean(username),
    queryFn: async (): Promise<{
      profile: StoredProfile | null;
      usernameRecord: Username | null;
      avatarSpore: MintedSpore | null;
    }> => {
      if (!username) {
        return { profile: null, usernameRecord: null, avatarSpore: null };
      }
      const [u, p] = await Promise.all([
        getUsernameByName(username),
        getProfileByUsername(username),
      ]);
      const avatarSpore = p?.avatarSporeId
        ? await getSporeById(p.avatarSporeId)
        : null;
      return { profile: p, usernameRecord: u, avatarSpore };
    },
  });

  const avatarUrl = query.data?.avatarSpore?.imageUrl ?? null;
  useEffect(() => {
    const prev = prevAvatarUrlRef.current;
    if (prev && prev !== avatarUrl) {
      URL.revokeObjectURL(prev);
    }
    prevAvatarUrlRef.current = avatarUrl;
    return () => {
      if (prevAvatarUrlRef.current) {
        URL.revokeObjectURL(prevAvatarUrlRef.current);
        prevAvatarUrlRef.current = null;
      }
    };
  }, [avatarUrl]);

  return {
    profile: query.data?.profile ?? null,
    usernameRecord: query.data?.usernameRecord ?? null,
    avatarSpore: query.data?.avatarSpore ?? null,
    isLoading: query.isLoading || query.isFetching,
    refresh: query.refetch,
  };
}

async function getSporeById(id: string): Promise<MintedSpore | null> {
  const client = getClient();
  const found = await ccc.spore.findSpore(client, id);
  if (!found) return null;

  const storedContentType =
    found.sporeData.contentType || "application/octet-stream";
  const ckbCapacity = (
    Number(BigInt(String(found.spore.cellOutput.capacity))) / 100_000_000
  ).toFixed(2);

  if (storedContentType === "application/spore-id") {
    const rawBytes = Uint8Array.from(ccc.bytesFrom(found.sporeData.content));
    const { name, role, bio, imageMimeType, imageBytes } =
      deserializeSporeID(rawBytes);
    const imageUrl = URL.createObjectURL(
      new Blob([imageBytes], { type: imageMimeType }),
    );
    return {
      id,
      imageUrl,
      contentType: imageMimeType,
      sizeBytes: imageBytes.byteLength,
      ckbCapacity,
      name,
      role,
      bio,
    };
  }

  if (storedContentType === "application/json") {
    const bytes = Uint8Array.from(ccc.bytesFrom(found.sporeData.content));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as {
      name?: string;
      role?: string;
      bio?: string;
      imageMimeType?: string;
      imageData?: string;
    };
    if (!parsed.imageData || !parsed.imageMimeType) return null;
    const binary = atob(parsed.imageData);
    const imgBytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++) {
      imgBytes[i] = binary.charCodeAt(i);
    }
    const imageUrl = URL.createObjectURL(
      new Blob([imgBytes], { type: parsed.imageMimeType }),
    );
    return {
      id,
      imageUrl,
      contentType: parsed.imageMimeType,
      sizeBytes: imgBytes.byteLength,
      ckbCapacity,
      name: parsed.name ?? "",
      role: parsed.role ?? "",
      bio: parsed.bio ?? "",
    };
  }

  if (storedContentType.startsWith("image/")) {
    const bytes = Uint8Array.from(ccc.bytesFrom(found.sporeData.content));
    const imageUrl = URL.createObjectURL(new Blob([bytes], { type: storedContentType }));
    return {
      id,
      imageUrl,
      contentType: storedContentType,
      sizeBytes: bytes.byteLength,
      ckbCapacity,
      name: "",
      role: storedContentType.replace("image/", "").toUpperCase(),
      bio: "",
    };
  }

  return null;
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
