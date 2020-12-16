const express = require('express');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const router = express.Router();
const Request = require('request');


const RECAPTCHA_SECRET = process.env.CAPTCHASECRET;



//Rutas
router.get('/', (req, res) => {
    res.render('index.html')
});

router.get('/contact', (req, res) => {
    res.render('contact.html', {success_msg : req.flash('success_msg'), error_msg : req.flash('error_msg')} )
});

router.post('/contact', async (req, res) => {
    
    var recaptcha_url = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${req.body["g-recaptcha-response"]}&remoteip=${req.connection.remoteAddress}`;

    Request(recaptcha_url, function(error, resp, body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            req.flash('error_msg', "Email couldn't be sended, captcha Failed!");
            return res.redirect('/contact')
        }
        const {name, email, message} = req.body;
        
        const nameRegExp = name.search(/[*+?<>^${}()%|[]/g)
        const emailRegExp = email.search(/[*+?<>^${}%()|[]/g)
        const messageRegExp = message.search(/[*+?<>^$%{}()|[]/g)

        if(name.length === 0 || email.length === 0 || message.length === 0 || nameRegExp >= 1 || emailRegExp >= 1 || messageRegExp >= 1 ) {
            req.flash('error_msg', "Something went wrong, check if everything is Ok!");
            return res.redirect('/contact')
        };


        contentHTML = `
                <h1>User Information<h1>
                <ul>
                <li>Username: ${name}</li>
                <li>User Email: ${email}</li>
                </ul>
                <p>${message}</p>
            `;

            const auth = {
                auth: {
                    api_key: process.env.API_KEY,
                    domain: process.env.DOMAIN
                }
            };

            const transporter = nodemailer.createTransport(mg(auth));

            const mailOptions = {
                from: process.env.FROM_EMAIL,
                to: process.env.TO_EMAIL,
                subject: 'Website Contact Form',
                html: contentHTML
            };


            transporter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log('Error Ocurrs');
                } else {
                    console.log('Message Sent!!');
                    req.flash('success_msg', 'Email sended successfully.');
                    res.redirect('/contact')
                }

            });
    });

    
});


module.exports = router;