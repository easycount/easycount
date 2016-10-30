var express = require('express');
var router = express.Router();

var DataUsuario = require('../models/DataUsuario.js');

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

/**GETs y POSTs sobre un modelo*/
/* GET /empresas listing. */
router.get('/', /*compruebaScopes(['simple']),*/ function(req, res, next) {
    DataUsuario.find(function (err, usuarios) {
        if (err) return next(err);
        res.json(usuarios);
    });
});

/* POST /empresas */
router.post('/', /*compruebaScopes(['simple']),*/function(req, res, next) {
    DataUsuario.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* POST /usuarios por elemento concreto */
router.post('/buscar', /*compruebaScopes(['simple']),*/function(req, res, next) {
    DataUsuario.find(req.body,function (err, usuarios) {
        if (err) return next(err);
        res.json(usuarios);
    });
});


/* GET /empresas/id */
router.get('/:id', /*compruebaScopes(['simple']),*/function(req, res, next) {
    DataUsuario.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

///* PUT /empresas/:id */
router.put('/:id', /*compruebaScopes(['simple']),*/function(req, res, next) {
    DataUsuario.findById(req.params.id, function (err, post) {
        if (err) return next(err);

        if(req.body.usuario)
            post.usuario = req.body.usuario;

        if(req.body.gastoMedioMes)
            post.gastoMedioMes = req.body.gastoMedioMes;

        if(req.body.gastoMedioAno)
            post.gastoMedioAno = req.body.gastoMedioAno;

        if(req.body.gastoMedioPorCompraMes)
            post.gastoMedioPorCompraMes = req.body.gastoMedioPorCompraMes;

        if(req.body.gastoMedioPorCompraAno)
            post.gastoMedioPorCompraAno = req.body.gastoMedioPorCompraAno;

        post.save(function(err){
            if(err) {
                res.send(err);
            }else {
                res.json(post);
            }
        });
    });

});

//Devuelve los datos referentes al gasto medio por compra para un año y un mes determinado
//Argumentos: id_usuario, mes, año
router.post('/dameGastoMedioCompraMes', /*compruebaScopes(['simple']),*/function(req, res, next) {
    DataUsuario.find({usuario: req.body.id_usuario},function (err, usuarios) {
        if (err) return next(err);
        var devuelve = {
            año: parseInt(req.body.año),
            mes: parseInt(req.body.mes),
            importe: 0,
            numCompras: 0,
            gastoPorCompra: 0
        };
        var encontrado = false;

        if(usuarios.length!=0) {
            var datos = usuarios[0].gastos;

            for (var i = 0; i < datos.length; i++) {
                if (parseInt(datos[i].mes) == parseInt(req.body.mes) && parseInt(datos[i].año) == parseInt(req.body.año) && encontrado == false) {
                    encontrado = true;
                    devuelve = datos[i];
                }
            }
        }
        res.json(devuelve);
    });
});

module.exports = router;

