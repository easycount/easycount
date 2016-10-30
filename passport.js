var mongoose = require('mongoose');
var User = mongoose.model('Usuario');

//Estrategia de autenticación con Twitter y local
var TwitterStrategy = require('passport-twitter').Strategy;
var LocalStrategy   = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var config = require('./config');

//Exportamos como módulo las funciones de passport, de forma que
//podamos utilizarlas en otras partes de la aplicación
module.exports = function(passport){

    //Serializa el objeto usuario para almacenarlo en la sesión
    passport.serializeUser(function(user, done){
        done(null, user);
    });

    //Deserializa el objeto usuario almacenado en la sesión para poder utilizarlo
    passport.deserializeUser(function(obj, done){
        done(null, obj);
    });
    //////////////////////////////////////////////////////////////////////////////CONFIGURACION PASSPORT TWITTER//////////////////////////////////////////////////////////////////////////////////////
    //Configuración del autenticado con Twitter
    passport.use(new TwitterStrategy({
            consumerKey:        config.twitter.key,
            consumerSecret:     config.twitter.secret,
            callbackURL:        '/twitter/callback',
            passReqToCallback : true
        }, function(req, accessToken, refreshToken, profile, done){
            //Buscamos en la BBDD si el usuario ya se autenticó y está almacenado
            User.findOne({provider_id: profile.id}, function(err, user){
                if(err) throw(err);
                //Si existe en la base de datos, lo devuelve
                if(!err && user!=null) return done(null, user);

                //Si no existe crea un nuevo objeto usuario
                var user = new User({
                    provider_id  : profile.id,
                    provider:   profile.provider,
                    name: profile.displayName,
                    photo: profile.photos[0].value
                });
                //Almacenamos el usuario en la base de datos
                user.save(function(err){
                    if(err) throw err;
                    done(null, user);
                });
            })
        }

    ));

    //////////////////////////////////////////////////////////////////////////////CONFIGURACION PASSPORT LOCAL//////////////////////////////////////////////////////////////////////////////////////
    // Registro
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'emailsignup',
            passwordField : 'passwordsignup',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // SE PASAN COMO PARÁMETROS DESDE EL FORMULARIO LOS CAMPOS A RELLENAR DEL USUARIO
            // asynchronous

            // User.findOne wont fire unless data is sent back
            process.nextTick(function() {

                //Comprobamos que no hay ningun usuario ya registrado con ese email
                User.findOne({ 'email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'El email ya se encuentra en uso.'));
                    } else {
                        //Comprobamos que ambas contraseñas coinciden
                        if(password!=req.body.passwordsignup_confirm)
                            return done(null, false, req.flash('signupMessage', 'Las contraseñas no coinciden.'));
                        else {
                            var restr = [];

                            if(req.body.vegetarianosignup!=null)
                                restr.push(req.body.vegetarianosignup);

                            if(req.body.celiacosignup!=null)
                                restr.push(req.body.celiacosignup);

                            if(req.body.lactosasignup!=null)
                                restr.push(req.body.lactosasignup);

                            if(req.body.diabeticosignup!=null)
                                restr.push(req.body.diabeticosignup);

                            if(req.body.frutossignup!=null)
                                restr.push(req.body.frutossignup);

                            var foto = email+".jpg";

                            if(req.body.avatarsignup==null || req.body.avatarsignup=="")
                                foto = "user.png";

                            var userAux = new User();
                            // Si no hay usuario con ese email, lo creamos
                            var user = new User({
                                provider_id: -1,
                                name: req.body.usernamesignup,
                                email: email,
                                password: userAux.generateHash(password),
                                f_nacimiento: new Date(req.body.fechasignup),
                                genero: req.body.sexosignup,
                                restricciones: restr,
                                n_personas: req.body.personassignup,
                                photo: foto
                            });

                            // save the user
                            user.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });

                        }
                    }

                });

            });

        }
    ));
    //Login
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            // Buscamos el usuario y lo tratamos dentro de la función
            User.findOne({ 'email' :  email }, function(err, user) {
                // Si ha habido errores, devuelve el error
                if (err)
                    return done(err);

                // Si no hay usuario, devuelve el mensaje de que no existe
                if (!user)
                    return done(null, false, req.flash('signupMessage', 'El usuario introducido no existe.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('signupMessage', 'Contraseña incorrecta.')); // create the loginMessage and save it to session as flashdata

                // Si all va bien, devuelve el usuario
                return done(null, user);
            });

        })
    );

//////////////////////////////////////////////////////////////////////////////CONFIGURACION PASSPORT GOOGLE//////////////////////////////////////////////////////////////////////////////////////
    passport.use(new GoogleStrategy({
            clientID        : config.google.key,
            clientSecret    : config.google.secret,
            callbackURL     : '/google/callback',

        },
        function(token, refreshToken, profile, done) {

            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Google
            process.nextTick(function() {

                // try to find the user based on their google id
                User.findOne({ 'provider_id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if a user is found, log them in
                        return done(null, user);
                    } else {
                        //Si no existe crea un nuevo objeto usuario
                        var user = new User({
                            provider_id  : profile.id,
                            provider:   profile.provider,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            photo: profile.photos[0].value
                        });

                        // save the user
                        user.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, user);
                        });
                    }
                });
            });

        }));
}