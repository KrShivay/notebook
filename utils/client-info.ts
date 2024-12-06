import { ClientInfo } from '@/types/session';

export async function getClientInfo(): Promise<ClientInfo> {
  try {
    // Get IP and location info
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const { ip: ipAddress } = await ipResponse.json();

    const locationResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    const locationData = await locationResponse.json();

    // Get device info from user agent
    const ua = window.navigator.userAgent;
    const deviceType = /Mobile|Tablet|iPad|iPhone|Android/.test(ua) ? 'mobile' : 'desktop';
    const browser = getBrowserInfo(ua);
    const os = getOSInfo(ua);

    return {
      ipAddress,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      userAgent: ua,
      deviceType,
      browser,
      os,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting client info:', error);
    // Return basic info if API calls fail
    return {
      ipAddress: '',
      latitude: 0,
      longitude: 0,
      userAgent: window.navigator.userAgent,
      deviceType: 'unknown',
      browser: 'unknown',
      os: 'unknown',
      timestamp: new Date().toISOString()
    };
  }
}

function getBrowserInfo(ua: string): string {
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera')) return 'Opera';
  return 'Unknown';
}

function getOSInfo(ua: string): string {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'MacOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS')) return 'iOS';
  return 'Unknown';
}
