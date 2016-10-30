/**
 * Created by i_d_a on 30/03/2016.
 */
var express = require('express');
var router = express.Router();

var Usuario = require('../models/Usuario.js');
var Producto = require('../models/Producto.js');

//Objetos necesarios para la creacion del token de autenticacion en la api
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./../config');

//Devuelve la valoración media del producto.
//Argumentos: id (incluido en la URL
router.get('/:id/valoracionMedia', function(req, res, next) {
    Producto.findById(req.params.id).lean().exec(function (err, post) {
            if (err) return next(err);
            //ee

            if(post!=null) {
                var val = post.valoraciones;
                var valMedia = 0;
                if (val.length > 0) {
                    for (var i = 0; i < val.length; i++) {
                        if(typeof(val[i].puntuacion)=="string")
                            valMedia += parseInt(val[i].puntuacion);
                        else
                            valMedia += val[i].puntuacion;
                    }
                    valMedia = valMedia / val.length;
                }
                res.send(valMedia.toString());
            }else{
                res.send("-1");
            }
        }
    );
});

//Devuelve la valoración media del producto.
//Argumentos: id (incluido en la URL
router.get('/:barcode/valoracionMediaProducto', function(req, res, next) {
    Producto.find({barcode: req.params.barcode}).lean().exec(function (err, post) {
            if (err) return next(err);
            //ee

            if(post!=null && post.length>0) {
                var val = post[0].valoraciones;
                var valMedia = 0;
                if (val.length > 0) {
                    for (var i = 0; i < val.length; i++) {
                        if(typeof(val[i].puntuacion)=="string")
                            valMedia += parseInt(val[i].puntuacion);
                        else
                            valMedia += val[i].puntuacion;
                    }
                    valMedia = valMedia / val.length;
                }
                res.send(valMedia.toString());
            }else{
                res.send("-1");
            }
        }
    );
});

//Devuelve un array con el número de opiniones de un producto [positivas, negativas]
//Argumentos: id_producto, tipo
router.get('/dameNumOpiniones/:id_producto', function(req, res, next) {
    if(req.params.id_producto!=null && req.params.id_producto!="") {
        Producto.findById(req.params.id_producto).lean().exec(function (err, post) {
                if (err) return next(err);

                if (post != null) {
                    var opi = post.opiniones;
                    var positivos = 0;
                    var negativos = 0;

                    for(var j=0; j<opi.length; j++){
                        if(opi[j].positivo==true)
                            positivos++;
                        else
                            negativos++;
                    }

                    var devuelve = {'positivas': positivos, 'negativas': negativos};

                    res.send(devuelve);
                } else {
                    res.send("0");
                }
            }
        );
    }else{
        res.send("0");
    }
});

//Devuelve un array con el número de opiniones de un producto [positivas, negativas]
//Argumentos: barcode
router.get('/dameNumOpinionesProducto/:barcode', function(req, res, next) {
    if(req.params.barcode!=null && req.params.barcode!="") {
        Producto.find({barcode: req.params.barcode}).lean().exec(function (err, post) {
                if (err) return next(err);

                if (post != null && post.length>0) {
                    var opi = post[0].opiniones;
                    var positivos = 0;
                    var negativos = 0;

                    for(var j=0; j<opi.length; j++){
                        if(opi[j].positivo==true)
                            positivos++;
                        else
                            negativos++;
                    }

                    var devuelve = {'positivas': positivos, 'negativas': negativos};

                    res.send(devuelve);
                } else {
                    res.send("0");
                }
            }
        );
    }else{
        res.send("0");
    }
});


module.exports = router;