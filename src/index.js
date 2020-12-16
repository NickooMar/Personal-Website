const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Configuración
app.set('port', PORT)
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs").use(express.static(__dirname+"/public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(session({
    secret: process.env.SECRET,
    cookie: { maxAge: 6000 },
    resave: true,
    saveUninitialized: true,
}));
app.use(flash());

//Rutas
app.use(require('./routes/index'));

app.use(function(req, res, next){
    res.status(404).render('404page.html')
})

//Variables globales

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next()
});


//Archivos estaticos
app.use(express.static(path.join(__dirname + '/public')));



//Listen
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});

