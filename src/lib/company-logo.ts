const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const LOGO_SIZE = 800;
const ALLOWED_LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateCompanyLogo(file: File) {
  if (!ALLOWED_LOGO_TYPES.has(file.type)) return "Use uma imagem JPG, PNG ou WebP.";
  if (file.size > MAX_LOGO_BYTES) return "A imagem deve ter no máximo 2 MB.";
  return null;
}

export async function optimizeCompanyLogo(file: File): Promise<Blob> {
  const error = validateCompanyLogo(file);
  if (error) throw new Error(error);

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = LOGO_SIZE;
  canvas.height = LOGO_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar a imagem.");

  const scale = Math.min(LOGO_SIZE / bitmap.width, LOGO_SIZE / bitmap.height, 1);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  context.drawImage(bitmap, (LOGO_SIZE - width) / 2, (LOGO_SIZE - height) / 2, width, height);
  bitmap.close();

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Não foi possível preparar a imagem.")), "image/webp", 0.9);
  });
}