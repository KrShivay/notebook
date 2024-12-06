export interface ClientInfo {
  ipAddress: string;
  latitude: number;
  longitude: number;
  userAgent: string;
  deviceType: string;
  browser: string;
  os: string;
  timestamp: string;
}

export interface SessionData {
  email: string;
  clientInfo: ClientInfo;
  sessionId: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  sessionData?: SessionData;
}
