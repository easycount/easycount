var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var http = require('http');
http.post = require('http-post');

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var jwtCheck = require('express-jwt');

var modeloUsuario = require('./models/Usuario');
require('./passport')(passport);
var config = require('./config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('superSecret', config.session.secret); // secret variable

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
// Configuramos el uso de las sesiones con express-session
app.use(session({
    secret: config.session.secret,
    resave: true,
    saveUninitialized: true
}))

// Configuración de Passport. Lo inicializamos
// y le indicamos que Passport maneje la Sesión
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var routes = require('./routes/pages');
var usuarios = require('./routes/usuarios');
var productos = require('./routes/productos');
var empresas = require('./routes/empresas');
var listas = require('./routes/listas');
var promociones = require('./routes/promociones');
var establecimientos = require('./routes/establecimientos');
var tickets = require('./routes/tickets');
var dataempresas = require('./routes/dataempresas');
var datausuarios = require('./routes/datausuarios');
var infosistema = require('./routes/infosistema');
var openApi = require('./routes/openAPI');

//require('./routes/mailer');
//var nodemailer = require('nodemailer');

//conexion a bbdd
mongoose.connect('mongodb://easycounttest:123456@ds033145.mongolab.com:33145/easycountdata', function(err) {
//mongoose.connect('mongodb://localhost/test', function(err) {
    if(err) {
        console.log('Connection error', err);
    } else {
        console.log('Connection successful');
    }
});


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Origin", "http://localhost:63342");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

app.use("/styles", express.static(__dirname + '/styles'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/includes", express.static(__dirname + '/includes'));
app.use("/images", express.static(__dirname + '/images'));
//add this so the browser can GET the bower files
app.use("/admin-panel", express.static(__dirname + '/admin-panel'));
app.use("/admin-panel/styles", express.static(__dirname + '/admin-panel/styles'));
app.use("/user-panel", express.static(__dirname + '/user-panel'));
app.use("/user-panel/styles", express.static(__dirname + '/user-panel/styles'));
app.use("/business-panel", express.static(__dirname + '/business-panel'));
app.use("/business-panel/styles", express.static(__dirname + '/business-panel/styles'));

//Funcion que comprueba, cada vez que se entre a una dirección que contenga /api, que existe un token correcto

/////////////////////////////////////////////////SISTEMA DE TOKENS///////////////////////////////////////////////////////////////////////////////

/*
 app.use('/api', function(){
 return function (req, res, next) {
 //Registramos la entrada a la aplicación
 var devuelve;
 var fecha = new Date();
 console.log("Actualizando llamadas api");
 http.post({
 host: config.direccion.host,
 port: config.direccion.port,
 path: '/api/infosistema/llamadaApi'
 }, {suma: 1, mes: fecha.getMonth(), anyo: fecha.getFullYear()}, function(response){
 response.on('data', function(d) {
 devuelve = d;
 console.log("Devuelve");
 return next();
 });
 });
 };
 });
 */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Funcion que comprueba si el token existente actual contiene los scopes (ambitos o permisos en los que puede trabajar) que se le indiquen
//por parámetro


app.use('/api', function(req, res, next){
        //Registramos la entrada a la aplicación
        var devuelve;
        var fecha = new Date();

        var cookie = req.cookies.tokenAPI;
        var path = '/apiInfo/infosistema/llamadaApi';

        if(cookie==null || cookie ==""){
            cookie = config.admin.cookie;
            path = '/apiInfo/infosistema/llamadaApiFalladas';
        }

        http.post({
            headers: {
                authorization: "Bearer "+cookie
            },
            host: config.direccion.host,
            port: config.direccion.port,
            path: path,
        }, {suma: 1, mes: fecha.getMonth(), anyo: fecha.getFullYear()}, function(response){
            response.on('data', function(d) {
                devuelve = d;
                return next();
            });
        });}
      /*,jwtCheck({
     secret: config.session.secret,
     userProperty: 'tokenPayload'
     })*/

);


function compruebaScopes(scopes) {
    return function (req, res, next) {
        var tokenScopes = req.tokenPayload.scopes;
        var has_scopes = scopes.every(function (scope) {
            return tokenScopes.indexOf(scope) > -1;
        });

        if (!has_scopes) {
            res.send("El permiso no ha sido encontrado").status(401);
        }else{
            next();
        }
    };
}

//Definen las rutas
app.use('/', routes);
app.use('/api/usuarios', usuarios);
app.use('/api/productos', productos);
app.use('/api/empresas', empresas);
app.use('/api/listas', listas);
app.use('/api/promociones', promociones);
app.use('/api/establecimientos', establecimientos);
app.use('/api/tickets', tickets);
app.use('/api/dataempresas',dataempresas);
app.use('/api/datausuarios',datausuarios);
app.use('/apiInfo/infosistema',infosistema);
app.use('/openapi/', openApi);
//

var nodemailer = require('nodemailer');


///////////////////////////////////////////////////////////////////////////Función de envio de correo
app.post('/send', function(req, res){
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: config.gmail.user,
            pass: config.gmail.pass
        },
        logger: true, // log to console
        debug: true // include SMTP traffic in the logs
    }, {
        // default message fields

        // sender info
        from: 'Usuario EasyCount <sender@example.com>',
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'Usuario '+ req.body.q1 +  ' <' + req.body.q2+'>', // sender address
        to: 'easycountofficial@gmail.com', // list of receivers
        subject: 'Contacto EasyCount', // Subject line
        text: 'Hello world 🐴', // plaintext body
        html: '<h1>Mensaje de contacto de '+ req.body.q1 +'</h1><h2>Mail: '+ req.body.q2 +'</h2><b>'+req.body.q3+'</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Mensaje enviado: ' + info.response);
    });
});


///////////////////////////////////////////////////////////////Rutas de PASSPORT (Login, registro, sesiones)
//Ruta para deslogearse
app.get('/logout', function(req,res){
    req.logout();
    res.clearCookie('tokenAPI');
    res.redirect('/');
});

////////////////////LOCAL
/*
 app.post('/registerLocal', passport.authenticate('local-signup', {
 successRedirect : '/user-panel/index', // redirect to the secure profile section
 failureRedirect : '/login#/toregister', // redirect back to the signup page if there is an error
 failureFlash : true // allow flash messages
 }));
 */

app.post('/registerLocal', function(req, res, next) {
    passport.authenticate('local-signup', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/registro');
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }

            var token = crearToken(req.user);
            res.cookie('tokenAPI', token, { maxAge: 24*60*60*1000 });
            return res.redirect('/user-panel/index');
        });
    })(req, res, next);
});

// process the login form
app.post('/loginLocal', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }

            //Registramos la entrada a la aplicación
            var devuelve;

            http.post({
                host: config.direccion.host,
                port: config.direccion.port,
                path: '/apiInfo/infosistema/entradaAlSistema'
            }, {id_usuario: user._id.toString()}, function(response){
                response.on('data', function(d) {
                });
            });

            var token = crearToken(user);
            res.cookie('tokenAPI', token, { maxAge: 24*60*60*1000 });
            res.redirect('/user-panel/index');
        });
    })(req, res, next);
});

// Funcion ejemplo de comprobacion de permisos del usuario para acceder a la funcion
app.use('/api/hola', /*compruebaScopes(['simple']),*/ function(req, res, next){
    res.send("EYYYYYYYYYYYY!");
});

app.get('/pruebaHTTP', function(req, res, next){
    http.get({
        host: config.direccion.host,
        port: config.direccion.port,
        path: '/api/hola'
    },function(response){
        var devuelve;
        response.on('data', function(d) {
            devuelve = d;
        });
    });
});

// Funcion ejemplo de comprobacion de permisos del usuario para acceder a la funcion
app.post('/api/holaPost', /*compruebaScopes(['simple']),*/ function(req, res, next){
    res.send("EYYYYYYYYYYYY!");
});

app.post('/pruebaHTTPpost', function(req, res, next){
    var devuelve;
    http.post({
        host: config.direccion.host,
        port: config.direccion.port,
        path: '/api/holaPost'
    }, {prueba: 'funciona'}, function(response){
        response.on('data', function(d) {
            devuelve = d;
        });
    });
});

//Argumentos: email, password (no encriptada)
app.post('/checkLogin', function(req, res, next) {
    if(req.body.email != null && req.body.email != "") {
        modeloUsuario.findOne({'email': req.body.email}, function (err, user) {
            // Si ha habido errores, devuelve el error
            if (err)
                return false;
            if (user != null) {
                // Si no hay usuario, devuelve el mensaje de que no existe
                if (!user)
                    res.send("El usuario introducido no existe.");

                if (req.body.password) {
                    // if the user is found but the password is wrong
                    if (!user.validPassword(req.body.password))
                        res.send("Contraseña incorrecta");
                    else {
                        //Registramos la entrada a la aplicación
                        var devuelve;
                        http.post({
                            host: config.direccion.host,
                            port: config.direccion.port,
                            path: '/apiInfo/infosistema/entradaAlSistema'
                        }, {id_usuario: user._id.toString()}, function (response) {
                            response.on('data', function (d) {
                                devuelve = d;
                            });
                        });

                        var token = crearToken(user);
                        res.cookie('tokenAPI', token, {maxAge: 24 * 60 * 60 * 1000});
                        // return the information including token as JSON
                        res.json({
                            success: true,
                            message: 'Autenticacion correcta',
                            token: token
                        });
                    }
                } else
                    res.send("No se ha enviado el parámetro contraseña.");
            } else
                res.send("El usuario introducido no existe.");
        });
    }else{
        res.send("Introduce un email.");
    }
});

////////////////////TWITTER

//Ruta para autenticarse con Twitter (enlace de login)
app.get('/auth/twitter', passport.authenticate('twitter'));

//Ruta de callback, a la que redirigirá tras autenticarse
/*
 app.get('/twitter/callback', passport.authenticate('twitter',
 { successRedirect: '/user-panel/index#/dashboard/home', failureRedirect: '/login'}
 ));
 */

app.get('/twitter/callback', function(req, res, next) {
    passport.authenticate('twitter', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }

            //Registramos la entrada a la aplicación
            var devuelve;
            http.post({
                host: config.direccion.host,
                port: config.direccion.port,
                path: '/apiInfo/infosistema/entradaAlSistema'
            }, {id_usuario: user._id.toString(), provider: 'twitter'}, function(response){
                response.on('data', function(d) {
                    devuelve = d;
                });
            });

            var token = crearToken(req.user);
            res.cookie('tokenAPI', token, { maxAge: 24*60*60*1000 });

            //return user;
            return res.redirect('/user-panel/index#/dashboard/home');
        });
    })(req, res, next);
});

////////////////////GOOGLE

//Ruta para autenticarse con Google+
app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// Ruta de callback, a la que redirigirá tras autenticarse
app.get('/google/callback', function(req, res, next) {
    passport.authenticate('google', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }

            //Registramos la entrada a la aplicación
            var devuelve;
            http.post({
                host: config.direccion.host,
                port: config.direccion.port,
                path: '/apiInfo/infosistema/entradaAlSistema'
            }, {id_usuario: user._id.toString(), provider: 'google'}, function(response){
                response.on('data', function(d) {
                    devuelve = d;
                });
            });

            var token = crearToken(req.user);
            res.cookie('tokenAPI', token, { maxAge: 24*60*60*1000 });

            return res.redirect('/user-panel/index#/dashboard/home');
        });
    })(req, res, next);
});

function crearToken(user){
    // El usuario es correcto, por lo que creamos y devolvemos un token
    // crea un token indicando:
    // -Parametros incluidos en el token, el nombre de usuario y los permisos de acceso
    // -Clave secreta de token
    // -Tiempo de expiracion
    var scopes = [];
    if(user.role=="user"){
        scopes = ['simple'];
    }else if(user.role=="business"){
        scopes = ['simple', 'business'];
    }
    else if(user.role=="admin"){
        scopes = ['simple', 'business', 'admin'];
    }

    var token = jwt.sign(
        {
            user: user.name,
            scopes: scopes
        }
        , config.session.secret,
        {
            expiresIn: 24*60*60 // expira en 24 horas (expresado en segundos)
        }
    );

    return token;
}



////////////////////////////////////////////////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;
