var express = require('express');
var router = express.Router();

var Usuario = require('../models/Usuario.js');
var Establecimiento = require('../models/Establecimiento.js');
var Ticket = require('../models/Ticket.js');
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
/* GET /promociones listing. */
router.get('/', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Ticket.find(function (err, tickets) {
        if (err) return next(err);
        res.json(tickets);
    });
});

//Devuelve todos los tickets de la BBDD junto a nombreUsuario, nombreEmpresa, nombreEstablecimiento
router.get('/todosTickets', /*compruebaScopes(['admin']),*/function(req, res, next){
    Ticket.find().lean().exec(function(err, tickets){
        if(err){
            res.send([]);
        }else{
            var allUsuarios = [], allEmpresas = [], allEstablecimientos = [];
            //Buscamos los usuarios para asociar sus nombres a los tickets
            Usuario.find().exec(function(err, usuarios){
                if(err){
                    res.send([]);
                }else{
                    allUsuarios = usuarios;

                    Empresa.find().exec(function(err, empresas){
                        if(err){
                            res.send([]);
                        }else{
                            allEmpresas = empresas;

                            Establecimiento.find().exec(function(err, establecimientos){
                                if(err){
                                    res.send([]);
                                }else{
                                    allEstablecimientos = establecimientos;
                                    var indiceUsu = -1, indiceEmp = -1, indiceEst = -1;
                                    for(var t=0; t<tickets.length; t++){
                                        indiceUsu = encuentraEmpresaIndice(usuarios, tickets[t].usuario);
                                        if(indiceUsu!=-1 && indiceUsu!=null){
                                            tickets[t]['nombreUsuario'] = indiceUsu.name;
                                        }
                                        indiceEmp = encuentraEmpresaIndice(empresas, tickets[t].empresa);
                                        if(indiceEmp!=-1 && indiceEmp!=null){
                                            tickets[t]['nombreEmpresa'] = indiceEmp.name;
                                        }
                                        indiceEst = encuentraEmpresaIndice(establecimientos, tickets[t].establecimiento);
                                        if(indiceEst!=-1 && indiceEst!=null){
                                            tickets[t]['nombreEstablecimiento'] = indiceEst.name;
                                        }
                                    }

                                    res.send(tickets);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
})

/* POST /promociones */
router.post('/', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Ticket.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

router.post('/buscar', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Ticket.find(req.body,function (err, tickets) {
        if (err) return next(err);
        tickets.sort(compareFecha);
        //tickets.reverse();
        res.json(tickets);
    });
});

/* GET /promociones/id */
router.get('/:id', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Ticket.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* PUT /promociones/:id */
router.put('/:id', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Ticket.findById(req.params.id, function (err, post) {
        if (err) return next(err);

        if(req.body.importe)
            post.importe = req.body.importe;

        if(req.body.fecha)
            post.fecha = req.body.fecha;

        if(req.body.empresa)
            post.empresa = req.body.empresa;

        if(req.body.usuario)
            post.usuario = req.body.usuario;

        if(req.body.establecimiento)
            post.establecimiento = req.body.establecimiento;

        if(req.body.productos)
            post.productos.push(req.body.productos);

        post.save(function(err){
            if(err) {
                res.send(err);
            }else {
                res.json(post);
            }
        });
    });
});

/* POST /ticket por elemento concreto */
//
//router.post('/buscar', /*compruebaScopes(['simple']),*/function(req, res, next) {
//    Ticket.find(req.body,function (err, tickets) {
//        if (err) return next(err);
//        res.json(tickets);
//    });
//});


//Devuelve los tickets del usuario indicado filtrados por supermercado (si se desea) y con la cifra de inicio y fin del array
//Argumentos: id_usuario, inicio, cantidad, empresa (opcional)
router.post('/ticketsUsuario', /*compruebaScopes(['simple']),*/function(req, res, next){
    Ticket.find({'usuario': req.body.id_usuario}).lean().exec(function(err, tickets){
        if (err) return next(err);
        if(tickets!=null) {
            var devuelve = tickets;
            var numTotal = tickets.length;
            devuelve.sort(compareFecha);
            Empresa.find().exec(function (err, indiceEmpresas) {
                var empresaAux;
                var arrayAux = [];
                for (var r = 0; r < devuelve.length; r++) {
                    empresaAux = encuentraEmpresaIndice(indiceEmpresas, devuelve[r].empresa);
                    if (empresaAux != -1) {
                        devuelve[r]['fotoEmpresa'] = empresaAux.photo;
                        devuelve[r]['nombreEmpresa'] = empresaAux.name;
                        if (req.body.empresa != null && req.body.empresa == empresaAux._id) {
                            arrayAux.push(devuelve[r]);
                        }
                    }
                    if (req.body.empresa != null && r >= tickets.length - 1) {
                        devuelve = arrayAux;
                    }
                }
                if (req.body.inicio != null && !isNaN(parseInt(req.body.inicio)) && req.body.cantidad != null && !isNaN(parseInt(req.body.cantidad))) {
                    devuelve = tickets.slice(parseInt(req.body.inicio), parseInt(req.body.cantidad));
                }
                res.json({array: devuelve, total: numTotal});
            });
        }
    });
});


/* DELETE /usuarios/:id */
router.delete('/:id', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Ticket.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/***************************************************** FUNCIONES CUSTOM *******************************************************************************/

//
//Argumentos: id_usuario, mes, anyo
router.post('/dameTicketsMesUsuario', /*compruebaScopes(['simple']),*/function(req, res, next) {
    if(req.body.id_usuario!=null && req.body.mes!=null && !isNaN(parseInt(req.body.mes)) && req.body.anyo!=null && !isNaN(parseInt(req.body.anyo))) {
        var fechaIni = new Date(parseInt(req.body.anyo), parseInt(req.body.mes), 1);
        var fechaFin = new Date(fechaIni);

        fechaFin.setMonth(fechaFin.getMonth() + 1);

        Ticket.find({usuario: req.body.id_usuario, fecha: {"$gte": fechaIni, "$lt": fechaFin}}).exec(function (err, allTickets) {
            if(!err && allTickets!=null)
                res.send(allTickets);
            else
                res.send([]);
        });
    }else{
        res.send([]);
    }
});

//Argumentos: id_usuario, mes, anyo
router.post('/dameImporteAcumuladoMesUsuario', /*compruebaScopes(['simple']),*/function(req, res, next) {

    if(req.body.id_usuario!=null && req.body.mes!=null && !isNaN(parseInt(req.body.mes)) && req.body.anyo!=null && !isNaN(parseInt(req.body.anyo))) {
        var fechaIni = new Date(parseInt(req.body.anyo), parseInt(req.body.mes), 1);
        var fechaFin = new Date(fechaIni);

        fechaFin.setMonth(fechaFin.getMonth() + 1);

        Ticket.find({
            usuario: req.body.id_usuario,
            fecha: {"$gte": fechaIni, "$lt": fechaFin}
        }).exec(function (err, allTickets) {
            if (!err && allTickets != null) {
                var total = 0.0;
                for(var i=0; i<allTickets.length;i++){
                    total += allTickets[i].importe;
                }

                res.send(total.toFixed(2).toString());
            }
            else
                res.send(0);
        });
    }

    /*
     Ticket.find({usuario:req.body.id_usuario}).lean().exec(function (err, allTickets) {
     if (err) return next(err);
     var retorno = 0.0;
     var fechaAux;
     var cont=0;
     if(allTickets!=null) {
     for(var i=0; i<allTickets.length; i++){
     cont++;
     fechaAux = new Date(allTickets[i].fecha);
     if(fechaAux.getMonth()==req.body.mes && fechaAux.getFullYear()==req.body.anyo){

     retorno += allTickets[i].importe;
     }

     if(cont>=allTickets.length){
     res.send(retorno.toFixed(2).toString());
     }
     }
     }else
     res.send(false);
     });
     */
});

//Argumentos: id_usuario, anyo
router.post('/dameImporteAcumuladoAnyoUsuario', /*compruebaScopes(['simple']),*/function(req, res, next) {
    Ticket.find({usuario:req.body.id_usuario}).lean().exec(function (err, allTickets) {
        if (err) return next(err);
        var retorno = 0;
        var fechaAux;
        var cont=0;
        if(allTickets!=null) {
            for(var i=0; i<allTickets.length; i++){
                cont++;
                fechaAux = new Date(allTickets[i].fecha);
                if(fechaAux.getFullYear()==req.body.anyo){
                    retorno += parseFloat(allTickets[i].importe);
                }

                if(cont>=allTickets.length){
                    res.send(retorno.toFixed(2).toString());
                }
            }
        }else
            res.send(false);
    });
});


// Devuelve los usuarios que se han registrado en el mes y anyo indicados y el total de usuarios registrados
// Argumentos: mes, anyo
router.post('/nuevosTickets', function(req, res, next){
    Ticket.find().exec(function(err, tickets){
        if(!err){
            var total=tickets.length;
            var tick = tickets;

            if(req.body.mes!=null && !isNaN(parseInt(req.body.mes)) && req.body.anyo!=null && !isNaN(parseInt(req.body.anyo))){
                tick = filtrarPorFecha(req.body.mes, req.body.anyo, tickets);
            }

            var devuelve = {
                nuevosTickets: tick,
                totalTickets: tick.length,
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

function encuentraEmpresaIndice(array, id){
    for(var j=0; j<array.length; j++){
        if(array[j]._id == id){
            return array[j];
        }
    }
    return -1;
}


module.exports = router;