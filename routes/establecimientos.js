var express = require('express');
var router = express.Router();

var Empresa = require("../models/Empresa.js");
var Establecimiento = require('../models/Establecimiento.js');

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
/* GET /establecimientos listing. */
router.get('/', function(req, res, next) {
    Establecimiento.find(function (err, establecimientos) {
        if (err) return next(err);
        res.json(establecimientos);
    });
});

/* GET /establecimientos listing. */
router.get('/conEmpresa', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Establecimiento.find().lean().exec(function (err, establecimientos) {
        if (err) return next(err);
        if(establecimientos!=null){
            Empresa.find().exec(function(err, empresas){
               if(empresas!=null){
                   var indiceEmpresa = -1;
                   for(var i=0; i<establecimientos.length; i++){
                       indiceEmpresa = dameIndiceEmpresa(empresas, establecimientos[i].empresa);
                       if(indiceEmpresa != -1 && empresas[indiceEmpresa]!=-1){
                           establecimientos[i]['nombreEmpresa'] = empresas[indiceEmpresa].name;
                       }
                   }
                   res.json(establecimientos);
               }
            });
        }else{
            res.json(establecimientos);
        }
    });
});

//Argumentos: id_empresa, inicio (OPCIONAL), fin (OPCIONAL)
router.post('/establecimientosPorEmpresa',/*compruebaScopes(['simple']),*/ function(req, res, next){
    if(req.body.id_empresa!="" && req.body.id_empresa!=null) {
        Establecimiento.find({empresa: req.body.id_empresa}).exec(function (err, establecimientos) {
            if (err) {
                res.send([]);
            } else {
                var inicio = 0, fin = establecimientos.length;
                if (req.body.inicio != null && !isNaN(parseInt(req.body.inicio)))
                    inicio = parseInt(req.body.inicio);

                if (req.body.fin != null && !isNaN(parseInt(req.body.fin)))
                    fin = parseInt(req.body.fin);

                var devuelve = establecimientos.slice(inicio, fin);

                res.send(devuelve);
            }
        })
    }else{
        res.send([]);
    }
});

/* POST /establecimientos */
router.post('/', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Establecimiento.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /establecimientos/id */
router.get('/:id', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Establecimiento.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* PUT /establecimientos/:id */
router.put('/:id', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Establecimiento.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });

    Establecimiento.findById(req.params.id, function (err, post) {
        if (err) return next(err);

        if(req.body.name)
            post.name = req.body.name;

        if(req.body.empresa)
            post.empresa = req.body.empresa;

        if(req.body.ciudad)
            post.ciudad = req.body.ciudad;

        if(req.body.comunidad)
            post.comunidad = req.body.comunidad;

        if(req.body.coordenadas)
            post.productos.push(req.body.coordenadas);

        post.save(function(err){
            if(err) {
                res.send(err);
            }else {
                res.json(post);
            }
        });
    });
});

/* DELETE /establecimientos/:id */
router.delete('/:id',/*compruebaScopes(['simple']),*/ function(req, res, next) {
    Establecimiento.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* POST /usuarios por elemento concreto */
router.post('/buscar', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Establecimiento.find(req.body,function (err, establecimiento) {
        if (err) return next(err);
        res.json(establecimiento);
    });
});

//Argumentos: id_empresa, inicio, cantidad
router.post('/establecimientosEmpresa',/*compruebaScopes(['simple']),*/ function(req, res, next) {
    Establecimiento.find({'empresa':req.body.empresa},function (err, establecimientos) {
        if (err) return next(err);
        var numTotal = establecimientos.length;
        var inicio = 0, fin = establecimientos.length;
        if(!isNaN(parseInt(req.body.inicio)))
            inicio = parseInt(req.body.inicio);

        if(!isNaN(parseInt(req.body.cantidad)))
            fin = parseInt(req.body.cantidad);

        var devuelve = establecimientos.slice(inicio, fin);
        res.json({array:devuelve, total: numTotal});
    });
});

/***************************************************** FUNCIONES CUSTOM *******************************************************************************/

function dameIndiceEmpresa(empresas, idEmpresa){
    for(var j=0; j<empresas.length; j++){
        if(empresas[j]._id == idEmpresa){
            return j;
        }
    }
    return -1;
}

module.exports = router;