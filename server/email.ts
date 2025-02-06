import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  recipientEmail: string,
  subject: string,
  html: string
) {
  const { data, error } = await resend.emails.send({
    from: 'DevSpace <notifications@devspace.app>',
    to: recipientEmail,
    subject: subject,
    html: html,
  });

  if (error) {
    return { error };
  }

  return { data };
}
