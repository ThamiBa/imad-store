import { google } from "googleapis";

// Ensure these exist in your production environment
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CREDS_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

let sheetsAPI: any = null;

if (CREDS_JSON && SHEET_ID) {
    try {
        const credentials = JSON.parse(CREDS_JSON);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        sheetsAPI = google.sheets({ version: "v4", auth });
        console.log("✅ Google Sheets API initialized successfully");
    } catch (err) {
        console.error("❌ Failed to initialize Google Sheets API:", err);
    }
} else {
    console.warn("⚠️ Google Sheets credentials not found. Sync is disabled.");
}

export interface SheetOrderData {
    id: string;
    customerName: string;
    customerPhone: string;
    address: string;
    city: string;
    itemsSummary: string;
    total: number;
    status: string;
    date: string;
}

/**
 * Appends a new order to the Google Sheet (Non-blocking)
 */
export async function appendOrderToSheet(data: SheetOrderData) {
    if (!sheetsAPI || !SHEET_ID) return;

    // Use setImmediate to ensure it runs completely in the background without blocking the request
    setImmediate(async () => {
        try {
            await sheetsAPI.spreadsheets.values.append({
                spreadsheetId: SHEET_ID,
                range: "Orders!A:I", // Adjust sheet name if necessary
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: [
                        [
                            data.id,
                            data.customerName,
                            data.customerPhone,
                            data.address,
                            data.city,
                            data.itemsSummary,
                            data.total,
                            data.status,
                            data.date,
                        ],
                    ],
                },
            });
            console.log(`✅ Order ${data.id} synced to Google Sheets`);
        } catch (error) {
            console.error(`❌ Failed to sync order ${data.id} to Google Sheets:`, error);
        }
    });
}

/**
 * Updates an order's status in the Google Sheet (Non-blocking)
 */
export async function updateOrderStatusInSheet(orderId: string, newStatus: string) {
    if (!sheetsAPI || !SHEET_ID) return;

    setImmediate(async () => {
        try {
            // 1. Fetch the ID column (Column A)
            const response = await sheetsAPI.spreadsheets.values.get({
                spreadsheetId: SHEET_ID,
                range: "Orders!A:A",
            });

            const rows = response.data.values;
            if (!rows) return;

            // 2. Find the row index (0-based, but sheets are 1-based)
            const rowIndex = rows.findIndex((row: any[]) => row[0] === orderId);
            if (rowIndex === -1) {
                console.warn(`Order ${orderId} not found in Google Sheet`);
                return;
            }

            // Status is in Column H (Index 7) -> cell is H${rowIndex + 1}
            const cellRange = `Orders!H${rowIndex + 1}`;

            // 3. Update the cell
            await sheetsAPI.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: cellRange,
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: [[newStatus]],
                },
            });
            console.log(`✅ Order ${orderId} status updated to ${newStatus} in Google Sheets`);
        } catch (error) {
            console.error(`❌ Failed to update order status ${orderId} in Google Sheets:`, error);
        }
    });
}
