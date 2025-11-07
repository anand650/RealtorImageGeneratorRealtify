import nodemailer from 'nodemailer'

export function getTransport() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !port || !user || !pass) return null
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function sendInviteEmail(to: string, inviteLink: string, invitedBy?: string, message?: string) {
  const transport = getTransport()
  if (!transport) return { sent: false, reason: 'SMTP_NOT_CONFIGURED' }

  const from = process.env.SMTP_FROM || 'no-reply@realtor-image-generator.com'
  const subject = 'You have been invited to join a team'
  const text = `You have been invited${invitedBy ? ` by ${invitedBy}` : ''} to join the team.

Accept your invitation: ${inviteLink}

${message ? `Message from inviter:\n${message}\n\n` : ''}If you did not expect this, you can ignore this email.`

  await transport.sendMail({ from, to, subject, text })
  return { sent: true }
}





