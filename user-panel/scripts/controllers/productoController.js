/**
 * Created by Miguel on 01/02/2016.
 *
 * Controlador para la vista individual de producto
 */

angular.module('sbAdminApp')
    //recoge un producto a partir de su id


    .controller('ProductoCtrl', ['Productos','Usuarios','Listas', 'Empresa', '$stateParams', '$resource', '$timeout', '$http', '$sce', function (Productos, Usuarios, Listas, Empresa, $stateParams, $resource, $timeout, $http, $sce)
    {
        var vm = this;

        var idProducto= $stateParams.id;
        var responseUsuario = Usuarios.get({id : document.getElementById("hiddenId").value});
        var usuario = "";

        responseUsuario.$promise.then(function(data){
            usuario = data;
            vm.inicializaProducto();
        });

        vm.producto = null;
        vm.comentarios = {
            usuarios: [],
            texto: [],
            empresa: [],
            positivo: []
        };
        vm.productoComprado = false;
        vm.productoOpinado = true;
        vm.productoValorado = true;
        vm.estrellas = [false, false, false, false, false];

        vm.filtraCaracter = 0;

        vm.numComents = 0;
        vm.numComentsPos = 0;
        vm.numComentsNeg = 0;

        vm.empresasComprado = [];

        vm.inicializaProducto = function() {
            //recoge los datos del producto por su id
            var response;
            response = Productos.get({id: idProducto});
            response.$promise
                .then(function (data)//si sale bien
                {
                    //document.getElementById("descripcionDetalle").innerHTML=data.description;
                    vm.contenidoDescripcion = $sce.trustAsHtml(data.description);
                    vm.producto = data;
                    var responseNumOpi = $http.get("./../api/productos/dameNumOpiniones/" + data._id + "/todos");
                    responseNumOpi.success(function (data) {
                        vm.numComents = data;
                    });

                    var responseNumOpiPos = $http.get("./../api/productos/dameNumOpiniones/" + data._id + "/positivo");
                    responseNumOpiPos.success(function (data) {
                        vm.numComentsPos = data;
                    });

                    var responseNumOpiNeg = $http.get("./../api/productos/dameNumOpiniones/" + data._id + "/negativo");
                    responseNumOpiNeg.success(function (data) {
                        vm.numComentsNeg = data;
                    });

                    vm.numComentsPos = 0;
                    vm.numComentsNeg = 0;
                    vm.dameOpiniones();
                    comprobarUsuTieneProducto();
                    controlarEstrellas();

                }, function (reason) //En caso de fallo
                {
                    console.log("Error al recoger producto: " + reason);
                });
        }

        vm.dameOpiniones = function(){
            var tipo = "todos"
            switch(vm.filtraCaracter){
                case 0: tipo="todos";
                    break;
                case 1: tipo="positivo";
                    break;
                case 2: tipo="negativo"
                    break;
            }

            var responseOpiniones = $http.get("./../api/productos/dameNUltimasOpiniones/"+idProducto+"/"+5+"/"+tipo);
            responseOpiniones.success(function(data){
                vm.rellenarComentarios(data);
            });
        }

        vm.rellenarComentarios = function(array)
        {
            vm.producto.opiniones = array;
            for(var i=0 ; i<vm.producto.opiniones.length; i++)
            {
                var response;

                response = Usuarios.get({id : vm.producto.opiniones[i].user});
                response.$promise
                    .then(function(data)//si sale bien
                    {
                        //recorro el array para encontrar el elemento onde está el id
                        for(var j=0; j<vm.producto.opiniones.length; j++)
                        {
                            if(vm.producto.opiniones[j].user == data._id)
                            {
                                vm.comentarios.usuarios[j] = data.name;
                                vm.comentarios.texto[j] = vm.producto.opiniones[j].texto;
                                vm.comentarios.positivo[j] = vm.producto.opiniones[j].positivo;
                                vm.asignaFotoEmpresa(j, vm.producto.opiniones[j].empresa);
                            }
                        }

                    },function(reason) //En caso de fallo
                    {
                        console.log("Error al recoger el usuario: "+reason);
                    });
            }
        };

        vm.cambiarComentarios = function(num){
            var botones = document.getElementsByClassName("headerListas");
            for(var t=0; t<botones.length; t++){
                botones[t].classList.remove("headerListasSel");
            }
            botones[num].classList.add("headerListasSel");

            vm.filtraCaracter = num;
            vm.comentarios = {
                usuarios: [],
                texto: [],
                empresa: [],
                positivo: []
            };
            vm.dameOpiniones();
        }

        vm.asignaFotoEmpresa = function(indice, id){
            var empr = Empresa.get({id : id});
            empr.$promise.then(
                function(data){
                    vm.comentarios.empresa[indice]=data.photo;
                },function(reason){
                    return "";
                });
        }

        function comprobarUsuTieneProducto()
        {
            var response;
            var id = usuario._id;
            //var id_producto = "56954391e4b07f04a748e8a8";
            //var id_producto = "alcachofa";

            response = $http.post('./../api/usuarios/tieneProductoUsuario', {'id_usuario': id, 'id_producto': vm.producto._id });

            response.success(function(data){
                vm.productoComprado = data=="false"? false : true;
                vm.empresasComprado = data;
                if(vm.productoComprado == true) {
                    comprobarUsuAOpinado();
                    comprobarUsuAValorado();
                }
            });
        }

        function comprobarUsuAOpinado()
        {
            var response;

            var id = usuario._id; //PRUEBA PASSPORT

            //Comprobamos para cada empresa en la que el usuario ha comprado el producto si lo ha opinado ya o no
            for(var d=0; d<vm.empresasComprado.length; d++){
                rellenaUsuOpinado(d, vm.empresasComprado[d].id_empresa);
            }
        }

        function rellenaUsuOpinado(indice, id_empresa){
            response = $http.post('./../api/productos/opinadoPorUsuario', {'id_usuario': usuario._id, 'id_empresa': id_empresa ,'id_producto': vm.producto._id });
            var aux = false;
            response.success(function(data){
                aux = data=="false"? false : true;
                vm.empresasComprado[indice]['opinado'] = aux;
                if(aux==false) {
                    vm.productoOpinado = false;
                    if(vm.empresaOpi == null || vm.empresaOpi == "")
                        vm.empresaOpi=id_empresa;
                }
            });
        }

        function comprobarUsuAValorado()
        {
            var response;

            var id = usuario._id;

            //Comprobamos para cada empresa en la que el usuario ha comprado el producto si lo ha valorado ya o no
            for(var d=0; d<vm.empresasComprado.length; d++){
                rellenaUsuValorado(d, vm.empresasComprado[d].id_empresa);
            }
        }

        function rellenaUsuValorado(indice, id_empresa){
            response = $http.post('./../api/productos/valoradoPorUsuario', {'id_usuario': usuario._id, 'id_empresa': id_empresa ,'id_producto': vm.producto._id });
            var aux = false;
            response.success(function(data){
                aux = data=="false"? false : true;
                vm.empresasComprado[indice]['valorado'] = aux;
                if(aux==false) {
                    vm.productoValorado = false;
                    if(vm.empresaVal == null || vm.empresaValf == "")
                        vm.empresaVal=id_empresa;
                }
            });
        }

        function controlarEstrellas()
        {
            var notaMedia = 0;

            var response;

            response = $http.get('./../api/productos/'+vm.producto._id+'/valoracionMedia');
            response.success(function(data){
                notaMedia = parseInt(data);

                var i=0;
                while(i<notaMedia)
                {
                    vm.estrellas[i] = true;
                    i++;
                }
            });
        }

        ////////////////////////////////////// Funciones para opinar
        vm.botonAlert = function(ev, producto, id){
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
                        "empresa": vm.empresaOpi
                    }];

                    //Actualizar opinion de producto******************************************************************************************
                    var response = $http.post('./../api/productos/opinadoPorUsuario', {'id_usuario': usuario._id, 'id_empresa': vm.empresaOpi, 'id_producto': id });
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
                                        "empresa": vm.empresaOpi,
                                        "positivo": botonPositivo
                                    }
                                }
                            );
                            response.$promise
                                .then(function (data) { //Si la operacion sale bien

                                },function(reason){
                                    console.log("Error en boronAlert success por: "+reason);
                                });

                            swal({
                                title: "¡Perfecto!",
                                text: "Tu opinion ha sido guardada ¡Gracias!",
                                type: "success",
                                confirmButtonText: "Aceptar",
                                closeOnConfirm: false
                            }, function(){
                                location.reload();
                            });
                        }else{
                            swal("¡Lo sentimos!", "Sólo se puede opinar una vez acerca de un producto.", "error");
                        }
                    });
                }
            );
        }

        ////////////////////////////////////////////////Funciones para valorar
        vm.botonPuntuar = function (e,prod, id)
        {
            productoActual = id;
            nombreProductoActual = prod;
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
                    cancelButtonText: "No compartir"
                },
                function(inputValue)
                {
                    if (inputValue === true)
                        window.open('https://twitter.com/intent/tweet?text=' + btnText, '_blank');
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
            vm.enviarValoracion(1, productoActual, vm.empresaVal);
        });
        $(document).on("click","#star2" , function(e){
            vm.enviarValoracion(2, productoActual, vm.empresaVal);
        });
        $(document).on("click","#star3" , function(e){
            vm.enviarValoracion(3, productoActual, vm.empresaVal);
        });
        $(document).on("click","#star4" , function(e){
            vm.enviarValoracion(4, productoActual, vm.empresaVal);
        });
        $(document).on("click","#star5" , function(e){
            vm.enviarValoracion(5, productoActual, vm.empresaVal);
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
                            vm.twitter('Event', val, nombreProductoActual);
                        },function(reason){
                            console.log("Error en enviarValoración success por: "+reason);
                        });

                }else{
                    swal("¡Lo sentimos!", "Sólo se puede valorar una vez acerca de un producto.", "error");
                }
            });
        }

        vm.mostrarInformacion = function() {
            var info = document.getElementById("descripcionDetalle");
            var none = info.classList.contains('none');

            if(none){
                info.classList.remove('none');
                info.classList.add('inline');
            }
            else{
                info.classList.remove('inline');
                info.classList.add('none');
            }
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
    }]);