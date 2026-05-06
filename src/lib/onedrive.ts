/**
 * Microsoft Graph API client for OneDrive uploads from the public website.
 *
 * Uses client-credentials (app-only) flow to upload public-website intake
 * photos into a structured folder hierarchy on the configured user's OneDrive:
 *
 *   {ONEDRIVE_ROOT_FOLDER}/website-uploads/{kind}/{ref}/
 *
 * Re-uses the same MS Graph app-registration as the reparatie-paneel:
 * MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET,
 * ONEDRIVE_USER_EMAIL, ONEDRIVE_ROOT_FOLDER.
 *
 * Returns a sharing URL the website can show as `<img src>` and that we
 * pass through as metadata to the reparatie-paneel intake.
 */

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.accessToken;
  }

  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('OneDrive niet geconfigureerd (env-vars ontbreken).');
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Microsoft token failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.accessToken;
}

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

function userDrivePath(): string {
  const email = process.env.ONEDRIVE_USER_EMAIL;
  if (!email) throw new Error('ONEDRIVE_USER_EMAIL niet ingesteld.');
  return `${GRAPH_BASE}/users/${email}/drive`;
}

function sanitizeName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

export interface OneDriveUploadResult {
  /** Direct/preview URL voor browsers (een sharing-link of fallback). */
  url: string;
  /** OneDrive web-view URL. */
  webUrl: string;
  /** Volledige pad in de drive. */
  drivePath: string;
  /** OneDrive item id. */
  itemId: string;
}

/** Bouwt het pad voor uploads vanuit de publieke website.
 *
 *   {root}/website-uploads/{kind}/{ref}/
 *
 * Bv. `Stalling/website-uploads/repair-intake/2026-05-12-A1B2C3/` */
export function buildPublicUploadFolderPath(kind: string, ref: string): string {
  const root = process.env.ONEDRIVE_ROOT_FOLDER || 'Stalling';
  return `${root}/website-uploads/${sanitizeName(kind)}/${sanitizeName(ref)}`;
}

async function ensureFolder(folderPath: string): Promise<void> {
  const token = await getAccessToken();

  const checkRes = await fetch(
    `${userDrivePath()}/root:/${encodeURIComponent(folderPath).replace(/%2F/g, '/')}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (checkRes.ok) return;

  const segments = folderPath.split('/');
  let parentPath = '';

  for (const segment of segments) {
    const currentPath = parentPath ? `${parentPath}/${segment}` : segment;
    const createRes = await fetch(
      parentPath
        ? `${userDrivePath()}/root:/${encodeURIComponent(parentPath).replace(/%2F/g, '/')}:/children`
        : `${userDrivePath()}/root/children`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: segment,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'replace',
        }),
      },
    );

    if (!createRes.ok && createRes.status !== 409) {
      const text = await createRes.text();
      throw new Error(`Create folder "${currentPath}" failed: ${createRes.status} ${text}`);
    }
    parentPath = currentPath;
  }
}

/** Upload a single file to OneDrive (≤ 10 MB — we cap aan client-side). */
export async function uploadPublicFile(
  folderPath: string,
  fileName: string,
  fileBuffer: Uint8Array,
  contentType: string,
): Promise<OneDriveUploadResult> {
  const token = await getAccessToken();
  const safeName = sanitizeName(fileName);
  const fullPath = `${folderPath}/${safeName}`;

  await ensureFolder(folderPath);

  // ≤ 4 MB simple upload; > 4 MB session upload
  let itemData: { id: string; webUrl: string; '@microsoft.graph.downloadUrl'?: string };

  if (fileBuffer.length <= 4 * 1024 * 1024) {
    const res = await fetch(
      `${userDrivePath()}/root:/${encodeURIComponent(fullPath).replace(/%2F/g, '/')}:/content`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': contentType,
        },
        body: new Uint8Array(fileBuffer),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed: ${res.status} ${text}`);
    }
    itemData = await res.json();
  } else {
    const sessionRes = await fetch(
      `${userDrivePath()}/root:/${encodeURIComponent(fullPath).replace(/%2F/g, '/')}:/createUploadSession`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: { '@microsoft.graph.conflictBehavior': 'rename', name: safeName },
        }),
      },
    );
    if (!sessionRes.ok) {
      const text = await sessionRes.text();
      throw new Error(`Upload session failed: ${sessionRes.status} ${text}`);
    }
    const { uploadUrl } = await sessionRes.json();

    const chunkSize = 4 * 1024 * 1024;
    const totalSize = fileBuffer.length;
    let offset = 0;
    let lastChunkData: typeof itemData | null = null;

    while (offset < totalSize) {
      const end = Math.min(offset + chunkSize, totalSize);
      const chunk = fileBuffer.subarray(offset, end);

      const chunkRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Range': `bytes ${offset}-${end - 1}/${totalSize}`,
          'Content-Length': String(chunk.length),
        },
        body: new Uint8Array(chunk),
      });

      if (chunkRes.status === 200 || chunkRes.status === 201) {
        lastChunkData = await chunkRes.json();
      } else if (chunkRes.status !== 202) {
        const text = await chunkRes.text();
        throw new Error(`Chunk upload failed: ${chunkRes.status} ${text}`);
      }
      offset = end;
    }
    if (!lastChunkData) throw new Error('Upload completed without final response.');
    itemData = lastChunkData;
  }

  // Maak een sharing-link zodat de URL ook zichtbaar is in de admin/website
  // zonder login.
  let publicUrl = itemData['@microsoft.graph.downloadUrl'] || itemData.webUrl;
  try {
    const shareRes = await fetch(
      `${GRAPH_BASE}/users/${process.env.ONEDRIVE_USER_EMAIL}/drive/items/${itemData.id}/createLink`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'view', scope: 'anonymous' }),
      },
    );
    if (shareRes.ok) {
      const shareData = await shareRes.json();
      const shareUrl = shareData.link?.webUrl;
      if (shareUrl) {
        const encodedUrl = Buffer.from(shareUrl).toString('base64')
          .replace(/=+$/, '')
          .replace(/\//g, '_')
          .replace(/\+/g, '-');
        const directUrl = `${GRAPH_BASE}/shares/u!${encodedUrl}/driveItem/content`;
        const contentRes = await fetch(directUrl, {
          headers: { Authorization: `Bearer ${token}` },
          redirect: 'manual',
        });
        if (contentRes.status === 302) {
          publicUrl = contentRes.headers.get('location') || publicUrl;
        } else {
          publicUrl = shareUrl.replace(/\?/, '?download=1&');
        }
      }
    }
  } catch (err) {
    console.warn('[onedrive] sharing-link skipped:', err);
  }

  return {
    url: publicUrl,
    webUrl: itemData.webUrl,
    drivePath: fullPath,
    itemId: itemData.id,
  };
}

export function isOneDriveConfigured(): boolean {
  return Boolean(
    process.env.MICROSOFT_TENANT_ID &&
    process.env.MICROSOFT_CLIENT_ID &&
    process.env.MICROSOFT_CLIENT_SECRET &&
    process.env.ONEDRIVE_USER_EMAIL,
  );
}
