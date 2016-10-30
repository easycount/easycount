var express = require('express');
var router = express.Router();

var infoSistema = require('../models/infoSistema.js');

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
    infoSistema.find(function (err, info) {
        if (err) return next(err);
        res.json(info);
    });
});

/* POST /empresas */
router.post('/', /*compruebaScopes(['simple']),*/function(req, res, next) {
    infoSistema.create(req.body, function (err, info) {
        if (err) return next(err);
        res.json(info);
    });
});

/* POST /usuarios por elemento concreto */
router.post('/buscar', /*compruebaScopes(['simple']),*/function(req, res, next) {
    infoSistema.find(req.body,function (err, info) {
        if (err) return next(err);
        res.json(info);
    });
});

//Añade al log de la aplicación la información de una nueva entrada al sistema
//Argumentos: id_usuario, fecha, provider
router.post('/entradaAlSistema', /*compruebaScopes(['simple']),*/function(req, res, next) {
    infoSistema.find().exec(function (err, info) {
        if (err) return next(err);
        var objInfo = info[0];
        var usuario, fecha;

        if(req.body.id_usuario!=null && req.body.id_usuario!=""){
            usuario = req.body.id_usuario;
            var provider = "web";

            if(req.body.provider!=null){
                switch(req.body.provider){
                    case "twitter": provider = "twitter"; break;
                    case "google": provider = "google"; break;
                    default: provider = "web"; break;
                }
            }

            if(req.body.fecha!=null) {
                fecha = new Date(req.body.fecha);

                var devuelve = {usuario: usuario, fecha: fecha, provider: provider};
            }else{
                var devuelve = {usuario: usuario, provider: provider};
            }
            objInfo.entradasSistema.push(devuelve);
            objInfo.save(function(err){
                if(err) {
                    res.send(false);
                }else {
                    res.send(true);
                }
            });
        }else{
            res.send(false);
        }
    });
});


//Devuelve las entradas al sistema ordenadas por fecha y segmentadas por los valores de inicio y fin
//Argumentos: inicio, fin
router.post('/devuelveEntradasSistemaFecha', function(req, res, next){
    infoSistema.find().exec(function(err, info){
        var entradas = info[0].entradasSistema;

        var total = entradas.length;

        entradas.sort(compareFecha);

        var ini = 0, fin = entradas.length;
        if(req.body.inicio!=null && !isNaN(parseInt(req.body.inicio))){
            ini = parseInt(req.body.inicio);
        }
        if(req.body.fin!=null && !isNaN(parseInt(req.body.fin))){
            fin = parseInt(req.body.fin);
        }

        entradas = entradas.slice(ini, fin);

        res.send({
                arrayEntradas: entradas,
                total: total,
                totalGoogle: devuelveNumProvider(entradas, 'google'),
                totalTwitter: devuelveNumProvider(entradas, 'twitter'),
                totalWeb: devuelveNumProvider(entradas, 'web')
            });
    })
})

//Devuelve las entradas al sistema que se han producido, filtradas (si se desea) por provider, mes, y año
//Argumentos: provider, mes, año
router.post('/devuelveEntradasAlSistema', function(req, res, next){
   infoSistema.find().exec(function(err, info){
       var entradas = info[0].entradasSistema;

       if(req.body.mes!=null && !isNaN(parseInt(req.body.mes)) && req.body.anyo!=null && !isNaN(parseInt(req.body.anyo))){
           entradas = filtrarPorFecha(req.body.mes, req.body.anyo, entradas);
       }

       if(req.body.provider!=null && req.body.provider!=""){
           entradas = filtrarPorProvider(req.body.provider, entradas);
       }

       res.send({
           entradas: entradas,
           entradasWeb: devuelveNumProvider(entradas, 'web'),
           entradasGoogle: devuelveNumProvider(entradas, 'google'),
           entradasTwitter: devuelveNumProvider(entradas, 'twitter'),
           total: entradas.length,
           mes: parseInt(req.body.mes),
           anyo: parseInt(req.body.anyo)
       });
   })
});

function devuelveNumProvider(array, provider){
    var cont=0;
    for(var i=0; i<array.length; i++){
        if(array[i].provider==provider){
            cont++;
        }
    }
    return cont;
}

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

function filtrarPorProvider(prov, array){

    var devuelve = [];
    for(var i=0; i<array.length; i++){
        if(array[i].provider==prov){
            devuelve.push(array[i]);
        }
    }

    return devuelve;
}

//Aumenta en n (suma) el contador del mes y año que se indique. Si no está creado el contador para ese mes y año, lo crea
//Argumentos: mes, anyo, suma
router.post('/llamadaApi', /*compruebaScopes(['admin']),*/function(req, res, next) {
    infoSistema.find().exec(function (err, info) {
        if (err) return next(err);

        var objInfo = info[0];

        if(req.body.suma!=null && !isNaN(parseInt(req.body.suma)) && req.body.mes!=null && !isNaN(parseInt(req.body.mes)) && req.body.anyo!=null && !isNaN(parseInt(req.body.anyo)) ){
            var llamadas = objInfo.llamadasAPI;
            var realizado = false;
            for(var i=0; i<llamadas.length; i++){
                if(parseInt(llamadas[i].mes) == parseInt(req.body.mes) && parseInt(llamadas[i].anyo) == parseInt(req.body.anyo) ){
                    objInfo.llamadasAPI[i].contador = objInfo.llamadasAPI[i].contador + parseInt(req.body.suma);
                    realizado = true;
                }
            }

            if(realizado==false){
                objInfo.llamadasAPI.push({'contador': parseInt(req.body.suma), 'mes': parseInt(req.body.mes), 'anyo': parseInt(req.body.anyo)});
                realizado = true;
            }

            //objInfo.entradasSistema.push(devuelve);
            objInfo.save(function(err){
                if(err) {
                    res.send(false);
                }else {
                    res.json(true);
                }
            });
        }else{
            res.send(false);
        }
    });
});

//Devuelve llamadas a la API
//Argumentos: mes, anyo
router.post('/devuelveLlamadasApi', function(req, res, next){
    infoSistema.find().exec(function(err, info){
        var entradas = info[0].llamadasAPI;

        if(req.body.mes!=null && !isNaN(parseInt(req.body.mes)) && req.body.anyo!=null && !isNaN(parseInt(req.body.anyo))){
            entradas = filtrarPorFecha(req.body.mes, req.body.anyo, entradas);
            if(entradas[0]!=null) {
                entradas = entradas[0];
            }else{
                entradas = {contador:0, mes: parseInt(req.body.mes), anyo: parseInt(req.body.anyo)};
            }
        }

        res.send(entradas);
    })
});

//Devuelve llamadas a la API falladas
//Argumentos: mes, anyo
router.post('/devuelveLlamadasApiFalladas', function(req, res, next){
    infoSistema.find().exec(function(err, info){
        var entradas = info[0].llamadasFalladasAPI;

        if(req.body.mes!=null && !isNaN(parseInt(req.body.mes)) && req.body.anyo!=null && !isNaN(parseInt(req.body.anyo))){
            entradas = filtrarPorFecha(req.body.mes, req.body.anyo, entradas);
            if(entradas[0]!=null) {
                entradas = entradas[0];
            }else{
                entradas = {contador:0, mes: parseInt(req.body.mes), anyo: parseInt(req.body.anyo)};
            }
        }
        res.send(entradas);
    })
});


//Aumenta en n (suma) el contador del mes y año que se indique. Si no está creado el contador para ese mes y año, lo crea
//Argumentos: mes, anyo, suma
router.post('/llamadaApiFalladas', /*compruebaScopes(['admin']),*/function(req, res, next) {
    infoSistema.find().exec(function (err, info) {
        if (err) return next(err);

        var objInfo = info[0];

        if(req.body.suma!=null && !isNaN(parseInt(req.body.suma)) && req.body.mes!=null && !isNaN(parseInt(req.body.mes)) && req.body.anyo!=null && !isNaN(parseInt(req.body.anyo)) ){
            var llamadas = objInfo.llamadasFalladasAPI;
            var realizado = false;
            for(var i=0; i<llamadas.length; i++){
                if(parseInt(llamadas[i].mes) == parseInt(req.body.mes) && parseInt(llamadas[i].anyo) == parseInt(req.body.anyo) ){
                    objInfo.llamadasFalladasAPI[i].contador = objInfo.llamadasFalladasAPI[i].contador + parseInt(req.body.suma);
                    realizado = true;
                }
            }

            if(realizado==false){
                objInfo.llamadasFalladasAPI.push({'contador': parseInt(req.body.suma), 'mes': parseInt(req.body.mes), 'anyo': parseInt(req.body.anyo)});
                realizado = true;
            }

            //objInfo.entradasSistema.push(devuelve);
            objInfo.save(function(err){
                if(err) {
                    res.send(false);
                }else {
                    res.json(true);
                }
            });
        }else{
            res.send(false);
        }
    });
});

//Devuelve el número de nuevas valoraciones que se han realizado
//Argumentos: mes, anyo
router.post("/devuelveNumValoraciones", function(req, res, next){
    infoSistema.find().exec(function(err, info){
        if(!err) {
            var info = info[0];
            var valoraciones = info.valoraciones;
            if (req.body.mes != null && !isNaN(parseInt(req.body.mes)) && req.body.anyo != null && !isNaN(parseInt(req.body.anyo))) {
                valoraciones = filtrarPorFecha(req.body.mes, req.body.anyo, valoraciones);

                if(valoraciones[0]!=null) {
                    valoraciones = valoraciones[0];
                }else{
                    valoraciones = {contador:0, mes: parseInt(req.body.mes), anyo: parseInt(req.body.anyo)};
                }
            }
            res.send(valoraciones);
        }else{
            res.send([]);
        }
    })
});

//Devuelve el número de nuevas opiniones que se han realizado
//Argumentos: mes, anyo
router.post("/devuelveNumOpiniones", function(req, res, next){
    infoSistema.find().exec(function(err, info){
        if(!err) {
            var info = info[0];
            var opiniones = info.opiniones;
            if (req.body.mes != null && !isNaN(parseInt(req.body.mes)) && req.body.anyo != null && !isNaN(parseInt(req.body.anyo))) {
                opiniones = filtrarPorFecha(req.body.mes, req.body.anyo, opiniones);

                if(opiniones[0]!=null) {
                    opiniones = opiniones[0];
                }else{
                    opiniones = {contador:0, mes: parseInt(req.body.mes), anyo: parseInt(req.body.anyo)};
                }
            }
            res.send(opiniones);
        }else{
            res.send([]);
        }
    })
});

//Aumenta en n (suma) el contador del mes y año que se indique. Si no está creado el contador para ese mes y año, lo crea
//Argumentos: mes, anyo, suma
router.post('/infoValoraciones', /*compruebaScopes(['admin']),*/function(req, res, next) {
    infoSistema.find().exec(function (err, info) {
        if (err) return next(err);

        var objInfo = info[0];

        if(req.body.suma!=null && !isNaN(parseInt(req.body.suma)) && req.body.mes!=null && !isNaN(parseInt(req.body.mes)) && req.body.anyo!=null && !isNaN(parseInt(req.body.anyo)) ){
            var llamadas = objInfo.valoraciones;
            var realizado = false;
            for(var i=0; i<llamadas.length; i++){
                if(parseInt(llamadas[i].mes) == parseInt(req.body.mes) && parseInt(llamadas[i].anyo) == parseInt(req.body.anyo) ){
                    objInfo.valoraciones[i].contador = objInfo.valoraciones[i].contador + parseInt(req.body.suma);
                    realizado = true;
                }
            }

            if(realizado==false){
                objInfo.valoraciones.push({'contador': parseInt(req.body.suma), 'mes': parseInt(req.body.mes), 'anyo': parseInt(req.body.anyo)});
                realizado = true;
            }

            //objInfo.entradasSistema.push(devuelve);
            objInfo.save(function(err){
                if(err) {
                    res.send(false);
                }else {
                    res.json(true);
                }
            });
        }else{
            res.send(false);
        }
    });
});



//Aumenta en n (suma) el contador del mes y año que se indique. Si no está creado el contador para ese mes y año, lo crea
//Argumentos: mes, anyo, suma
router.post('/infoOpiniones', /*compruebaScopes(['admin']),*/function(req, res, next) {
    infoSistema.find().exec(function (err, info) {
        if (err) return next(err);

        var objInfo = info[0];

        if(req.body.suma!=null && !isNaN(parseInt(req.body.suma)) && req.body.mes!=null && !isNaN(parseInt(req.body.mes)) && req.body.anyo!=null && !isNaN(parseInt(req.body.anyo)) ){
            var llamadas = objInfo.opiniones;
            var realizado = false;
            for(var i=0; i<llamadas.length; i++){
                if(parseInt(llamadas[i].mes) == parseInt(req.body.mes) && parseInt(llamadas[i].anyo) == parseInt(req.body.anyo) ){
                    objInfo.opiniones[i].contador = objInfo.opiniones[i].contador + parseInt(req.body.suma);
                    realizado = true;
                }
            }

            if(realizado==false){
                objInfo.opiniones.push({'contador': parseInt(req.body.suma), 'mes': parseInt(req.body.mes), 'anyo': parseInt(req.body.anyo)});
                realizado = true;
            }

            //objInfo.entradasSistema.push(devuelve);
            objInfo.save(function(err){
                if(err) {
                    res.send(false);
                }else {
                    res.json(true);
                }
            });
        }else{
            res.send(false);
        }
    });
});

/* GET /empresas/id */
router.get('/:id', /*compruebaScopes(['simple']),*/function(req, res, next) {
    infoSistema.findById(req.params.id, function (err, info) {
        if (err) return next(err);
        res.json(info);
    });
});

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


