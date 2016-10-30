'use strict';
/**
 * Created by Xisco on 09/12/2015.
 */
angular.module('sbAdminApp')

    .controller('ProductosCtrl', ['$scope', '$timeout','Productos','Usuarios', 'Empresa','ListaUnica','$stateParams', '$http', function ($scope, $timeout, Productos, Usuarios, Empresa, ListaUnica, $stateParams, $http) {
        var vm = this;

        vm.usuarioNombre = "";
        vm.idUsuario = "";
        vm.orden='name';
        vm.invertir=false;
        vm.buscadorNombre = "";
        vm.buscadorTipo = "";

        var usuario = Usuarios.get({id : document.getElementById("hiddenId").value});
        var productosUsuario = [];
        var productosValorar = [];
        var catalogo = [];
        var precios = [];
        vm.idLista = "";
        var productoActual;
        var nombreProductoActual;
        var empresaActual;

        var prodSel = "";
        var prodName = "";
        var num = 1;
        $scope.productos = [];

        vm.tamBusqueda = 0;

        vm.disableMas = false;
        vm.disableMenos = false;

        $scope.activoOp = [];
        $scope.activoVa = [];
        vm.tiposDisponibles = [];

        vm.cargado = false;

        vm.empresasEncontradas = [];
        vm.nombresEmpresasEncontradas = [];

        var numElemsPag = 6;
        vm.inicioPaginacion = 0;
        vm.finPaginacion = numElemsPag;
        vm.numPags = 0;

        vm.paginacionActual = 1;
        vm.navegacion = [];
        //Se cogen las referencias a productos del usuario
        usuario.$promise
            .then(function(data) {
                vm.usuarioNombre = data.name;
                productosUsuario = data.productos;
                vm.idUsuario = data._id;
                if(window.location.href.indexOf("productos")!=-1) {
                    var responseTipos = $http.post("./../api/empresas/tiposDisponibles", {id_empresa: $stateParams.superId});
                    responseTipos.success(function (data) {
                        vm.tiposDisponibles = data;
                    });
                }
                vm.searchProducts();
            },function(reason){
                console.log("Problema cogiendo la referencia a productos del usuario"+reason);
            });

        //Muestra los productos comprados por el usuario
        $scope.productos = catalogo;
        $scope.prodAValorar = productosValorar;
        //$scope.precios = precios;
        //Busca todos aquellos productos referenciados por el usuario y los almacena
        vm.searchProducts = function(){
            var response;

            if(window.location.href.indexOf("valoraciones")!=-1){
                vm.obtenerProductosUsuario();
            }

            for(var i=0;i<productosUsuario.length;i++){
                //vm.asignarProductosACatalogo(i);
            }
        }

        vm.obtenerProductosUsuario = function(){
            var busqueda =  vm.buscadorNombre;
            if(vm.tamBusqueda<3){
                busqueda = "";
            }
            var responseObjetosValoracion = $http.post("./../api/usuarios/productosCompradosPaginado", {id_usuario: vm.idUsuario, inicio: vm.inicioPaginacion, cantidad: vm.finPaginacion, orden: vm.orden, inverso: vm.invertir, busqueda: busqueda});
            responseObjetosValoracion.success(function(data){
                document.getElementById('loaderValoraciones').classList.remove('bubbles');
                vm.cargado = true;
                $scope.prodAValorar = data.array;
                vm.numPags = Math.ceil(parseInt(data.total)/numElemsPag);

                for(var i=1; i<=vm.numPags; i++)
                    vm.navegacion.push(i);
            });
        }

        var cont = 0;


        //añade un producto a una lista
        vm.addProductToList = function(id, lista){
            var response;
            var productoEncontrado;

            response = Productos.get({id : id});
            response.$promise.then(function(data) {
                productoEncontrado = data;
            },function(reason){
                console.log("Error en addProductToList por: "+reason);
            });
        }

        vm.devuelveCatalogo = function(superId){
            vm.idLista = superId;
            var productosObj = [];
            var producto;
            var response = Empresa.get({ id: superId});
            response.$promise.then(function(data){
                $scope.supermercado = data.name;
                productosObj = data.catalogo;
                var busqueda =  vm.buscadorNombre;
                if(vm.tamBusqueda<3){
                    busqueda = "";
                }
                var responseCatalogo = $http.post("./../api/empresas/catalogoPaginado", {id_empresa: data._id, inicio: vm.inicioPaginacion, cantidad: vm.finPaginacion, orden: vm.orden, inverso: vm.invertir, busqueda: busqueda, tipo: vm.buscadorTipo});
                responseCatalogo.success(function(data) {
                    vm.navegacion = [];
                    for (var i = 0; i < data.array.length; i++) {
                        var de = data.array[i].description;
                        var des = "";

                        if(de!=null && de!="") {
                            de = de.indexOf(".", de.indexOf('.'));
                            des = data.array[i].description.substr(0, de);
                            des = des.replace(/<\/?[^>]+(>|$)/g, "");

                            des = des.replace(/[<>&'"]/g, function (c) {
                                switch (c) {
                                    case '<':
                                        return '&lt;';
                                    case '>':
                                        return '&gt;';
                                    case '&':
                                        return '';
                                    case '\'':
                                        return '&apos;';
                                    case '"':
                                        return '&quot;';
                                }
                            });

                            //des = des.replace('13', " ");

                            var re = new RegExp('#13;', 'g');

                            des = des.replace(re, ' ');
                        }

                        if (des == '') {
                            data.array[i].description = 'Este producto no tiene descripción.'
                        }
                        else {
                            data.array[i].description = des;
                        }

                    }
                    $scope.productos = data.array;
                    document.getElementById('loaderProductos').classList.remove('bubbles');
                    vm.cargado = true;

                    vm.numPags = Math.ceil(parseInt(data.total) / numElemsPag);

                    for (var i = 1; i <= vm.numPags; i++) {
                        vm.navegacion.push(i);
                    }
                })
            },function(reason){
                console.log("Error en devuelveCatalogo fuera por: "+reason);
            });
        }

        if($stateParams.superId)
            vm.devuelveCatalogo($stateParams.superId);

        /*
         $scope.damePrecio = function(id_prod){
         for(var i=0;i<precios.length;i++){
         if(precios[i].prod_id.localeCompare(id_prod) == 0)
         return precios[i].precio;
         }
         }
         */

        /*
         vm.cargarPrecios = function(){
         for(var j=0; j<$scope.productos.length; j++) {
         for (var i = 0; i < precios.length; i++) {
         if (precios[i].prod_id.localeCompare($scope.productos[j]._id) == 0) {
         $scope.productos[j]['precio'] =precios[i].precio;
         }
         }
         }
         }
         */

        /*
         vm.dameFechaProducto = function(producto_id){
         for(var j=0; j<productosUsuario.length; j++){
         if(productosUsuario[j].id_prod == producto_id)
         return productosUsuario[j].fecha;
         }
         return false;
         }*/

        $scope.botonAlert = function(ev, producto, id, empresa){
            var descr = "";

            swal(
                {
                    title: "Comenta sobre "+producto,
                    html: true,
                    text: "<div id='positivo' class='opinionSel positiveRadio opinion fa fa-2x fa-thumbs-up'></div>"
                    +"<div id='negativo' class='negativeRadio opinion fa fa-2x fa-thumbs-down'></div><br /><br />"
                    + "Escribe tu opinion sobre este producto:",
                    type: "input",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    animation: "slide-from-top"
                },
                function(inputValue)
                {
                    if (inputValue === false)
                        return false;
                    if (inputValue === "")
                    {
                        swal.showInputError("Necesitas escribir algo");
                        return false
                    }

                    var nuevaOpinion = [{
                        "texto": inputValue,
                        "user": usuario._id,
                        "empresa": empresa
                    }];

                    //Actualizar opinion de producto******************************************************************************************
                    var response = $http.post('./../api/productos/opinadoPorUsuario', {'id_usuario': usuario._id, 'id_empresa': empresa, 'id_producto': id });
                    var opinado = false;
                    response.success(function(data){
                        opinado = data=="false"? false : true;

                        if(opinado==false) {

                            var positivo = true;

                            var botonPositivo = document.getElementById("positivo").classList.contains("opinionSel");

                            var response;
                            response = Productos.update(
                                {id: id},
                                {
                                    "opiniones": {
                                        "texto": inputValue,
                                        "user": usuario._id,
                                        "empresa": empresa,
                                        "positivo": botonPositivo
                                    }
                                }
                            );
                            response.$promise
                                .then(function (data) { //Si la operacion sale bien

                                },function(reason){
                                    console.log("Error en boronAlert success por: "+reason);
                                });

                            swal("¡Perfecto!", "Tu opinion ha sido guardada ¡Gracias!", "success");
                            $timeout(function(){
                                location.reload();
                            }, 2000);
                        }else{
                            swal("¡Lo sentimos!", "Sólo se puede opinar una vez acerca de un producto.", "error");
                        }
                    });
                }
            );
        }


        ///////////////////////////////////////////////////////////////////////////CONTROLADOR PRODUCTOS/////////////////////////////////////////////////////////////////////
        $scope.comprobarOpinado = function(id_producto, id_empresa, indice){
            var response = $http.post('./../api/productos/opinadoPorUsuario', {'id_usuario': usuario._id, 'id_empresa': id_empresa, 'id_producto': id_producto });
            var opinado = false;
            response.success(function(data) {
                opinado = data == "false" ? false : true;
                $scope.activoOp[indice] = opinado;
            },function(reason){
                console.log("Error en comprobarOpinado por: "+reason);
            });
        }

        $scope.comprobarValorado = function(id_producto, id_empresa, indice){
            var response = $http.post('./../api/productos/valoradoPorUsuario', {'id_usuario': usuario._id, 'id_empresa': id_empresa,'id_producto': id_producto });
            var valorado = false;
            response.success(function(data) {
                valorado = data=="false"? false : true;
                $scope.activoVa[indice] = valorado;
            },function(reason){
                console.log("Error en comprobarValorado por: "+reason);
            });
        }

        $scope.anyadirLista = function(ev, produc, name){
            var descr = "";
            var listas = [];
            var response;
            //var response = Listas.query();
            var resultado = $http.post('./../api/listas/buscar', {'usuario': usuario._id});
            /*resultado.success(function(data){
             response = data;
             });*/
            var buttons = "";
            prodSel = produc;
            prodName = name;
            num = 1 ;

            //response.$promise.then(function(data){
            resultado.success(function(data){
                listas = data;
                buttons +=  "<br /><select class='opcionLista' id='selectLista'>"

                for(var i=0;i<listas.length;i++){
                    if(listas[i]._id!="")
                        buttons +=  "<option value='"+ listas[i]._id +"'>"+listas[i].name+"</option>";
                    //buttons += "<button id='"+i+"' class='addlist'>"+listas[i].name+"</button><br>";
                }
                buttons += "</select><br />";
                buttons += "<button class='addlist' id='add' style='background-color: #5bc0de'>Añadir</button>";
                buttons += "<button id='cancel' style='background-color: #C57B7B'>Cerrar</button>";

                swal(
                    {
                        title: "Selecciona una de tus listas",
                        html: true,
                        text: "<div class='insideAlert'>"
                        +"<p id='cantidadHint' hidden>¡Debes indicar una cantidad y lista para realizar la operación!</p>"
                        +"Cantidad: </br> "
                        +"<button id='menos' ng-disabled='vm.disableMenos'> <i class='fa fa-minus'></i> </button>"
                        +"<select disabled id='selectCantidad'>"
                        +"<option value='1'>1</option>"

                        +"</select>"
                        +"<button id='mas' ng-disabled='vm.disableMas'> <i class='fa fa-plus'></i> </button>"
                        +"</div>"
                        +buttons,
                        showCancelButton: false,
                        showConfirmButton: false,
                        closeOnConfirm: false,
                        closeOnCancel: false,
                        allowOutsideClick: true,
                        cancelButtonText: "Cancelar",
                        animation: "slide-from-top"
                    }, function(){
                    }
                );
            });


        }

        $scope.botonPuntuar = function (e,prod, id, empresa)
        {
            productoActual = id;
            nombreProductoActual = prod;
            empresaActual = empresa;
            var descr = '<div class="ec-stars-wrapper"><a id="star1" data-value="1" title="Votar con 1 estrellas">&#9733;</a>'

            descr += '<a id="star2" data-value="2" title="Votar con 2 estrellas">&#9733;</a>';
            descr += '<a id="star3" data-value="3" title="Votar con 3 estrellas">&#9733;</a>';
            descr += '<a id="star4" data-value="4" title="Votar con 4 estrellas">&#9733;</a>';
            descr += '<a id="star5" data-value="5" title="Votar con 5 estrellas">&#9733;</a></div>';
            //<a onClick="twitter(\'Event\',\'2\',producto)" data-value="2" title="Votar con 2 estrellas">&#9733;</a><a onClick="twitter(\'Event\',\'3\', producto)" data-value="3" title="Votar con 3 estrellas">&#9733;</a><a onClick="twitter(\'Event\',\'4\', producto)" data-value="4" title="Votar con 4 estrellas">&#9733;</a><a onClick="twitter(\'Event\',\'5\', producto)" data-value="5" title="Votar con 5 estrellas">&#9733;</a>

            swal(
                {
                    imageUrl: "images/logo.jpg",
                    title: "Valora "+prod,
                    text: descr,
                    html: true,
                    animation: "slide-from-top",
                    showConfirmButton: false,
                    showCancelButton : true,
                    allowOutsideClick: true
                },
                function()
                {

                }
            );
        }

        $scope.twitter = function(e, estr, producto)
        {
            var str;
            var btnText;

            //ng-href="https://twitter.com/intent/tweet?text=He%20comprado%20un%20paquete%20Calgonit%20en%20@CountEasy";
            if(estr == 1) {
                str = "Has valorado "+producto+" con 1 estrella";
                btnText = "¡He%20valorado%20"+producto+"%20con%201%20estrella%20con%20Easycount!%20@CountEasy";
            }
            else {
                str = "Has valorado "+producto+" con " + estr + " estrellas";
                btnText = "¡He%20valorado%20"+producto+"%20con%20" + estr + "%20estrellas%20con%20Easycount!%20@CountEasy";
            }

            swal(
                {
                    imageUrl: "images/twitter.png",
                    title: "¿Compartir en twitter?",
                    text: str,
                    html: true,
                    animation: "slide-from-top",
                    confirmButtonText: "¡Compartir!",
                    showCancelButton: true,
                    cancelButtonText: "No compartir"
                },
                function(inputValue)
                {
                    if (inputValue === true) {
                        window.open('https://twitter.com/intent/tweet?text=' + btnText, '_blank');
                    }
                    location.reload();
                    //window.location.href = "https://twitter.com/intent/tweet?text=" + btnText;


                }
            );
        }

        $(document).on("click",".opinion" , function(e) {
            var botones = document.getElementsByClassName("opinion");
            for(var o=0; o<botones.length; o++){
                botones[o].classList.remove("opinionSel");
            }
            this.classList.add("opinionSel");
        });

        $(document).on("click","#star1" , function(e){
            vm.enviarValoracion(1, productoActual, empresaActual);
        });
        $(document).on("click","#star2" , function(e){
            vm.enviarValoracion(2, productoActual, empresaActual);
        });
        $(document).on("click","#star3" , function(e){
            vm.enviarValoracion(3, productoActual, empresaActual);
        });
        $(document).on("click","#star4" , function(e){
            vm.enviarValoracion(4, productoActual, empresaActual);
        });
        $(document).on("click","#star5" , function(e){
            vm.enviarValoracion(5, productoActual, empresaActual);
        });

        vm.enviarValoracion = function(val, prod, empr){
            //ACTUALIZAR VALORACION DE PRODUCTOS
            var responseval = $http.post('./../api/productos/valoradoPorUsuario', {'id_usuario': usuario._id, 'id_empresa': empr, 'id_producto': prod });
            var valorado = false;
            responseval.success(function(data){
                valorado = data=="false"? false : true;

                if(valorado==false) {
                    var responseEnvVal;
                    responseEnvVal = Productos.update(
                        {id: prod},
                        {
                            "valoraciones": {
                                "user": usuario._id,
                                "puntuacion": val,
                                "empresa": empr
                            }
                        }
                    );
                    responseEnvVal.$promise
                        .then(function (data) { //Si la operacion sale bien
                        },function(reason){
                            console.log("Error en enviarValoración success por: "+reason);
                        });

                    vm.twitter('Event', val, nombreProductoActual);
                }else{
                    swal("¡Lo sentimos!", "Sólo se puede valorar una vez acerca de un producto.", "error");
                }
            });
        }

        vm.twitter = function(e, estr, producto)
        {
            var str;
            var btnText;

            //ng-href="https://twitter.com/intent/tweet?text=He%20comprado%20un%20paquete%20Calgonit%20en%20@CountEasy";
            if(estr == 1) {
                str = "Has valorado "+producto+" con 1 estrella";
                btnText = "¡He%20valorado%20"+producto+"%20con%201%20estrella%20con%20Easycount!%20@CountEasy";
            }
            else {
                str = "Has valorado "+producto+" con " + estr + " estrellas";
                btnText = "¡He%20valorado%20"+producto+"%20con%20" + estr + "%20estrellas%20con%20Easycount!%20@CountEasy";
            }

            swal(
                {
                    imageUrl: "images/twitter.png",
                    title: "¿Compartir en twitter?",
                    text: str,
                    html: true,
                    animation: "slide-from-top",
                    confirmButtonText: "¡Compartir!",
                    showCancelButton: true,
                    allowOutsideClick: true,
                    cancelButtonText: "No compartir"
                },
                function(inputValue)
                {
                    if (inputValue === true)
                        window.open('https://twitter.com/intent/tweet?text=' + btnText, '_blank');

                    location.reload();
                    //window.location.href = "https://twitter.com/intent/tweet?text=" + btnText;
                }
            );
        }

        vm.formatearFecha = function(fecha){
            var date = new Date(fecha);
            return date.toLocaleString();
        }



        $(document).on( "click",".addlist",  function(e){
            //here sweet alert closes when I press this button.
            var cantidad = $( "#selectCantidad" ).val();
            var id_lista = $("#selectLista").val();
            var restric="<div style='text-align:center;list-style-position: inside;'>";
            if(prodSel != null && id_lista!=null && cantidad > 0){
                var responseRest = $http.post("./../api/productos/compruebaRestricciones", {id_usuario: usuario._id, id_producto: prodSel});

                responseRest.success(function(data) {
                    if(data) {
                        if(data.length>0){
                            for(var t=0; t<data.length; t++){
                                restric += "<p style='font-weight:bold'>"+devuelveNombreRestriccion(data[t])+"</p>"
                            }
                            restric+="</div>"

                            swal({
                                title: "¡CUIDADO!",
                                text: "El producto que quieres insertar está etiquetado como peligroso según tus restricciones: "+restric,
                                type: "warning",
                                html: true,
                                showCancelButton: true,
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Añadir de todos modos",
                                closeOnConfirm: false
                            }, function(){
                                insertarProducto(id_lista, cantidad);
                            });
                        }else{
                            insertarProducto(id_lista, cantidad);
                        }
                    }
                });

            }else if(prodSel != null){
                $( "#cantidadHint").show();
            }

        });

        function devuelveNombreRestriccion(res){
            var devuelve="";
            switch(res){
                case "vegetariano":
                    devuelve="Vegano";
                    break;
                case "celiaco":
                    devuelve="Celíaco";
                    break;
                case "lactosa":
                    devuelve="Intolerante a la lactosa";
                    break;
                case "diabetico":
                    devuelve="Diabético";
                    break;
                case "frutos":
                    devuelve="Alérgico a los frutos secos";
                    break;
                default:
                    devuelve="";
                    break;
            }
            return devuelve;
        }

        function insertarProducto(id_lista, cantidad){
            var responseLista = ListaUnica.get({id: id_lista});
            responseLista.$promise
                .then(function(data){ //Si la operacion sale bien
                    if(data!=null){
                        var nombre  = data.name;
                        var idlista = data._id;

                        var responseActualizar;

                        var enLista=-1;
                        var prodLis = data.productos;
                        for(var j=0; j<prodLis.length; j++){
                            if(prodLis[j].prod_id==prodSel){
                                enLista=j;
                            }
                        }
                        if(enLista==-1) {
                            responseActualizar = ListaUnica.update(
                                {id: idlista},
                                {
                                    "productos": {
                                        "prod_id": prodSel,
                                        "cantidad": cantidad,
                                        "empresa": (vm.idLista).toString()
                                    }
                                }
                            );
                            responseActualizar.$promise
                                .then(function(data){ //Si la operacion sale bien
                                    swal("¡Perfecto!", "Has añadido " + cantidad + " " + prodName + " a la lista " + nombre , "success");
                                },function(reason){ //Si va mal
                                    swal("¡Oooops!", "Algo ha salido mal, vuelve a intentarlo por favor." , "error");
                                });

                        }else{
                            var responseAñadir = $http.post("../../api/listas/cambiarCantidadProducto", {id_lista: id_lista, id_producto: prodSel, cantidad: cantidad})
                            responseAñadir.success(function(data) {
                                if(data) {
                                    swal("¡Perfecto!", "Has añadido " + cantidad + " " + prodName + " a la lista " + nombre, "success");
                                }else
                                    swal("¡Oooops!", "Algo ha salido mal, vuelve a intentarlo por favor." , "error");
                            });
                        }

                        swal.close();
                    }
                },function(reason){
                    console.log("Error en anyadirLista swal por: "+reason);
                });
        }


        $(document).on( "click","#cancel",  function(e){
            num=1;
            swal.close();
        });

        $(document).on("click","#mas" , function(e){
            vm.disableMas = true;
            e.preventDefault();
            num++;
            $("#selectCantidad").append("<option value='" + num + "'>" + num +"</option>");
            $("#selectCantidad").val(num);
            vm.disableMenos = false;
        });

        $(document).on("click" ,"#menos" ,function(e){
            vm.disableMas = true;
            e.preventDefault();
            if(num>1) {
                $("#selectCantidad option[value='" + num + "']").remove();
                num--;
                $("#selectCantidad").val(num);
            }
            vm.disableMenos = false;
        });

        function compare(a,b) {
            var f1 = a.name;
            var f2 = b.name;

            switch(vm.orden){
                case "name":    f1 = a.name;
                    f2 = b.name;
                    break;
                case "precio":  f1 = a.precio;
                    f2 = b.precio;
                    break;
                case "tipo":    f1 = a.type;
                    f2 = b.type;
                    break;
                default:        f1 = a.name;
                    f2 = b.name;
                    break;
            }

            if (f1 > f2)
                return -1;
            else if (f1 < f2)
                return 1;
            else
                return 0;
        }

        vm.cambiarPaginacion = function(num){
            if(num>0 && num<=vm.numPags) {
                vm.paginacionActual = num;
                vm.inicioPaginacion = (num - 1) * numElemsPag;
                vm.finPaginacion = vm.inicioPaginacion + numElemsPag;
                if(window.location.href.indexOf("/productos/")!=-1) {
                    vm.devuelveCatalogo($stateParams.superId);
                }
                if(window.location.href.indexOf("valoraciones")!=-1){
                    vm.obtenerProductosUsuario();
                }
            }
        }

        vm.busquedaPorNombre = function(){
            var numAnterior = vm.tamBusqueda;
            vm.tamBusqueda=vm.buscadorNombre.length;
            vm.paginacionActual=1;
            vm.inicioPaginacion = 0;
            vm.finPaginacion = numElemsPag;
            if(vm.buscadorNombre.length>2 || (numAnterior>2 && vm.tamBusqueda<=2)){
                catalogo = [];
                if(window.location.href.indexOf("/productos/")!=-1) {
                    vm.devuelveCatalogo($stateParams.superId);
                }
                if(window.location.href.indexOf("valoraciones")!=-1){
                    vm.obtenerProductosUsuario();
                }
            }
        }

        vm.recortarDescripcion = function(str){
            var sub = str.substring(0, 125);
            if(sub.length<str.length)
                sub += "...";
            return sub;
        }

        vm.recargarPagina = function(){
            if(window.location.href.indexOf("/productos/")!=-1) {
                vm.paginacionActual=1;
                vm.inicioPaginacion = 0;
                vm.finPaginacion = numElemsPag;
                vm.devuelveCatalogo($stateParams.superId);
            }
            if(window.location.href.indexOf("valoraciones")!=-1){
                vm.obtenerProductosUsuario();
            }
        }
    }]);