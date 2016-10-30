
angular.module('sbAdminApp')
    .controller('algoritmoCtrl', ['$http','$scope', '$timeout','Productos','Empresa','Usuarios','DataEmpresa','Tickets','DataUsuario', function ($http, $scope, $timeout, Productos, Empresa, Usuarios, DataEmpresa, Tickets, DataUsuario) {
        var vm = this;
        var objProductos;
        var objCatalogoEmpresa = [];
        var infoTipos = [];
        var infoProductos = [];
        var objUsuarios = [];
        var objTickets = [];
        var itemsProcessed = 0;
        var segundoContador = 0;


        vm.iniciarAlgoritmo = function () {
            console.log("Iniciando Algoritmo");
            console.log("Actualizando estadísticas");
            //vm.calcularEstadisticas();
            vm.cargarUsuarios();
        }
        //
        //vm.calcularEstadisticas = function () {
        //    vm.calculaValMediaProductos();
        //    vm.calculaValMediaEmpresaProductos();
        //}
        //
        ///**
        // * TODO:
        // * - Las funciones de actualizar bbdd solo sirven para crear, no actualiza (se deberia seguir algun criterio, para no petar la BBDD en las pruebas)
        // * - Añadir datos sobre opiniones a DataEmpresa
        // */
        ///**
        // *
        // * CÁLCULO DE ESTADÍSTICAS CORRESPONDIENTES A EMPRESAS
        // * Se calcula para cada empresa:
        // * - Valoraciones medias de todos los productos por empresa y en total
        // * - Numero de veces que se compra cada producto en la empresa
        // * - Valoraciones medias de los diferentes tipos de productos por empresa y en total
        // * - Numero de productos comprados de un tipo de producto en la empresa
        // *
        // */
        //
        //
        ///**
        // * Calcula la valoración media de los productos en el sistema y se los guarda (no tiene en cuenta empresa)
        // */
        //vm.calculaValMediaProductos = function () {
        //    var responseValMedia = Productos.query();
        //    responseValMedia.$promise.then(function (data) {
        //        objProductos = data;
        //        for (var i = 0; i < objProductos.length; i++) {
        //            if (objProductos[i].valoraciones.length > 0) {
        //                var total = 0;
        //
        //                for (var j = 0; j < objProductos[i].valoraciones.length; j++) {
        //                    total += objProductos[i].valoraciones[j].puntuacion;
        //                }
        //                infoProductos[i] = [];
        //                infoProductos[i]['idprod'] = objProductos[i]._id;
        //                infoProductos[i]['name'] = objProductos[i].name;
        //                infoProductos[i]['tipo'] = objProductos[i].type;
        //                infoProductos[i]['valMedTotal'] = total / objProductos[i].valoraciones.length;
        //            } else {
        //                infoProductos[i] = [];
        //                infoProductos[i]['idprod'] = objProductos[i]._id;
        //                infoProductos[i]['name'] = objProductos[i].name;
        //                infoProductos[i]['tipo'] = objProductos[i].type;
        //                infoProductos[i]['valMedTotal'] = 0;
        //            }
        //        }
        //        console.log("Valoraciones media totales calculada");
        //    }, function (err) {
        //        console.log("Error en calculaValMediaProductos por " + err);
        //    });
        //}
        //
        ///**
        // * Recorre las distintas empresas del sistema y llama a calculaValoracionesEmpresaProductos
        // */
        //vm.calculaValMediaEmpresaProductos = function () {
        //    var responseValMediaEmpresa = Empresa.query();
        //    responseValMediaEmpresa.$promise.then(function (data) {
        //        for (var i = 0; i < data.length; i++) {
        //            vm.calculaValoracionesEmpresaProductos(i, data[i].catalogo, data[i]._id.toString())
        //        }
        //    }, function (err) {
        //        console.log("Error en calculaValMediaEmpresaProductos por " + err);
        //    })
        //}
        //
        ///**
        // * Crea un array de objetos de Empresa, que se utilizará para almacenar las estadísticas calculadas (objCatalogoEmpresa)
        // * @param indice - del array de empresas
        // * @param productos - catalogo de productos de la empresa
        // * @param idempresa - identificador de la empresa
        // */
        //vm.calculaValoracionesEmpresaProductos = function (indice, productos, idempresa) {
        //    objCatalogoEmpresa[indice] = productos;
        //    objCatalogoEmpresa[indice]['empresa'] = idempresa;
        //
        //    for (var i = 0; i < productos.length; i++) {
        //        vm.anyadeValMediaACatalogo(indice, i, productos, idempresa);
        //    }
        //}
        //
        ///**
        // * Calcula las valoraciones media de cada uno de los productos de cada una de las empresas y las guarda en el objCatalogoEmpresa
        // * @param indice
        // * @param i
        // * @param productos
        // * @param idempresa
        // */
        //vm.anyadeValMediaACatalogo = function (indice, i, productos, idempresa) {
        //    var total, media, empresa, divisor;
        //
        //    var responseProductoEmpresa = Productos.get({id: productos[i].prod_id});
        //    responseProductoEmpresa.$promise.then(function (data) {
        //        itemsProcessed++;
        //        total = 0;
        //        divisor=0;
        //        if(data.valoraciones) {
        //            for (var j = 0; j < data.valoraciones.length; j++) {
        //                empresa = data.valoraciones[j].empresa;
        //                if (empresa && empresa.localeCompare(idempresa) == 0) {
        //                    total += data.valoraciones[j].puntuacion;
        //                    divisor++;
        //                }
        //            }
        //        }
        //        if (divisor > 0) {
        //            media = total / divisor;
        //        } else {
        //            media = 0;
        //        }
        //        if(i>=0 && i<productos.length){
        //            objCatalogoEmpresa[indice][i]['valMedEmpresa'] = media;
        //            objCatalogoEmpresa[indice][i]['numValoraciones'] = divisor;
        //            if(data.valoraciones)
        //                objCatalogoEmpresa[indice][i]['numValTotal'] = data.valoraciones.length;
        //        }
        //        if(itemsProcessed == productos.length - 1) {
        //            vm.calculaVecesComprado();
        //            console.log("Valoracion media de producto en empresa calculada");
        //        }
        //
        //    },function(err){
        //        console.log("Error en anyadeValMediaACatalogo por " + err);
        //    });
        //}
        //
        ///**
        // * Recorre objCatalogoEmpresa, para empezar a añadir el numero de veces que se ha comprado un producto
        // */
        //vm.calculaVecesComprado = function(){
        //    for(var i = 0;i<objCatalogoEmpresa.length;i++){
        //        for(var j=0;j<objCatalogoEmpresa[i].length;j++){
        //            vm.vecesCompradoProducto(objCatalogoEmpresa[i][j].prod_id, objCatalogoEmpresa[i].empresa);
        //        }
        //    }
        //}
        //
        ///**
        // * Recorre todas las compras que se han hecho por los usuarios contando las veces que se ha comprado el producto pasado
        // * en la empresa pasada
        // * @param idprod
        // * @param idempresa
        // */
        //vm.vecesCompradoProducto = function(idprod, idempresa){
        //    var responseUsuarios = Usuarios.query();
        //    responseUsuarios.$promise.then(function(data){
        //        var vecesComprado = 0;
        //        for(var i=0;i<data.length;i++){
        //            for(var j=0; j<data[i].productos.length; j++){
        //                var empresa = data[i].productos[j].empresa;
        //                if(idprod.localeCompare(data[i].productos[j].id_prod) == 0 && empresa && empresa.localeCompare(idempresa) == 0)
        //                    vecesComprado += data[i].productos[j].cantidad;
        //            }
        //        }
        //        vm.anyadeVecesComprado(idprod,idempresa,vecesComprado);
        //        console.log("id: "+idprod+" emp: "+idempresa+" cant: "+vecesComprado);
        //        var numObjetos = 0;
        //        for(var z = 0;z<objCatalogoEmpresa.length;z++){
        //            numObjetos += objCatalogoEmpresa[z].length;
        //        }
        //        if(segundoContador == numObjetos)
        //            vm.actualizaInfoProductos();
        //    });
        //
        //}
        //
        ///**
        // * Añade el valor calculado por vm.vecesCompradoProducto() en objCatalogoEmpresa
        // * @param idprod
        // * @param idempresa
        // * @param vecesComprado
        // */
        //vm.anyadeVecesComprado = function(idprod, idempresa, vecesComprado){
        //    for(var i=0;i<objCatalogoEmpresa.length;i++){
        //        if(objCatalogoEmpresa[i].empresa == idempresa){
        //            for(var j=0;j<objCatalogoEmpresa[i].length;j++){
        //                if(objCatalogoEmpresa[i][j].prod_id == idprod){
        //                    segundoContador++;
        //                    objCatalogoEmpresa[i][j]['vecesComprado'] = vecesComprado;
        //                }
        //            }
        //        }
        //    }
        //}
        //
        ///**
        // * Sube las estadísticas calculadas a la coleccion DataEmpresa de la BBDD
        // */
        //vm.actualizaInfoProductos = function(){
        //
        //    vm.asociaValTotalAProductoEmpresa();
        //
        //    //for(var i=0; i<objCatalogoEmpresa.length; i++){
        //    //    var nuevoDataEmpresa = new DataEmpresa ({empresa: objCatalogoEmpresa[i].empresa, infoProductos: objCatalogoEmpresa[i], infoTipos: infoTipos[i]});
        //    //    nuevoDataEmpresa.$save(function(data){
        //    //        console.log("Datos de la empresa "+data.empresa+" actualizados");
        //    //    }, function(err){
        //    //        console.log(err);
        //    //    });
        //    //}
        //
        //}
        //
        ///**
        // * Para cada producto en objCatalogoEmpresa añade la valoración total en el sistema (guardada en infoProductos previamente)
        // * y el tipo del producto
        // */
        //vm.asociaValTotalAProductoEmpresa = function(){
        //    for(var i=0; i<objCatalogoEmpresa.length; i++){
        //        for(var j=0; j<objCatalogoEmpresa[i].length; j++){
        //            for(var k=0; k<infoProductos.length; k++){
        //                if(objCatalogoEmpresa[i][j].prod_id == infoProductos[k].idprod) {
        //                    objCatalogoEmpresa[i][j]['valMedTot'] = infoProductos[k].valMedTotal;
        //                    objCatalogoEmpresa[i][j]['tipo'] = infoProductos[k].tipo;
        //                }
        //            }
        //        }
        //    }
        //    console.log("Añadidas Valoraciones totales a productos");
        //    vm.calculaInfoTipos();
        //
        //}
        //
        ///**
        // * Recorre objCatalogoEmpresa leyendo el tipo y pasando valoraciones y veces que ha sido comprado el producto a anyadeOSumaTipo
        // */
        //vm.calculaInfoTipos = function(){
        //    console.log(objCatalogoEmpresa);
        //    for(var i= 0;i<objCatalogoEmpresa.length;i++){
        //        infoTipos[i] = [];
        //        for(var j=0;j<objCatalogoEmpresa[i].length;j++){
        //            vm.anyadeOSumaTipo(i,objCatalogoEmpresa[i][j].tipo, objCatalogoEmpresa[i][j].valMedEmpresa, objCatalogoEmpresa[i][j].numValoraciones, objCatalogoEmpresa[i][j].vecesComprado, objCatalogoEmpresa[i][j].valMedTot, objCatalogoEmpresa[i][j].numValTotal);
        //        }
        //    }
        //    console.log("Calculadas estadísticas DataEmpresa");
        //    vm.iniciaEstadisticasUsuario();
        //
        //}
        //
        ///**
        // * Recibe un tipo de producto y comprueba si ya está almacenado en infoTipos para esa empresa.
        // * Si está ya, recalcula las valoraciones medias y el numero de productos comprados de ese tipo
        // * Si no está, lo añade con los datos del producto pasado
        // * @param empresa
        // * @param tipo
        // * @param valMed
        // * @param numVal
        // * @param vecesComprado
        // * @param valMedTot
        // * @param numValTotal
        // */
        //vm.anyadeOSumaTipo = function(empresa, tipo, valMed, numVal, vecesComprado, valMedTot, numValTotal){
        //    var encontrado = false;
        //    var indice = infoTipos[empresa].length;
        //    for(var i=0;i<infoTipos[empresa].length;i++){
        //        if(infoTipos[empresa][i].tipo == tipo){
        //            encontrado = true;
        //            indice = i;
        //            break;
        //        }
        //    }
        //
        //    if(encontrado){
        //        var aux= (infoTipos[empresa][indice].numValoraciones*infoTipos[empresa][indice].valMedTipo) + (numVal*valMed);
        //        infoTipos[empresa][indice].numValoraciones += numVal;
        //        infoTipos[empresa][indice].valMedTipo = aux/infoTipos[empresa][indice].numValoraciones;
        //
        //        aux = ( infoTipos[empresa][indice].numValoracionesTotal*infoTipos[empresa][indice].numValoracionesTotal) + (numValTotal*valMedTot);
        //        infoTipos[empresa][indice].numValoracionesTotal += numValTotal;
        //        infoTipos[empresa][indice].valMedTipoTotal = aux/infoTipos[empresa][indice].numValoracionesTotal;
        //
        //        infoTipos[empresa][indice].numProductosComprados += vecesComprado;
        //
        //    }else{
        //        infoTipos[empresa][indice] = {};
        //        infoTipos[empresa][indice]['tipo'] = tipo;
        //        infoTipos[empresa][indice]['valMedTipo'] = valMed;
        //        infoTipos[empresa][indice]['numValoraciones'] = numVal;
        //        infoTipos[empresa][indice]['valMedTipoTotal'] = valMedTot;
        //        infoTipos[empresa][indice]['numValoracionesTotal'] = numValTotal;
        //        infoTipos[empresa][indice]['numProductosComprados'] = vecesComprado;
        //
        //    }
        //}
        //
        ///**
        // *
        // * CÁLCULO DE ESTADÍSTICAS CORRESPONDIENTES A USUARIOS
        // * Se calcula para cada usuario:
        // * - Gasto medio por mes
        // * - Gasto medio por año
        // * - Gasto medio por compra por mes y año
        // */
        //
        ///**
        // * Carga en objUsuarios todos los usuarios del sistema
        // */
        //vm.iniciaEstadisticasUsuario = function(){
        //    var responseEstadisticasUsuario = Usuarios.query();
        //    responseEstadisticasUsuario.$promise.then(function(data){
        //        for(var i=0;i<data.length;i++){
        //            objUsuarios[i] = {};
        //            objUsuarios[i]['usuario'] = data[i]._id;
        //        }
        //        vm.iniciaTickets();
        //    },function(err){
        //        console.log("Error en iniciaEstadisticasUsuario por "+err);
        //    });
        //}
        //
        ///**
        // * Carga en objTickets todos los tickets del sistema
        // */
        //vm.iniciaTickets = function(){
        //    var responseTickets = Tickets.query();
        //    responseTickets.$promise.then(function(data){
        //        objTickets = data;
        //        vm.recopilarTicketsUsuarios();
        //    },function(err){
        //        console.log("Error en iniciaTickets por "+err);
        //    });
        //}
        //
        ///**
        // * Añade a cada usuario de objUsuarios sus tickets (lo que tienen como referencia ese usuario) en un nuevo campo
        // */
        //vm.recopilarTicketsUsuarios = function(){
        //    for(var i=0;i<objUsuarios.length;i++){
        //        for(var j=0; j<objTickets.length;j++){
        //            if(objUsuarios[i].usuario == objTickets[j].usuario) {
        //                if(objUsuarios[i].tickets){
        //                    objUsuarios[i].tickets.push(objTickets[j]);
        //                }else{
        //                    objUsuarios[i]['tickets'] = [];
        //                    objUsuarios[i].tickets.push(objTickets[j]);
        //                }
        //            }
        //        }
        //    }
        //    vm.analizaDatosUsuarios();
        //}
        //
        ///**
        // * Realiza los cálculos de los gastos de cada usuario, por mes y año y los almacena en objUsuarios
        // */
        //vm.analizaDatosUsuarios = function(){
        //    var data,mes,anyo, objeto, encontrado, indice;
        //    for(var i=0;i<objUsuarios.length;i++){
        //        if(objUsuarios[i].tickets){
        //            objUsuarios[i]['gastos'] = [];
        //            for(var j=0;j<objUsuarios[i].tickets.length;j++){
        //                data = new Date(objUsuarios[i].tickets[j].fecha);
        //                mes = data.getMonth();
        //                anyo = data.getFullYear();
        //                objeto = {mes: mes, año: anyo, importe: objUsuarios[i].tickets[j].importe};
        //                encontrado = false;
        //                indice = 0;
        //                for(var z=0;z<objUsuarios[i].gastos.length;z++){
        //                    if(objUsuarios[i].gastos[z].mes == mes && objUsuarios[i].gastos[z].año == anyo) {
        //                        encontrado = true;
        //                        indice = z;
        //                        break;
        //                    }
        //
        //                }
        //                if(encontrado){
        //                    objUsuarios[i].gastos[indice].importe += objUsuarios[i].tickets[j].importe;
        //                    objUsuarios[i].gastos[indice].numCompras += 1;
        //                }else{
        //                    indice = objUsuarios[i].gastos.length;
        //                    objUsuarios[i].gastos[indice] = {};
        //                    objUsuarios[i].gastos[indice]['mes'] = mes;
        //                    objUsuarios[i].gastos[indice]['año'] = anyo;
        //                    objUsuarios[i].gastos[indice]['importe'] = objUsuarios[i].tickets[j].importe;
        //                    objUsuarios[i].gastos[indice]['numCompras'] = 1;
        //                }
        //                //objUsuarios[i].gastos.push(objeto);
        //                //LOS MESES EMPIEZAN EN 0
        //            }
        //        }
        //    }
        //    vm.calculaGastoMensualYAnual();
        //}
        //
        ///**
        // * Según los datos en objUsuario, calcula la media de gastos mensual y anual
        // */
        //vm.calculaGastoMensualYAnual= function(){
        //    var mediaMensual;
        //    var mediaAnual, max;
        //    for(var i=0;i<objUsuarios.length;i++){
        //        if(objUsuarios[i].gastos){
        //            mediaMensual=0;
        //            mediaAnual=0;
        //            if(objUsuarios[i].gastos.length >= 12)
        //                max = 12;
        //            else
        //                max = objUsuarios[i].gastos.length;
        //
        //            for(var j=0;j<max;j++){
        //                mediaAnual += objUsuarios[i].gastos[j].importe;
        //            }
        //            mediaMensual = mediaAnual/max;
        //            objUsuarios[i]['gastoMedioMensual'] = mediaMensual;
        //            objUsuarios[i]['gastoMedioAnual'] = mediaAnual;
        //        }else{
        //            objUsuarios[i]['gastoMedioMensual'] = 0;
        //            objUsuarios[i]['gastoMedioAnual'] = 0;
        //            objUsuarios[i]['gastos'] = [];
        //            objUsuarios[i]['tickets'] = [];
        //        }
        //    }
        //    console.log(objUsuarios);
        //    vm.actualizaDataUsuario();
        //
        //}
        //
        ///**
        // * Actualiza la coleccion DataUsuario de la BBDD, con los nuevos datos calculados
        // */
        //vm.actualizaDataUsuario = function(){
        //    for(var i=0;i<objUsuarios.length;i++){
        //        var nuevoDataUsuario = new DataUsuario({usuario: objUsuarios[i].usuario,gastoMedioMensual: objUsuarios[i].gastoMedioMensual, gastoMedioAnual: objUsuarios[i].gastoMedioAnual, gastos: objUsuarios[i].gastos});
        //        nuevoDataUsuario.$save(function(data){
        //            console.log("Datos del usuario "+data.usuario+" actualizados");
        //        }, function(err){
        //            console.log(err);
        //        });
        //
        //    }
        //}
        /**
         * FIN CÁLCULO DE ESTADÍSTICAS
         *
         * INICIO CATEGORIZACIÓN DE USUARIOS:
         * La categorización de usuarios se realiza a través del cálculo de puntuaciones individuales para cada categoria,
         * comparando todas las puntuaciones de todas las categorias, se cogen las tres categorias con más puntuación y son
         * las que se le asignan al usuario
         */

        var objUsuariosCat = [];
        vm.cargarUsuarios = function(){
            var responseTodosUsuarios = Usuarios.query();
            responseTodosUsuarios.$promise.then(function(data){
                objUsuariosCat = data;
                vm.cargarTickets();
                console.log("Usuarios cargados");
            });
        }

        vm.cargarTickets = function(){
            var usuario;
            var fechaActual = new Date();
            var mesActual,anyoActual;

            for(var i = 0;i<objUsuariosCat.length;i++) {
                usuario = objUsuariosCat[i]._id;
                for (var j = 0; j < 3; j++) {
                    mesActual = fechaActual.getMonth();
                    anyoActual = fechaActual.getFullYear();
                    if(j==2)
                        vm.cargarTicketMes(usuario,mesActual,anyoActual,i,true);
                    else
                        vm.cargarTicketMes(usuario,mesActual,anyoActual,i,false);
                    fechaActual.setMonth(fechaActual.getMonth() - (1));
                }
                fechaActual = new Date();
            }

        }

        vm.cargarTicketMes = function(usuario, mes, anyo,indice,last){
            if(!objUsuariosCat[indice].tickets)
                objUsuariosCat[indice]['tickets'] = [];
            var responseTicketsMesUsuario = $http.post('./../api/tickets/dameTicketsMesUsuario', {
                'id_usuario': usuario,
                'mes': mes,
                'anyo': anyo
            });
            responseTicketsMesUsuario.success(function (data) {
                objUsuariosCat[indice].tickets = objUsuariosCat[indice].tickets.concat(data);
                if (last) {
                    vm.recorrerProductosTickets(indice);
                }
            });
        }

        vm.recorrerProductosTickets = function(indice){
            var tickets = objUsuariosCat[indice].tickets;
            var totales = 0;
            objUsuariosCat[indice]['contadorTipos'] = 0;

            for(var z=0;z<tickets.length;z++){
                totales += tickets[z].productos.length;
            }
            objUsuariosCat[indice]['contadorTiposMax'] = totales;

            for(var i = 0;i<tickets.length;i++) {
                for (var j = 0; j < tickets[i].productos.length; j++) {
                    vm.descuartizarTiposComprados(indice,tickets,tickets[i].productos[j].id_prod, tickets[i].productos[j].cantidad);
                }
            }
        }

        vm.descuartizarTiposComprados = function(indice, tickets,id_prod,cantidad){
            var responseDescuartizarTipos = $http.get('./../api/productos/dameTipo/'+id_prod);
            responseDescuartizarTipos.success(function(data){
                objUsuariosCat[indice].contadorTipos++;
                var tipo = data;
                if(objUsuariosCat[indice][tipo]){
                    objUsuariosCat[indice][tipo] += cantidad;
                }else{
                    objUsuariosCat[indice][tipo] = cantidad;
                }
                if(objUsuariosCat[indice].contadorTipos == objUsuariosCat[indice].contadorTiposMax) {
                    vm.inicializarCalculosCategorias(indice);
                }
            });
        }

        vm.inicializarCalculosCategorias = function(indice){
            var soltero,pareja,fBebes,fAdolescente,vegetariano,gula,mascota,deportista;
            var edad,catEdad,adolescente,joven,medianaedad,jubilado;
            var celiaco, diabetico;

            objUsuariosCat[indice]['puntuacionesCategorias'] = [];

            //Por compras
            objUsuariosCat[indice].puntuacionesCategorias.push(["soltero", vm.calculaPuntuacionSoltero(objUsuariosCat[indice])]);
            objUsuariosCat[indice].puntuacionesCategorias.push(["pareja", vm.calculaPuntuacionPareja(objUsuariosCat[indice])]);
            objUsuariosCat[indice].puntuacionesCategorias.push(["fBebes", vm.calculaPuntuacionFamiliaBebes(objUsuariosCat[indice])]);
            objUsuariosCat[indice].puntuacionesCategorias.push(["fAdolescente", vm.calculaPuntuacionFamiliaAdolescente(objUsuariosCat[indice])]);
            objUsuariosCat[indice].puntuacionesCategorias.push(["vegetariano", vm.calculaPuntuacionVegetariano(objUsuariosCat[indice])]);
            objUsuariosCat[indice].puntuacionesCategorias.push(["gula", vm.calculaPuntuacionGula(objUsuariosCat[indice])]);
            objUsuariosCat[indice].puntuacionesCategorias.push(["mascota", vm.calculaPuntuacionMascota(objUsuariosCat[indice])]);
            objUsuariosCat[indice].puntuacionesCategorias.push(["deportista", vm.calculaPuntuacionDeportista(objUsuariosCat[indice])]);

            objUsuariosCat[indice].puntuacionesCategorias.sort(function(a,b){
                if(a[1]>=b[1])
                    return -1;
                else
                    return 1;
            });

            //Por edad
            edad = vm.calculaEdadUsuario(objUsuariosCat[indice]);
            if(edad >= 14 && edad<18)
                catEdad = "Adolescente";
            else if(edad>=18 && edad <30)
                catEdad = "Joven";
            else if(edad>=30 && edad < 60)
                catEdad = "Adulto";
            else if(edad>=60)
                catEdad = "Jubilado";
            else
                catEdad = "Sin edad";
            objUsuariosCat[indice]['catEdad'] = catEdad;

            //Por restricciones
            celiaco = null;
            diabetico = null;

            objUsuariosCat[indice].categorias = [];
            objUsuariosCat[indice].categorias.push(objUsuariosCat[indice].puntuacionesCategorias[0][0]);
            objUsuariosCat[indice].categorias.push(objUsuariosCat[indice].puntuacionesCategorias[1][0]);
            objUsuariosCat[indice].categorias.push(objUsuariosCat[indice].catEdad);
            console.log(objUsuariosCat);


        }

        vm.calculaPuntuacionSoltero = function(usuario){
            var congelados = 1;
            var alcohol = 0.5;
            var pasta = 1;
            var carne = 0.5;
            var pescado = 0.5;
            var puntuacion = 0;

            if(usuario["Bebidas alcohólicas"]) {
                puntuacion += alcohol * usuario["Bebidas alcohólicas"];          }
            if(usuario["Carnes"])
                puntuacion += carne * usuario["Carnes"];
            if(usuario["Pastas"])
                puntuacion += pasta*usuario["Pastas"];
            if(usuario["Pescados"])
                puntuacion += pescado*usuario["Pescados"];
            if(usuario["Congelados"])
                puntuacion += congelados*usuario["Congelados"];

            return puntuacion;

        }

        vm.calculaPuntuacionPareja = function(usuario){
            var higiene = 0.5;
            var carne = 1;
            var vegetales = 1;
            var cosmeticos = 0.5;

            var puntuacion = 0;

            if(usuario["Higiene"])
                puntuacion += higiene*usuario["Higiene"];
            if(usuario["Carnes"])
                puntuacion += carne*usuario["Carnes"];
            if(usuario["Vegetales"])
                puntuacion += vegetales*usuario["Vegetales"];
            if(usuario["Cosméticos"])
                puntuacion += cosmeticos*usuario["Cosméticos"];

            return puntuacion;

        }

        vm.calculaPuntuacionFamiliaBebes = function(usuario){
            var higiene = 1;
            var bebes = 5;
            var juguetes = 0.5;
            var lacteos = 0.5;
            var dulces = 0.5;

            var puntuacion = 0;

            if(usuario["Higiene"])
                puntuacion += higiene*usuario["Higiene"];
            if(usuario["Bebés"])
                puntuacion += bebes*usuario["Bebés"];
            if(usuario["Dulces"])
                puntuacion += dulces*usuario["Dulces"];
            if(usuario["Juguetes"])
                puntuacion += juguetes*usuario["Juguetes"];
            if(usuario["Lácteos y huevos"])
                puntuacion += lacteos*usuario["Lácteos y huevos"];

            return puntuacion;
        }

        vm.calculaPuntuacionFamiliaAdolescente = function(usuario){
            var refrescos = 0.5;
            var carne = 1;
            var pescado = 1;
            var electronica = 0.5;
            var higiene = 1;

            var puntuacion = 0;
            if(usuario["Higiene"])
                puntuacion += higiene*usuario["Higiene"];
            if(usuario["Carnes"])
                puntuacion += carne*usuario["Carnes"];
            if(usuario["Refrescos"])
                puntuacion += refrescos*usuario["Refrescos"];
            if(usuario["Pescados"])
                puntuacion += pescado*usuario["Pescados"];
            if(usuario["Electrónica"])
                puntuacion += electronica*usuario["Electrónica"];

            return puntuacion;
        }

        vm.calculaPuntuacionVegetariano = function(usuario){
            var vegetales = 1;
            var legumbres = 1;
            var pasta = 0.5;
            var fruta = 0.5;

            var puntuacion = 0;

            if(usuario["Vegetales"])
                puntuacion += vegetales*usuario["Vegetales"];
            if(usuario["Legumbres"])
                puntuacion += legumbres*usuario["Legumbres"];
            if(usuario["Pastas"])
                puntuacion += pasta*usuario["Pastas"];
            if(usuario["Fruta"])
                puntuacion += fruta*usuario["Fruta"];

            return puntuacion;
        }

        vm.calculaPuntuacionGula = function(usuario){
            var dulces = 1;
            var carne = 1;
            var aperitivo = 0.5;
            var salsas = 0.5;

            var puntuacion = 0;

            if(usuario["Dulces"])
                puntuacion += dulces*usuario["Dulces"];
            if(usuario["Carnes"])
                puntuacion += carne*usuario["Carnes"];
            if(usuario["Aperitivos"])
                puntuacion += aperitivo*usuario["Aperitivos"];
            if(usuario["Salsas"])
                puntuacion += salsas*usuario["Salsas"];

            return puntuacion;
        }

        vm.calculaPuntuacionDeportista = function(usuario){
            var deportes = 1;
            var pasta = 0.5;
            var carne = 0.5;
            var pescado = 0.5;
            var legumbres = 0.5;

            var puntuacion = 0;

            if(usuario["Deportes"])
                puntuacion += deportes*usuario["Deportes"];
            if(usuario["Pastas"])
                puntuacion += pasta*usuario["Pastas"];
            if(usuario["Carnes"])
                puntuacion += carne*usuario["Carnes"];
            if(usuario["Pescados"])
                puntuacion += pescado*usuario["Pescados"];
            if(usuario["Legumbres"])
                puntuacion += legumbres*usuario["Legumbres"];

            return puntuacion;
        }

        vm.calculaPuntuacionMascota = function(usuario){
            var mascotas = 5;

            var puntuacion = 0;

            if(usuario["Animales"])
                puntuacion += mascotas*usuario["Animales"];

            return puntuacion;
        }

        vm.calculaEdadUsuario = function(usuario){
            var fnacim = new Date(usuario.f_nacimiento);
            var factual = new Date();

            return factual.getFullYear()-fnacim.getFullYear();
        }

        /**
         * TODO : Comprobar que los tipos se han calculado bien, ejemplo: Usuario enrique no tiene tipos y tiene una compra
         */


    }]);