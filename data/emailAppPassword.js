import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const appPassword = process.env.APP_PASSWORD;

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ucreditdev@gmail.com',
    pass: appPassword,
  },
});

// send mail with defined transport object
transporter.sendMail({
  from: 'ucreditdev@gmail.com', // sender address
  to: 'adeo1@jhu.edu', // list of receivers
  subject: `Invitation to Review uCredit Plan from uCredit`, // Subject line
  html: `<div><p>Hello Akhil,</p><p>You have recieved a request to review uCredit's uCredit Plan:</p><p>Please click the following link to accept.</p><p>https://ucredit.me/reviewer/010000101</p><p>Best wishes,</p><p>uCredit</p</div>`, // html body
});
