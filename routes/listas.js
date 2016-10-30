var express = require('express');
var router = express.Router();

var Lista = require('../models/Lista.js');
var Usuario = require('../models/Usuario.js');
var Producto = require('../models/Producto.js');
var Empresa = require('../models/Empresa.js');

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
/* GET /listas listing. */
router.get('/', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Lista.find(function (err, listas) {
        if (err) return next(err);
        var auxListas; //= listas.toObject();
        var cont=0;
        var arrayUsers = [];
        for(var i=0; i<listas.length; i++) {
            if(listas[i].usuario && arrayUsers.indexOf(listas[i].usuario)==-1){
                arrayUsers.push(listas[i].usuario);
            }
        }
        var cont=0;
        for(var j=0; j<arrayUsers.length; j++) {

            Usuario.findOne({'_id': arrayUsers[j]}).exec(function (err, user) {
                if (user != null) {
                    for(var m=0; m<listas.length; m++){
                        if(listas[m].usuario==user._id) {
                            listas[m].set('mailUsuario', user.email);
                        }
                    }
                }
                if (cont == arrayUsers.length-1) {
                    res.send(listas);
                }else
                    cont++;
            });
        }
        if(listas.length<=0)
            res.send([]);

        if(arrayUsers.length<=0)
            res.send([]);
    });
});

/* POST /listas */
router.post('/', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Lista.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* POST /listas por elemento concreto */
// /api/listas/buscar permite buscar en 
router.post('/buscar', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Lista.find(req.body,function (err, listas) {
        if (err) return next(err);
        res.json(listas);
    });
});

//Argumentos: inicio, cantidad
router.post('/listasPredefinidas', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Lista.find({'predefinida':true} ,function (err, listas) {
        if (err) return next(err);
        var devuelve = listas;
        var numTotal = listas.length;
        if(req.body.inicio!=null && !isNaN(parseInt(req.body.inicio)) && req.body.cantidad!=null && !isNaN(parseInt(req.body.cantidad))){
            devuelve = listas.slice(parseInt(req.body.inicio), parseInt(req.body.cantidad));
        }
        res.json({array: devuelve, total: numTotal});
    });
});

//Argumentos: id_usuario, inicio, cantidad
router.post('/listasUsuario', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Lista.find({'usuario':req.body.id_usuario} ,function (err, listas) {
        if (err) return next(err);
        var devuelve = listas;
        var numTotal = listas.length;
        devuelve.sort(compareFecha);
        if(req.body.inicio!=null && !isNaN(parseInt(req.body.inicio)) && req.body.cantidad!=null && !isNaN(parseInt(req.body.cantidad))){
            devuelve = listas.slice(parseInt(req.body.inicio), parseInt(req.body.cantidad));
        }
        res.json({array: devuelve, total: numTotal});
    });
});

//Devuelve los productos existentes en una lista de la compra con empresa, precio y demás info ya incluida en el objeto
//Argumentos: id_lista
router.post('/productosLista', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Lista.findById(req.body.id_lista).lean().exec(function (err, lista) {
        indicesIntroducidos = [];
        if (err){
            return next(err);
        }
        else {
            if (lista != null) {
                var numTotal = lista.productos.length;
                var prods = lista.productos;
                var cont = 0;

                var arrayAux = [];

                Empresa.find().exec(function (err, emp) {
                    if (err || emp == null) {
                        res.json({array: [], total: 0});
                    } else {
                        var indiceEmpresas = emp;
                        var indiceAux, empresaAux;

                        //Introducimos en el catalogo las propiedades de cada producto
                        for (var i = 0; i < prods.length; i++) {
                            Producto.findOne({'_id': prods[i].prod_id}).exec(function (err, prodAux) {
                                cont++;
                                if (!err && prodAux) {
                                    indiceAux = devuelveIndice(prods, prodAux._id);
                                    if (indiceAux != -1 && prods[indiceAux]) {
                                        empresaAux = encuentraEmpresaIndice(indiceEmpresas, prods[indiceAux].empresa);
                                        if (empresaAux != -1) {
                                            prods[indiceAux]['empresa'] = empresaAux.photo;
                                            prods[indiceAux]['nombreEmpresa'] = empresaAux.name;
                                            prods[indiceAux]['idEmpresa'] = empresaAux._id;
                                            prods[indiceAux]['precio'] = devuelvePrecioProductoEmpresa(empresaAux.catalogo, prodAux._id);
                                        }
                                        prods[indiceAux]['_id'] = prodAux._id;
                                        prods[indiceAux]['name'] = prodAux.name;
                                        prods[indiceAux]['photo'] = prodAux.photo;
                                        prods[indiceAux]['type'] = prodAux.type;
                                        prods[indiceAux]['description'] = prodAux.description;
                                        prods[indiceAux]['restricciones'] = prodAux.restricciones;
                                    }
                                }

                                if (cont == prods.length) {

                                    //Filtrado según nombre
                                    if (req.body.busqueda && req.body.busqueda != "") {
                                        prods = arrayAux;
                                    }

                                    //Orden en el que se devuelve
                                    var orden = "";
                                    if (req.body.orden)
                                        orden = req.body.orden.toLowerCase();

                                    switch (orden) {
                                        case "name":
                                            prods.sort(compareName);
                                            break;
                                        case "type":
                                            prods.sort(compareType);
                                            break;
                                        case "precio":
                                            prods.sort(comparePrecio);
                                            break;
                                        case "fecha":
                                            prods.sort(compareFecha);
                                            break;
                                        case "empresa":
                                            prods.sort(compareEmpresa);
                                            break;
                                        default:
                                            prods.sort(compareName);
                                            break;
                                    }

                                    //Orden inverso o no para ser mostrado
                                    if (req.body.inverso != "true" && req.body.inverso != true) {
                                        prods.reverse();
                                    }

                                    //Recorte o no de los productos a devolver
                                    var inicio = 0;
                                    if (req.body.inicio && !isNaN(parseInt(req.body.inicio))) {
                                        inicio = parseInt(req.body.inicio);
                                    }

                                    var fin = prods.length;

                                    if (req.body.fin && !isNaN(parseInt(req.body.fin))) {
                                        fin = parseInt(req.body.fin);
                                    }

                                    var numProds = prods.length;

                                    var catAux = prods.slice(inicio, fin);
                                    var devuelve = {array: catAux, total: numProds};

                                    res.send(devuelve);
                                }
                            });
                        }
                        if (prods.length <= 0)
                            res.json({array: prods, total: numTotal});
                    }
                });
            }else{
                res.json({array: [], total: 0});
            }
        }
    });

});

/* GET /listas/id */
router.get('/:id', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Lista.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* PUT /listas/:id */
router.put('/:id',/*compruebaScopes(['simple']),*/ function(req, res, next) {
    Lista.findById(req.params.id, function (err, post) {
        if (err) return next(err);

        if(req.body.name)
            post.name = req.body.name;

        if(req.body.importe)
            post.importe = req.body.importe;

        if(req.body.description)
            post.description = req.body.description;

        if(req.body.productos){
            if(typeof(req.body.productos) == "string"){
                var productosAux = JSON.parse(req.body.productos);
                post.productos.push(productosAux);
            }else{
                post.productos.push(req.body.productos);
            }
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

/* DELETE /listas/:id */
router.delete('/:id', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Lista.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
})

/* POST */
//Permite cambiar la cantidad del producto que se encuentra en la lista
router.post('/cambiarCantidadProducto',/*compruebaScopes(['simple']),*/ function(req, res, next) {
    Lista.findById(req.body.id_lista).exec(function (err, listas) {
        if (err) return next(err);
        if(listas!=null && !isNaN(parseInt(req.body.cantidad))){
            var objetoLista = listas.toObject();
            var cant;
            var prod = objetoLista.productos;
            var noEsta=true;
            for (var i = 0; i < prod.length; i++) {
                if (prod[i].prod_id == req.body.id_producto) {
                    noEsta=false;
                    cant = parseInt(listas.productos[i].cantidad) + parseInt(req.body.cantidad);
                    listas.productos[i].cantidad = cant.toString();
                    listas.save(function (err) {
                        if (err) {
                            res.send(false);
                        } else {
                            res.send(true);
                        }
                    });
                }else{
                    if(i==prod.length-1){
                        if(noEsta) {
                            res.send(false);
                        }
                    }
                }
            }
        }else {
            res.send(false);
        }
    });
});

//Elimina un producto de una lista
//Argumentos: id_producto, id_lista
router.post('/eliminarProductoLista',/*compruebaScopes(['simple']),*/ function(req, res, next) {
    if(req.body.id_producto!=null && req.body.id_producto!="" && req.body.id_lista!=null && req.body.id_lista!=""){
        Lista.findById(req.body.id_lista).exec(function (err, listas) {
            if (err) return next(err);
            if(listas!=null){
                //Recogemos los productos de la lista que se ha pasado por parametro
                var objetoLista = listas.toObject();
                var prod = objetoLista.productos;
                var noEsta=true;

                //Recorremos los productos
                for (var i = 0; i < prod.length; i++) {
                    //Comprobamos si algún producto coincide con el pasado por parametro
                    if (prod[i].prod_id == req.body.id_producto && noEsta==true) {
                        noEsta=false;
                        //Si el producto coincide, lo sacamos del array
                        listas.productos.pull(prod[i]);
                        listas.save(function (err) {
                            if (err) {
                                res.send(false);
                            } else {
                                res.send(true);
                            }
                        });
                    }else{
                        if(i==prod.length-1){
                            if(noEsta) {
                                res.send(false);
                            }
                        }
                    }
                }
            }else {
                res.send(false);
            }

        });
    }
});


// Devuelve las listas que se han realizado en el mes y anyo indicados y el total de usuarios registrados
// Argumentos: mes, anyo
router.post('/nuevasListas', function(req, res, next){
    Lista.find().exec(function(err, listas){
        if(!err){
            var tick = listas;

            if(req.body.mes!=null && !isNaN(parseInt(req.body.mes)) && req.body.anyo!=null && !isNaN(parseInt(req.body.anyo))){
                tick = filtrarPorFecha(req.body.mes, req.body.anyo, listas);
            }

            var devuelve = {
                nuevasListas: tick,
                totalListas: tick.length,
                mes: parseInt(req.body.mes),
                anyo: parseInt(req.body.anyo)
            }

            res.send(devuelve);
        }else{
            res.send([]);
        }
    });
});

function filtrarPorFecha(mes, anyo, array){
    var mes = parseInt(mes);
    var anyo = parseInt(anyo);

    var fechaAux;
    var mesAux, anyoAux;
    var devuelve = [];
    for(var i=0; i<array.length; i++){
        if(array[i].fecha!=null) {
            fechaAux = new Date(array[i].fecha);
            mesAux = fechaAux.getMonth();
            anyoAux = fechaAux.getFullYear();
        }
        else{
            mesAux = array[i].mes;
            anyoAux = array[i].anyo;
        }
        if(mesAux==mes && anyoAux==anyo){
            devuelve.push(array[i]);
        }
    }

    return devuelve;
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
var indicesIntroducidos = [];
function devuelveIndice(array, id){
    for(var i=0; i<array.length; i++){
        if(array[i].prod_id==id && indicesIntroducidos.indexOf(i)==-1) {
            indicesIntroducidos.push(i);
            return i;
        }
    }
}

function devuelvePrecioProductoEmpresa(catalogo, id_producto){
    for(var j=0; j<catalogo.length; j++){
        if(catalogo[j].prod_id == id_producto){
            return catalogo[j].precio;
        }
    }
    return -1;
}

function encuentraEmpresaIndice(array, id){
    for(var j=0; j<array.length; j++){
        if(array[j]._id == id){
            return array[j];
        }
    }
    return -1;
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

function compareName(a,b) {
    if (a.name > b.name)
        return -1;
    else if (a.name < b.name)
        return 1;
    else
        return 0;
}

function compareType(a,b) {
    if (a.type > b.type)
        return -1;
    else if (a.type < b.type)
        return 1;
    else
        return 0;
}

function comparePrecio(a,b) {
    if (a.precio > b.precio)
        return -1;
    else if (a.precio < b.precio)
        return 1;
    else
        return 0;
}

function compareEmpresa(a,b) {
    if (a.nombreEmpresa > b.nombreEmpresa)
        return -1;
    else if (a.nombreEmpresa < b.nombreEmpresa)
        return 1;
    else
        return 0;
}

module.exports = router;

