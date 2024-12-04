'use server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// export const generateSixDigitNumber = () => {
//   const firstDigit = Math.floor(Math.random() * 9) + 1;
//   const otherDigits = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
//   return parseInt(firstDigit.toString() + otherDigits, 10);
// }


// Define the async function normally
export const sendMail = async (recipient, subject, text, htmlText) => {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
  const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
  const SENDER_EMAIL = process.env.GOOGLE_EMAIL;
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  // console.log(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, SENDER_EMAIL);
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  try {
      const accessToken = await oAuth2Client.getAccessToken();
      // console.log(accessToken);
      const transport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              type: 'OAuth2',
              user: SENDER_EMAIL,
              clientId: CLIENT_ID,
              clientSecret: CLIENT_SECRET,
              refreshToken: REFRESH_TOKEN,
              accessToken: accessToken.token,
          },
      });
    //   console.log(SENDER_EMAIL, recipient, subject, text)
    //   console.log(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, SENDER_EMAIL, accessToken.token)
      const mailOptions = {
          from: SENDER_EMAIL,
          to: recipient,
          subject: subject,
          text: text,
          html: htmlText
      };
      const result = await transport.sendMail(mailOptions);
    //   console.log('result', result);
      return { success: true, message: "Email sent successfully." };
  } catch (error) {
      console.error('Error sending email:', error.message);
    return { success: false, message: error.message };
  }
}

