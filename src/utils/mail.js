import Mailgen from "mailgen";
import nodemailer from "nodemailer"

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({ // it takes lot of options
        theme: "default",
        product: {
            name: "TaskManager",
            link: "https://taskmanager.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailGenContent) // user who doesnt support the html we use generatePlaintext
    const emailHtml = mailGenerator.generate(options.mailGenContent) // it supports to the html we use generate

    const transporter = nodemailer.createTransport({ // it also take lot of options
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASSWORD
        }
    }) 

    const email = {
        from: "schari443@gmal.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(email);
    } catch (error) {
        console.error("Email service failed silently. Make sure that you have provided your MAILTRAP credentials in the .env file")
        console.error("Error: ", error)
    }
}

const emailVerificationMailGenContent = (username, verificationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to TaskManager! We're excited to have you on board.",
            action: {
                instructions: "To verify your email, please click the button below.",
                button: {
                    color: "#4F46E5",
                    text: "Verify your email",
                    link: verificationURL
                }
            },
            outro: "Need any help or any questions? feel free to reply to this email"
        },
    }
}

const forgotPasswordMailGenContent = (username, passwordResetURL) => {
    return {
        body: {
            name: username,
            intro: "We got a request to reset password of your account",
            action: {
                instructions: "To reset the password Click on the following button",
                button: {
                    color: "#10B981",
                    text: "Reset Password",
                    link: passwordResetURL
                }
            },
            outro: "Need any help or any questions? feel free to reply to this email"
        },
    }
}

//this just creation of mails

export {
    emailVerificationMailGenContent,
    forgotPasswordMailGenContent,
    sendEmail
}