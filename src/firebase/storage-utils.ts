import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/client";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getExtension(file: File): string {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop()! : "jpg";
}

export async function uploadEntidadImage(
  file: File,
  entidadId: string,
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato no soportado. Usa JPG, PNG o WebP.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("La imagen no puede superar los 2 MB.");
  }

  const ext = getExtension(file);
  const storageRef = ref(storage, `img/entidades/${entidadId}.${ext}`);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
    cacheControl: "public, max-age=31536000",
  });

  return getDownloadURL(storageRef);
}
