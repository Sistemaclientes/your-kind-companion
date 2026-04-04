import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  sendConfirmation: async (email: string, nome: string, token: string) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not found. Skipping email sending.');
      return;
    }

    const domain = process.env.VITE_APP_URL || 'http://localhost:3000';
    const link = `${domain}/confirmar-email?token=${token}`;

    try {
      await resend.emails.send({
        from: 'Trancei SaaS <noreply@trancei.com.br>', // Replace with verified domain if possible
        to: email,
        subject: 'Confirme sua conta - Trancei SaaS',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h1 style="color: #4f46e5; margin-bottom: 20px;">Olá, ${nome}!</h1>
            <p style="font-size: 16px; color: #333; line-height: 1.5;">
              Bem-vindo ao <strong>Trancei SaaS</strong>! Para começar a usar a nossa plataforma, precisamos que você confirme o seu e-mail.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Confirmar conta
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              Se o botão acima não funcionar, copie e cole este link no seu navegador: <br>
              <a href="${link}" style="color: #4f46e5;">${link}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
              Este link expira em 24 horas. Se você não criou esta conta, ignore este e-mail.
            </p>
          </div>
        `
      });
      console.log(`✅ Confirmation email sent to ${email}`);
    } catch (error) {
      console.error(`❌ Error sending email to ${email}:`, error);
    }
  },
  sendPasswordReset: async (email: string, nome: string, token: string) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not found. Skipping password reset email.');
      return;
    }

    const domain = process.env.VITE_APP_URL || 'http://localhost:3000';
    const link = `${domain}/redefinir-senha?token=${token}&email=${email}`;

    try {
      await resend.emails.send({
        from: 'Trancei SaaS <noreply@trancei.com.br>',
        to: email,
        subject: 'Redefina sua senha - Trancei SaaS',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h1 style="color: #4f46e5; margin-bottom: 20px;">Olá, ${nome}!</h1>
            <p style="font-size: 16px; color: #333; line-height: 1.5;">
              Você solicitou a redefinição de sua senha para o <strong>Trancei SaaS</strong>. Clique no botão abaixo para prosseguir:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Redefinir senha
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              Se o botão acima não funcionar, copie e cole este link no seu navegador: <br>
              <a href="${link}" style="color: #4f46e5;">${link}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
              Este link expira em 1 hora. Se você não solicitou esta redefinição, pode ignorar este e-mail com segurança.
            </p>
          </div>
        `
      });
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
      console.error(`❌ Error sending password reset to ${email}:`, error);
    }
  }
};
