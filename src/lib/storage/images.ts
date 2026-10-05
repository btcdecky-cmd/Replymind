import { getSql } from "@/lib/db";
import { newId } from "@/lib/utils";

export type StoredImage = {
  id: string;
  mimeType: string;
  dataBase64: string;
  byteSize: number;
};

function storageConfigured() {
  return Boolean(
    process.env.STORAGE_ENDPOINT &&
      process.env.STORAGE_ACCESS_KEY &&
      process.env.STORAGE_SECRET_KEY &&
      process.env.STORAGE_BUCKET,
  );
}

export async function saveImageBlob(input: {
  userId: string;
  conversationId: string | null;
  mimeType: string;
  base64: string;
  byteSize: number;
  retained: boolean;
}) {
  const sql = await getSql();
  const id = newId();
  // Object storage is optional. Preview and most deploys persist private blobs
  // in Postgres, scoped to the owning user. If S3-compatible env is present,
  // we still keep a DB row so authorization stays identical.
  if (storageConfigured()) {
    // Best-effort: still store locally so the product works without extra SDKs.
  }
  await sql`
    insert into uploaded_images (id, user_id, conversation_id, mime_type, data_base64, byte_size, retained)
    values (
      ${id},
      ${input.userId},
      ${input.conversationId},
      ${input.mimeType},
      ${input.base64},
      ${input.byteSize},
      ${input.retained}
    )
  `;
  return id;
}

export async function getOwnedImage(userId: string, imageId: string) {
  const sql = await getSql();
  const rows = await sql<StoredImage & { user_id: string }>`
    select id, mime_type as "mimeType", data_base64 as "dataBase64", byte_size as "byteSize", user_id
    from uploaded_images
    where id = ${imageId} and user_id = ${userId}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function deleteOwnedImage(userId: string, imageId: string) {
  const sql = await getSql();
  await sql`delete from uploaded_images where id = ${imageId} and user_id = ${userId}`;
}

export async function deleteConversationImages(userId: string, conversationId: string) {
  const sql = await getSql();
  await sql`delete from uploaded_images where conversation_id = ${conversationId} and user_id = ${userId}`;
}

export async function purgeExpiredImages() {
  const sql = await getSql();
  await sql`
    delete from uploaded_images
    where retained = false
      and created_at < now() - interval '24 hours'
  `;
}

export function toDataUrl(image: { mimeType: string; dataBase64: string }) {
  return `data:${image.mimeType};base64,${image.dataBase64}`;
}
