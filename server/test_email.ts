import Mailjet from 'node-mailjet';
import dotenv from 'dotenv';

dotenv.config();

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY!,
  process.env.MAILJET_SECRET_KEY!
);

async function test() {
  try {
    const res = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAIL_FROM,
            Name: 'Kairo'
          },
          To: [
            {
              Email: 'akinpeluoluwafemidavid@gmail.com',
              Name: 'Test'
            }
          ],
          Subject: 'Reset your Kairo password',
          HTMLPart: '<h1>Test</h1>'
        }
      ]
    });
    console.log('Success:', res.body);
  } catch (err: any) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
}

test();
