// Sends email through Resend (https://resend.com) when RESEND_API_KEY is set.
// Without a key the message is only written to the server log (fine for local play and tests).
export async function sendMail({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM || 'Syndicate City <onboarding@resend.dev>'
  if (!key) {
    console.log(`[mail not sent: no RESEND_API_KEY] to=${to} subject=${subject}\n${text}`)
    return { sent: false }
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html, text }),
  })
  if (!r.ok) console.error('Resend error', r.status, await r.text().catch(() => ''))
  return { sent: r.ok }
}
