import 'server-only';

import { v2 as cloudinary } from 'cloudinary';

let configurado = false;

function configurar(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return false;
  if (!configurado) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configurado = true;
  }
  return true;
}

export function almacenamientoDisponible(): boolean {
  return configurar();
}

/**
 * Sube una imagen a Cloudinary y devuelve su URL pública.
 * Devuelve null si no hay archivo, si el almacenamiento no está configurado
 * o si el archivo no es una imagen válida.
 */
export async function subirImagen(
  archivo: FormDataEntryValue | null,
  carpeta: string,
): Promise<string | null> {
  if (!archivo || typeof archivo === 'string') return null;
  if (archivo.size === 0) return null;
  if (!archivo.type.startsWith('image/')) return null;
  if (!configurar()) {
    console.warn(
      `[upload] Cloudinary no está configurado: se omitió la subida a "${carpeta}".`,
    );
    return null;
  }

  const bytes = Buffer.from(await archivo.arrayBuffer());
  const resultado = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: `macarena-estilista/${carpeta}`, resource_type: 'image' }, (error, result) => {
        if (error || !result) reject(error ?? new Error('Error al subir la imagen'));
        else resolve(result as { secure_url: string });
      })
      .end(bytes);
  });

  return resultado.secure_url;
}

/** Elimina una imagen de Cloudinary a partir de su URL (si el almacenamiento está activo). */
export async function eliminarImagen(url: string | null | undefined): Promise<void> {
  if (!url || !configurar() || !url.includes('res.cloudinary.com')) return;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
  if (!match) return;
  try {
    await cloudinary.uploader.destroy(match[1]);
  } catch {
    // Silencioso: la limpieza de imágenes no debe romper el flujo principal.
  }
}
