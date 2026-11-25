import QRCode from 'qrcode';

export const runtime = 'nodejs';

// Serves the QR image used in emails (mail clients block data: URIs). The QR encodes /pass/<id>.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id.replace(/\.png$/i, '').toUpperCase();
  if (!/^CB1-[A-Z0-9]{4}$/.test(id)) return new Response('Bad id', { status: 400 });
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin).replace(/\/$/, '');
  const buf = await QRCode.toBuffer(`${base}/pass/${id}`, { margin: 2, width: 480, color: { dark: '#070B10', light: '#FFFFFF' } });
  return new Response(new Uint8Array(buf), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400, immutable' } });
}
