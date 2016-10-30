var express = require('express');
var router = express.Router();
var Usuario = require('../models/Usuario');

var mail = "img";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EasyCount', user: req.user  });
});

router.get('/contacto', function(req, res, next) {
  res.render('contact-form', { title: 'EasyCount', user: req.user});
});

router.get('/completarRegistro', function(req, res, next) {
  if(req.user) {
    Usuario.find({_id: req.user._id}, function (err, docs) {
      var obj = JSON.stringify(docs);
      if (obj.indexOf("email") == -1 || obj.indexOf("f_nacimiento") == -1 || obj.indexOf("genero") == -1 || obj.indexOf("restricciones") == -1 || obj.indexOf("n_personas") == -1) {
        res.render('correo-twitter',
            {
              'title': 'EasyCount',
              'user': req.user,
              'email': obj.indexOf("email"),
              'f_nacimiento': obj.indexOf("f_nacimiento"),
              'genero': obj.indexOf("genero"),
              'restricciones': obj.indexOf("restricciones"),
              'n_personas': obj.indexOf("n_personas")
            });
      } else
        res.redirect("/user-panel/index");
    });
  }else {
    res.redirect("/");
  }
});

router.get('/login', function(req, res, next) {
  if(req.user)
    res.redirect('../user-panel/index');
  else
    res.render('login', { user : req.user, message: req.flash('signupMessage') });
});

router.get('/registro', function(req,res, next){
  res.render('registro', { user : req.user, message: req.flash('signupMessage') });
});

router.get('/quienessomos', function(req, res, next) {
  res.render('quienessomos', { title: 'EasyCount', user: req.user });
});

router.get('/user-panel/index', isLoggedIn, function(req, res, next){
  Usuario.find({ _id: req.user._id}, function (err, docs) {
    if(docs!=null) {
      var obj = JSON.stringify(docs);
      if (obj.indexOf("email") != -1 && obj.indexOf("f_nacimiento") != -1 && obj.indexOf("genero") != -1 && obj.indexOf("restricciones") != -1 && obj.indexOf("n_personas") != -1) {
        if (req.user.role == 'user') {
          var photo = "user.png";
          if(req.user.photo!=null){
            photo=req.user.photo;
          }
          res.render('../user-panel/index', {user: req.user, foto: photo});
        }
        else if (req.user.role == 'admin') {
          res.redirect('/admin-panel/index');
        }else if (req.user.role == 'business') {
          res.redirect('/business-panel/index');
        }
      } else
        res.redirect("/completarRegistro");
    }
  });
});

router.get('/manual', function(req, res){
  var file = './epub/ManualWebEasyCount.epub';
  res.download(file); // Set disposition and send it.
});

router.get('/presentacion2', function(req, res){
  var file = './epub/presentacion_hito2.odp';
  res.download(file); // Set disposition and send it.
});

router.get('/user-panel/views/perfil', isLoggedIn, function(req, res, next){
  res.render('../user-panel/views/perfil.html', { user: req.user });
});

router.get('/admin-panel/index', isLoggedIn, function(req, res, next){
  var photo = "user.png";
  if(req.user.photo!=null){
    photo=req.user.photo;
  }
  res.render('../admin-panel/index', { user: req.user, title: 'EasyCount', foto: photo });
});

router.get('/business-panel/index', isLoggedIn, function(req, res, next){
  var photo = "user.png";
  if(req.user.photo!=null){
    photo=req.user.photo;
  }
  res.render('../business-panel/index', { user: req.user, title: 'EasyCount', foto: photo });
});

// Funcion para comprobar si el usuario esta logueado y, en ese caso, permitirle acceder al panel de usuario
function isLoggedIn(req, res, next) {
  // Si el usuario está autenticado, se continua
  if (req.isAuthenticated())
    return next();

  // Si no está, se redirige a la página principal
  res.redirect('/login');
}


///////////////// Código para subir imágenes
var multer  =   require('multer');

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __dirname+'/../images/profile');
  },
  filename: function (req, file, callback) {
    var nombre = mail + '.jpg';

    callback(null, nombre); //Corregir nombre
    //Escribir nombre en usuario
  }
});

var upload = multer({ storage : storage}).single('avatarsignup');

router.post('/upload/:email',function(req,res){
  mail = req.params.email;
  upload(req,res,function(err) {
    if(err) {
      return res.send("Error uploading file: "+err);
    }
    res.send("File is uploaded");
  });
});

module.exports = router;
