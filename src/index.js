/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const EMAIL_VALIDATION_API = "https://api.leadmagic.io/email-validate"
const API_KEY = "NrAsFMLwnNegbfZmUKco5EHJG5FK2Xim"

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const { pathname } = new URL(request.url)

  if (pathname === '/') {
    return new Response(`
      <h1>Email Validator</h1>
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file"><br><br>
        <input type="submit">
      </form>
    `, { headers: { 'Content-Type': 'text/html' } })
  } else if (pathname === '/upload' && request.method === 'POST') {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || file.size === 0) {
      return new Response("No selected file", { status: 400 })
    }

    try {
      const csvContent = await file.text()

      // Parse CSV content to get headers and rows
      const { headers, rows } = parseCSV(csvContent)

      // Find the column index for the 'Email' header
      const emailColumnIndex = headers.findIndex(header => header.toLowerCase().includes('email'))

      if (emailColumnIndex === -1) {
        return new Response("Email column not found", { status: 400 })
      }

      // Extract emails from the specified column
      const emails = rows.map(row => row[emailColumnIndex]).filter(email => email)

      // Validate emails
      const emailStatuses = await validateEmails(emails)

      // Create CSV content
      const csv = emailStatuses.map(status => `${status.email},${status.status}`).join('\n')
      const resultBlob = new Blob([csv], { type: 'text/csv' })

      // Respond with HTML showing validation completion and link to download
      return new Response(`
        <h1>Email Validator</h1>
        <p>Validation complete. <a href="/download">Download the validated emails CSV</a></p>
      `, { headers: { 'Content-Type': 'text/html' } })
    } catch (error) {
      console.error('Error processing file:', error)
      return new Response('Error processing file', { status: 500 })
    }
  } else if (pathname === '/download') {
    // Respond with the CSV blob for download
    return new Response(resultBlob, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="validated_emails.csv"'
      }
    })
  } else {
    return new Response('Not Found', { status: 404 })
  }
}

function parseCSV(csvContent) {
  // Split CSV content into lines
  const lines = csvContent.trim().split('\n')

  // Extract headers from the first line
  const headers = lines[0].split(',')

  // Extract rows (excluding the header)
  const rows = lines.slice(1).map(line => line.split(','))

  return { headers, rows }
}

async function validateEmails(emails) {
  const emailStatuses = []

  for (const email of emails) {
    try {
      const response = await fetch(EMAIL_VALIDATION_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({ email })
      })

      const result = await response.json()
      emailStatuses.push({ email, status: result.email_status || 'unknown' })
    } catch (error) {
      emailStatuses.push({ email, status: 'error' })
    }
  }

  return emailStatuses
}
export { handleRequest }