var express = require('express');
var router = express.Router();

var Usuario = require('../models/Usuario.js');
var Promocion = require('../models/Promocion.js');

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
/* GET /promociones listing. */
router.get('/', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Promocion.find(function (err, promociones) {
        if (err) return next(err);
        res.json(promociones);
    });
});

/* POST /promociones */
router.post('/', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Promocion.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /promociones/id */
router.get('/:id', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Promocion.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* PUT /promociones/:id */
router.put('/:id', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Promocion.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });

    Promocion.findById(req.params.id, function (err, post) {
        if (err) return next(err);

        if(req.body.name)
            post.name = req.body.name;

        if(req.body.barcode)
            post.barcode = req.body.barcode;

        if(req.body.empresa)
            post.empresa = req.body.empresa;

        if(req.body.tipo)
            post.tipo = req.body.tipo;

        if(req.body.description)
            post.description = req.body.description;

        if(req.body.productos)
            post.productos.push(req.body.productos);

        if(req.body.categorias)
            post.categorias.push(req.body.categorias);

        if(req.body.f_desde)
            post.f_desde = req.body.f_desde;

        if(req.body.f_hasta)
            post.f_hasta = req.body.f_hasta;

        post.save(function(err){
            if(err) {
                res.send(err);
            }else {
                res.json(post);
            }
        });
    });
});

/* POST /usuarios por elemento concreto */
router.post('/buscar', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Promocion.find(req.body,function (err, promocion) {
        if (err) return next(err);
        res.json(promocion);
    });
});

//Argumentos: id_empresa, inicio, cantidad
router.post('/promocionesEmpresa', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Promocion.find({'empresa':req.body.empresa},function (err, promociones) {
        if (err) return next(err);
        var numTotal = promociones.length;
        var inicio = 0, fin = promociones.length;
        if(!isNaN(parseInt(req.body.inicio)))
            inicio = parseInt(req.body.inicio);

        if(!isNaN(parseInt(req.body.cantidad)))
            fin = parseInt(req.body.cantidad);

        var devuelve = promociones.slice(inicio, fin);
        res.json({array:devuelve, total: numTotal});
    });
});

//-
//Argumentos: categorias, inicio, fin
router.post('/promocionesPorCategoria', function(req, res, next){
    var categorias = req.body.categorias;
    if(typeof(req.body.categorias) == "string"){
        categorias = JSON.parse(req.body.categorias);
        console.log(categorias);
    }
    if(categorias.constructor !== Array){
        categorias = [req.body.categorias];
    }

    Promocion.find({ categorias: {$in: categorias}}).exec(function(err, promociones){
        if(!err) {
            var total = promociones.length;
            var ini = 0, fin = promociones.length;

            if(req.body.inicio!=null && !isNaN(parseInt(req.body.inicio))){
                ini = parseInt(req.body.inicio);
            }
            if(req.body.fin!=null && !isNaN(parseInt(req.body.fin))){
                fin = parseInt(req.body.fin);
            }

            var devuelve = promociones.slice(ini, fin);

            res.send({
                array: devuelve,
                total: total
            });
        }else{
            res.send(err);
        }
    });
})

//Devuelve segmentado según los valores que se den en inicio y fin las promociones asociadas a un usuario
//Argumentos: id_usuario, nProductos, inicio, fin
router.post('/promocionesBasadasEnCompras', function(req, res, next){
    Usuario.findById(req.body.id_usuario).exec(function(err, usu){
        if(!err){
            var productos = usu.productos;

            productos.sort(compareFecha);

            var numProds = 50;
            if(req.body.nProductos!=null && !isNaN(parseInt(req.body.nProductos))){
                numProds = parseInt(req.body.nProductos);
            }

            var productos = productos.slice(0, numProds);
            var idProductos  = [];

            for(var t=0; t<productos.length; t++){
                idProductos.push(productos[t].id_prod);
            }

            Promocion.find({ productos: {$in: idProductos}}).exec(function(err, promociones){
                if(!err) {
                    var ini = 0, fin = promociones.length;
                    var total = promociones.length;

                    if(req.body.inicio!=null && !isNaN(parseInt(req.body.inicio))){
                        ini = parseInt(req.body.inicio);
                    }
                    if(req.body.fin!=null && !isNaN(parseInt(req.body.fin))){
                        fin = parseInt(req.body.fin);
                    }

                    var devuelve = promociones.slice(ini, fin);

                    res.send({
                        array: devuelve,
                        total: total
                    });
                }else{
                    res.send(err);
                }
            });
        }else{
            res.send([]);
        }

    });
})

//Devuelve segmentado según los valores que se den en inicio y fin las promociones asociadas a un usuario
//Argumentos: id_usuario, inicio, fin
router.post('/promocionesPorUsuario', function(req, res, next){
    Usuario.findById(req.body.id_usuario).exec(function(err, usu){
       if(!err){
           Promocion.find({ categorias: {$in: usu.categorias}}).exec(function(err, promociones){
               if(!err) {
                   var ini = 0, fin = promociones.length;
                   var total = promociones.length;

                   if(req.body.inicio!=null && !isNaN(parseInt(req.body.inicio))){
                       ini = parseInt(req.body.inicio);
                   }
                   if(req.body.fin!=null && !isNaN(parseInt(req.body.fin))){
                       fin = parseInt(req.body.fin);
                   }

                   var devuelve = promociones.slice(ini, fin);



                   res.send({
                       array: devuelve,
                       total: total
                   });
               }else{
                   res.send(err);
               }
           });
       }else{
           res.send([]);
       }

    });
})

/* DELETE /usuarios/:id */
router.delete('/:id',/*compruebaScopes(['simple']),*/ function(req, res, next) {
    Promocion.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/***************************************************** FUNCIONES CUSTOM *******************************************************************************/

function compareFecha(a,b) {
    var f1 = new Date(a.fecha);
    var f2 = new Date(b.fecha);
    if (f1 > f2)
        return -1;
    else if (f1 < f2)
        return 1;
    else
        return 0;
}

module.exports = router;