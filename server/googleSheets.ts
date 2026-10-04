import { google } from 'googleapis';
import { adminDb, recordAuditLog, encryptSecret, decryptSecret } from './firestoreService';

/**
 * Creates a Google OAuth client using environment client credentials.
 */
export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Dev URL or current production callback url
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://ais-pre-krsycwmqapi6ysboi4snj6-880945546493.asia-southeast1.run.app/api/integrations/google-sheets/callback';

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Securely stores Google credentials (access + refresh tokens) encrypted inside the tenant configuration.
 */
export async function saveGoogleTokens(companyId: string, tokens: { access_token?: string | null; refresh_token?: string | null; expiry_date?: number | null }) {
  const encryptedAccessToken = tokens.access_token ? encryptSecret(tokens.access_token) : null;
  const encryptedRefreshToken = tokens.refresh_token ? encryptSecret(tokens.refresh_token) : null;

  const compRef = adminDb.collection('companies').doc(companyId);
  await compRef.collection('integrations').doc('google_sheets').set({
    accessToken: encryptedAccessToken,
    refreshToken: encryptedRefreshToken,
    expiryDate: tokens.expiry_date || null,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  await recordAuditLog(companyId, 'SYSTEM_GOOGLE_SHEETS', 'GOOGLE_SHEETS_CONNECT', 'Connected Google Sheets OAuth account successfully');
}

/**
 * Loads and decrypts Google credentials, refreshing the access token if expired.
 */
export async function getAuthorizedClient(companyId: string) {
  const compRef = adminDb.collection('companies').doc(companyId);
  const doc = await compRef.collection('integrations').doc('google_sheets').get();
  
  if (!doc.exists) {
    throw new Error('Google Sheets is not connected for this company.');
  }

  const data = doc.data()!;
  if (!data.accessToken || !data.refreshToken) {
    throw new Error('Incomplete Google Sheets OAuth credentials.');
  }

  const accessToken = decryptSecret(data.accessToken);
  const refreshToken = decryptSecret(data.refreshToken);

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: data.expiryDate || 0,
  });

  // Refresh token automatically if expired
  oauth2Client.on('tokens', async (newTokens) => {
    const updateData: any = {};
    if (newTokens.access_token) {
      updateData.accessToken = encryptSecret(newTokens.access_token);
    }
    if (newTokens.expiry_date) {
      updateData.expiryDate = newTokens.expiry_date;
    }
    if (Object.keys(updateData).length > 0) {
      await compRef.collection('integrations').doc('google_sheets').update(updateData);
    }
  });

  return oauth2Client;
}

/**
 * Lists the spreadsheets accessible inside Google Drive.
 */
export async function listGoogleSpreadsheets(companyId: string) {
  const auth = await getAuthorizedClient(companyId);
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    fields: 'files(id, name, modifiedTime)',
    pageSize: 50,
  });

  await recordAuditLog(companyId, 'SYSTEM_GOOGLE_SHEETS', 'GOOGLE_SHEETS_LIST', 'Listed Google Sheets spreadsheets');
  return res.data.files || [];
}

/**
 * Lists worksheets/tabs inside a single spreadsheet.
 */
export async function listWorksheets(companyId: string, spreadsheetId: string) {
  const auth = await getAuthorizedClient(companyId);
  const sheets = google.sheets({ version: 'v4', auth });

  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  const tabNames = (metadata.data.sheets || []).map(s => s.properties?.title).filter(Boolean) as string[];
  return tabNames;
}

/**
 * Reads a specific worksheet tab and range securely.
 */
export async function readSheetRange(companyId: string, spreadsheetId: string, range: string) {
  const auth = await getAuthorizedClient(companyId);
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  await recordAuditLog(companyId, 'SYSTEM_GOOGLE_SHEETS', 'GOOGLE_SHEETS_SYNC', `Synced range ${range} from spreadsheet ${spreadsheetId}`);
  return res.data.values || [];
}

/**
 * Disconnects the Google Sheets integration securely.
 */
export async function disconnectGoogleSheets(companyId: string) {
  const compRef = adminDb.collection('companies').doc(companyId);
  await compRef.collection('integrations').doc('google_sheets').delete();
  await recordAuditLog(companyId, 'SYSTEM_GOOGLE_SHEETS', 'GOOGLE_SHEETS_DISCONNECT', 'Disconnected Google Sheets OAuth account');
}
