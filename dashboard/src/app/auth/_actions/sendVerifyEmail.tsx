
'use server'
import { sendMail } from '@/lib/gmailService'


export const sendVerifyEmail = async (email: string, token: string) => {
  try {
    const verificationURL = `${process.env.NEXT_PUBLIC_URL}/verify-email?email=${email}&token=${token}`;
    const htmlText = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #0056b3;">Verify Your Email Address</h2>
        <p>Thank you for registering with us. Please confirm your email address by entering the following verification code:</p>
        <p style="background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 24px; margin: 20px 0;"><strong>${token}</strong></p>
        <p>Alternatively, you can click the button below to automatically verify your email:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${verificationURL}" style="background-color: #0056b3; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </div>
        <p>If you did not request this verification, please ignore this email.</p>
      </div>
    `;
    const result = await sendMail(email, 'Verify Your Email Address', `Your verification code is ${token}`, htmlText);
    if (result.success) {
      console.log('Email sent successfully:', result.message);
    } else {
      console.error('Failed to send email:', result.message);
    }
  } catch (error: any) {
    console.error('Error invoking server action:', error.message);
  }
}


