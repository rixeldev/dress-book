import * as Print from "expo-print"
import * as Sharing from "expo-sharing"

export async function exportMeasurementSheet({
  clientName,
  measurements,
}: {
  clientName: string
  measurements: Record<string, Record<string, number | undefined>>
}): Promise<void> {
  const rows = Object.entries(measurements).flatMap(([category, fields]) =>
    Object.entries(fields)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([field, value]) => `<tr><td>${field}</td><td>${value}</td><td>${category}</td></tr>`),
  )

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 24px; color: #1E1719; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          .meta { color: #6E625C; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border-bottom: 1px solid #DED3C3; padding: 8px 4px; text-align: left; }
          th { color: #6E625C; font-size: 12px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <h1>Dress Book Measurement Sheet</h1>
        <p class="meta">${clientName}</p>
        <table>
          <thead><tr><th>Measurement</th><th>Value</th><th>Category</th></tr></thead>
          <tbody>${rows.join("") || "<tr><td colspan='3'>No measurements saved.</td></tr>"}</tbody>
        </table>
      </body>
    </html>
  `

  const { uri } = await Print.printToFileAsync({ html })
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Measurement sheet" })
  }
}
