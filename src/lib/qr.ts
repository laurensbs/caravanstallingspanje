import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: { dark: '#1C2B3A', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });
}

export function generateCheckInUrl(contractId: number | string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://caravanstalling-spanje.com';
  return `${baseUrl}/api/staff/checkin/${contractId}`;
}

export async function generateContractQR(contractId: number | string): Promise<string> {
  const url = generateCheckInUrl(contractId);
  return generateQRCode(url);
}
