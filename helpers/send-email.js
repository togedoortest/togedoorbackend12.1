const nodemailer = require('nodemailer');
// const config = require('config.json');
const config = require('../config.json');
module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    const transporter = nodemailer.createTransport(config.smtpOptions);

    // console.log('to  : ' + to);

    await transporter.sendMail({ from, to, subject, html });
}
