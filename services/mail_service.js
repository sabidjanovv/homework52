const nodemailer = require('nodemailer');
const config = require('config');

class MailService{
    constructor(){
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host:config.get("smtp_host"),
            port: config.get("smtp_port"),
            secure: false, 
            auth: {
                user: config.get("smtp_user"),
                pass: config.get("smtp_password")
            }
        });
    }
    async sendActivationMail(toEmail, link){
        await this.transporter.sendMail({
          from: config.get("smtp_user"),
          to: toEmail,
          subject: "Pulingizni oling",
          text: ``,
          html: `
                <div>
                    <h1>Yutuqni ko'rish uchun link ustiga bosing</h1>
                    <a href="${link}">2 million yutib oling</a>
                </div>
            `,
        });
    }
}

module.exports = new MailService()