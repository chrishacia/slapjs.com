const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

dotenv.config();

module.exports = (data) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: data.to, // Change to your recipient
    from: process.env.FROM_EMAIL, // Change to your verified sender
    subject: data.mail_subject,
    text: data.mail_plain_text,
    html: data.mail_html,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
    })
    .catch((error) => {
      error.response.body.errors.map((a) => console.log(a));
    });
};
