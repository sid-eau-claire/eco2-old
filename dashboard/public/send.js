const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
        user: 'temp6666temp@gmail.com',
        pass: 'xxxxxxx'
    }
});

let mailOptions = {
    from: 'temp6666temp@gmail.com',
    to: 'temp8888temp@gmail.com',
    subject: 'Invitation to Register',
    html: '...Your HTML content here...'
};

transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
