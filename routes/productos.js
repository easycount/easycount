var express = require('express');
var router = express.Router();
var http = require('http');
http.post = require('http-post');
var config = require('./../config');

var Usuario = require('../models/Usuario.js');
var Producto = require('../models/Producto.js');

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

function llamadaValoracion(req, res, next){
    //Registramos la entrada a la aplicación
    var devuelve;
    var fecha = new Date();

    var cookie = res.cookie.tokenAPI;
    var path = '/apiInfo/infosistema/infoValoraciones';

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
            return true;
        });
    });
}

function llamadaOpiniones(req, res, next){
    //Registramos la entrada a la aplicación
    var devuelve;
    var fecha = new Date();

    var cookie = res.cookie.tokenAPI;
    var path = '/apiInfo/infosistema/infoOpiniones';

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
            return true;
        });
    });
}

/**GETs y POSTs sobre un modelo*/
/* GET /productos listing. */
router.get('/', /*compruebaScopes(['simple']),*/ function(req, res, next) {
    Producto.find(function (err, productos) {
        if (err) return next(err);
        res.json(productos);
    });
});

/* POST /productos */
router.post('/', /*compruebaScopes(['business']),*/ function(req, res, next) {
    Producto.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* POST /usuarios por elemento concreto */
router.post('/buscar', /*compruebaScopes(['simple']),*/ function(req, res, next) {
    Producto.find(req.body,function (err, productos) {
        if (err) return next(err);
        res.json(productos);
    });
});

/* POST /usuarios por elemento concreto */
router.post('/buscarBarcode', /*compruebaScopes(['simple']),*/ function(req, res, next) {
    if(req.body.barcode!=null && req.body.barcode!=""){
        Producto.find(req.body,function (err, productos) {
            if (err) return next(err);
            res.json(productos);
        });
    }else{
        res.json([]);
    }
});

/* GET /productos/id */
router.get('/:id', /*compruebaScopes(['simple']),*/ function(req, res, next) {
    Producto.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* PUT /productos/:id */
router.put('/:id', /*compruebaScopes(['business']),*/ function(req, res, next) {
    Producto.findById(req.params.id, function (err, post) {
        if (err) return next(err);

        if(req.body.name)
            post.name = req.body.name;

        if(req.body.barcode)
            post.barcode = req.body.barcode;

        if(req.body.type)
            post.type = req.body.type;

        if(req.body.description)
            post.description = req.body.description;

        if(req.body.photo)
            post.photo = req.body.photo;


        if(req.body.valoraciones) {
            if(typeof(req.body.valoraciones) == "string"){
                var valoracionesAux = JSON.parse(req.body.valoraciones);
                llamadaValoracion(req, res, next);
                post.valoraciones.push(valoracionesAux);
            }else{
                llamadaValoracion(req, res, next);
                post.valoraciones.push(req.body.valoraciones);
            }
            //llamadaValoracion(req, res, next);
            //post.valoraciones.push(req.body.valoraciones);
        }
        if(req.body.opiniones) {
            if(typeof(req.body.opiniones) == "string"){
                var opinionesAux = JSON.parse(req.body.opiniones);
                llamadaOpiniones(req, res, next);
                post.opiniones.push(opinionesAux);
            }else{
                llamadaOpiniones(req, res, next);
                post.opiniones.push(req.body.opiniones);
            }
            //llamadaOpiniones(req, res, next);
            //post.opiniones.push(req.body.opiniones);
        }
        post.save(function(err){
            if(err) {
                res.send(err);
            }else {
                res.json(post);
            }
        });
    });
});


/* DELETE /productos/:id */
router.delete('/:id', /*compruebaScopes(['business']),*/ function(req, res, next) {
    Producto.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/***************************************************** FUNCIONES CUSTOM *******************************************************************************/
//Devuelve la valoración media del producto.
//Argumentos: id (incluido en la URL
router.get('/:id/valoracionMedia', /*compruebaScopes(['simple']),*/ function(req, res, next) {
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

//Devuelve true o false en función de si un producto ha sido o no (respectivamente) valorado por un usuario concreto.
//Argumentos: id_producto, id_usuario, id_empresa
router.post('/valoradoPorUsuario', /*compruebaScopes(['simple']),*/ function(req, res, next) {
    Producto.findById(req.body.id_producto).lean().exec(function (err, post) {
            if (err) return next(err);

            if(post!=null) {
                var val = post.valoraciones;
                var valorado = false;
                if (val.length > 0) {
                    for (var i = 0; i < val.length; i++) {
                        if (val[i].user) {
                            if (val[i].user == req.body.id_usuario && val[i].empresa == req.body.id_empresa) {
                                valorado = val[i];
                            }
                        }
                    }
                }
                res.send(valorado);
            }else
                res.send(false);
        }
    );
});

//Devuelve true o false en función de si un producto ha sido o no (respectivamente) opinado por un usuario concreto.
//Argumentos: id_producto, id_usuario, id_empresa
router.post('/opinadoPorUsuario', /*compruebaScopes(['simple']),*/ function(req, res, next) {
    Producto.findById(req.body.id_producto).lean().exec(function (err, post) {
            if (err) return next(err);
            if(post!=null) {
                var val = post.opiniones;
                var opinado= false;
                if (val.length > 0) {
                    for (var i = 0; i < val.length; i++) {
                        if (val[i]!=null && val[i].user) {
                            if (val[i].user == req.body.id_usuario && val[i].empresa == req.body.id_empresa) {
                                opinado = val[i];
                            }
                        }
                    }
                }
                res.send(opinado);
            }else
                res.send(false);
        }
    );
});

//Devuelve las últimas n opiniones acerca de un producto
//Argumentos: id_producto, cantidad
router.get('/dameNUltimasOpiniones/:id_producto/:cantidad', /*compruebaScopes(['simple']),*/ function(req, res, next) {
    if(req.params.id_producto!=null && req.params.id_producto!="") {
        Producto.findById(req.params.id_producto).lean().exec(function (err, post) {
                if (err) return next(err);

                if (post != null) {
                    var opi = post.opiniones;
                    opi.sort(compareFecha);
                    var devuelve = opi.slice(0, parseInt(req.params.cantidad));
                    res.send(devuelve);
                } else {
                    res.send([]);
                }
            }
        );
    }else{
        res.send([]);
    }
});

//Devuelve las últimas n opiniones acerca de un producto filtradas por si son positivas o negativas
//Argumentos: id_producto, cantidad, tipo
router.get('/dameNUltimasOpiniones/:id_producto/:cantidad/:tipo', /*compruebaScopes(['simple']),*/ function(req, res, next) {
    if(req.params.id_producto!=null && req.params.id_producto!="") {
        Producto.findById(req.params.id_producto).lean().exec(function (err, post) {
                if (err) return next(err);

                if (post != null) {
                    var opi = post.opiniones;

                    if(req.params.tipo!=null && req.params.tipo!="todos" && (req.params.tipo=="positivo" || req.params.tipo=="negativo")){
                        opi = filtrarArray(opi, req.params.tipo);
                    }

                    opi.sort(compareFecha);
                    var devuelve = opi.slice(0, parseInt(req.params.cantidad));
                    res.send(devuelve);
                } else {
                    res.send([]);
                }
            }
        );
    }else{
        res.send([]);
    }
});

//Devuelve número de opiniones de un producto por tipo
//Argumentos: id_producto, tipo
router.get('/dameNumOpiniones/:id_producto/:tipo', /*compruebaScopes(['simple']),*/ function(req, res, next) {
    if(req.params.id_producto!=null && req.params.id_producto!="") {
        Producto.findById(req.params.id_producto).lean().exec(function (err, post) {
                if (err) return next(err);

                if (post != null) {
                    var opi = post.opiniones;

                    if(req.params.tipo!=null && req.params.tipo!="todos" && (req.params.tipo=="positivo" || req.params.tipo=="negativo")){
                        opi = filtrarArray(opi, req.params.tipo);
                    }
                    res.send(opi.length.toString());
                } else {
                    res.send("0");
                }
            }
        );
    }else{
        res.send("0");
    }
});

router.get('/dameTipo/:id_producto', /*compruebaScopes(['simple']),*/function(req, res, next) {
    if(req.params.id_producto!=null && req.params.id_producto!="") {
        Producto.findById(req.params.id_producto).lean().exec(function (err, data) {
            if (err) return next(err);

            if(data != null){
                res.send(data.type);
            }else{
                res.send("Sin tipo");
            }
        });
    }else{
        res.send("Sin tipo");
    }
});

//Devuelve un array con el número de opiniones de un producto [positivas, negativas]
//Argumentos: id_producto, tipo
router.get('/dameNumOpiniones/:id_producto', /*compruebaScopes(['simple']),*/ function(req, res, next) {
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

//Devuelve un array con de n a m productos ordenados por su valoración media.
//Argumentos: inicio, cantidad
router.post('/dameProductosValoracionMedia', /*compruebaScopes(['simple']),*/ function(req, res, next) {
    Producto.aggregate([
            { $unwind: '$valoraciones' },
            {$group: {
                _id: '$_id',
                name: { "$first": "$name" },
                valMedia: { $avg: '$valoraciones.puntuacion'}
            }}
        ], function (err, productos) {
            if (err) {
                console.error(err);
                res.send(err);
            } else {
                if(!isNaN(parseInt(req.body.cantidad))){
                    var ini = 0;
                    if(parseInt(req.body.inicio)){
                        ini=parseInt(req.body.inicio);
                    }
                    productos = productos.slice(ini, parseInt(req.body.cantidad));
                }
                productos.sort(compareValMedia);

                res.send(productos);
            }
        }
    );
});

//Devuelve un array con la lista de coincidencias entre los alergenos del producto y las restricciones del usuario. Vacío si no hay ninguna
//id_usuario, barcode/id_producto
router.post("/compruebaRestricciones", function(req, res, next){
    var enviado = false;
    var cont = 0;
    var result = "";
    var obj;
    var barcode = null;
    if(req.body.barcode!=null && req.body.barcode!=""){
        barcode = req.body.barcode;
        if(barcode!=null && req.body.id_usuario!=null){
            Usuario.findById(req.body.id_usuario).exec(function(err, usu){
                if(!err && usu!=null && usu.restricciones.length>0) {
                    var ruta = "world.openfoodfacts.org";
                    var trozosRes = [];
                    var peticion = http.get({
                        host: ruta,
                        //port: config.direccion.port,
                        path: "/api/v0/product/" + barcode + ".json"
                    }, function (response) {
                        response.on('data',function(d){
                            trozosRes.push(d);
                        })
                        response.on('end', function () {
                            result = Buffer.concat(trozosRes);
                            result = result.toString();
                            obj = JSON.parse(result);

                            var alergenosAux = [], interseccion = [], devuelve=[];
                            var rest = "";
                            if(obj.status_verbose=="product found") {
                                for (var o = 0; o < usu.restricciones.length; o++) {
                                    rest = usu.restricciones[o];
                                    switch (rest) {
                                        case "vegetariano":
                                            alergenosAux = config.restricciones.vegano;
                                            break;
                                        case "celiaco":
                                            alergenosAux = config.restricciones.celiaco;
                                            break;
                                        case "lactosa":
                                            alergenosAux = config.restricciones.lactosa;
                                            break;
                                        case "diabetico":
                                            alergenosAux = config.restricciones.diabetico;
                                            break;
                                        case "frutos":
                                            alergenosAux = config.restricciones.frutos;
                                            break;
                                        default:
                                            alergenosAux = [];
                                            break;
                                    }
                                    var alergenosProducto = [];
                                    if(obj.product!=null){
                                        alergenosProducto = obj.product.allergens_hierarchy;
                                    }
                                    interseccion = interseccionArrays(alergenosAux, alergenosProducto);
                                    if (interseccion.length > 0) {
                                        devuelve.push(rest)
                                    }
                                }
                            }
                            res.send(devuelve);
                        }
                        );
                    });

                    peticion.on('error', function(e) {
                        res.send([]);
                    });
                }else{
                    res.send([]);
                }
            });
        }else{
            res.send([]);
        }
    }
    else if(req.body.id_producto!=null){
        Producto.findById(req.body.id_producto).exec(function(err, prod){
            if(!err && prod!=null && prod.barcode!=null){
                barcode=prod.barcode;

                if(barcode!=null && req.body.id_usuario!=null){
                    Usuario.findById(req.body.id_usuario).exec(function(err, usu){
                        if(!err && usu!=null && usu.restricciones.length>0) {
                            var ruta = "world.openfoodfacts.org";
                            var trozosRes = [];
                            var peticion = http.get({
                                host: ruta,
                                //port: config.direccion.port,
                                path: "/api/v0/product/" + barcode + ".json"
                            }, function (response) {
                                response.on('data',function(d){
                                    trozosRes.push(d);
                                })
                                response.on('end', function () {
                                        result = Buffer.concat(trozosRes);
                                        result = result.toString();
                                        obj = JSON.parse(result);

                                        var alergenosAux = [], interseccion = [], devuelve=[];
                                        var rest = "";
                                        if(obj.status_verbose=="product found") {
                                            for (var o = 0; o < usu.restricciones.length; o++) {
                                                rest = usu.restricciones[o];
                                                switch (rest) {
                                                    case "vegetariano":
                                                        alergenosAux = config.restricciones.vegano;
                                                        break;
                                                    case "celiaco":
                                                        alergenosAux = config.restricciones.celiaco;
                                                        break;
                                                    case "lactosa":
                                                        alergenosAux = config.restricciones.lactosa;
                                                        break;
                                                    case "diabetico":
                                                        alergenosAux = config.restricciones.diabetico;
                                                        break;
                                                    case "frutos":
                                                        alergenosAux = config.restricciones.frutos;
                                                        break;
                                                    default:
                                                        alergenosAux = [];
                                                        break;
                                                }
                                                var alergenosProducto = [];
                                                if(obj.product!=null){
                                                    alergenosProducto = obj.product.allergens_hierarchy;
                                                }
                                                interseccion = interseccionArrays(alergenosAux, alergenosProducto);
                                                if (interseccion.length > 0) {
                                                    devuelve.push(rest)
                                                }
                                            }
                                        }
                                        res.send(devuelve);
                                    }
                                );
                            });

                            peticion.on('error', function(e) {
                                res.send([]);
                            });
                        }else{
                            res.send([]);
                        }
                    });
                }else{
                    res.send([]);
                }
            }else{
                res.send([]);
            }
        });
    }else{
        res.send([]);
    }
});


function interseccionArrays(array1, array2){
    var devuelve = [];

    for(var i=0; i<array1.length; i++){
        if(array2.indexOf(array1[i])!=-1){
            devuelve.push(array1[i]);
        }
    }
    return devuelve;
}

function filtrarArray(array, tipo){
    var arrayAux = [];
    var valorFiltrado = false;

    if(tipo=="positivo")
        valorFiltrado=true;

    for(var t=0; t<array.length; t++){
        if(array[t].positivo == valorFiltrado)
            arrayAux.push(array[t]);
    }
    return arrayAux;
}

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

function compareValMedia(a,b) {
    if (a.valMedia > b.valMedia)
        return -1;
    else if (a.valMedia < b.valMedia)
        return 1;
    else
        return 0;
}

module.exports = router;
