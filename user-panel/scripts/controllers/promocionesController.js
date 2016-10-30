/**
 * Created by i_d_a on 25/04/2016.
 */
angular.module('sbAdminApp')

    .controller('PromocionesCtrl', ['ProductosMulti', 'ListaUnica', 'ListasMulti','Empresa', '$http', 'Usuarios', 'Productos', 'Tickets', '$stateParams', function (ProductosMulti, Listas, ListasMulti,
                                                                                                                                                                    Empresa, $http, Usuarios, Productos, Tickets, $stateParams) {
        var vm = this;
        var usuario = Usuarios.get({id : document.getElementById("hiddenId").value});
        console.log(document.getElementById("hiddenId").value);
        var idusu;
        //var response = Listas.query();
        var listasUsuario = [];
        var listasMostrar = [];
        var cantidades = [];
        var numElemsPag = 5;
        vm.hayListas = false;
        vm.nombreLista = "";
        vm.listasUsu = true;
        vm.listaVacia=false;

        vm.totalPrecio = 0;
        vm.totalCantidad = 0;

        vm.cargado = false;

        vm.inicioPaginacion = 0;
        vm.finPaginacion = numElemsPag;
        vm.numPags = 0;

        vm.paginacionActual = 1;
        vm.navegacion = [];
        //Se cogen las referencias

        //Cuando se ordene, hacer funcion "cargarCantidades" para que no sea tan lento el recargado de la pagina al cambiar la cantidad de un producto
        vm.cargarProductosLista = function(listaId){
            vm.ordenLista='name';
            var producto;
            var response = Listas.get({ id: listaId});
            response.$promise.then(function(data){
                if(data.predefinida==true)
                    vm.listasUsu=false;
                else
                    vm.listasUsu=true;

                //Variables accedidas por el HTML
                vm.productosEnLista=[];

                var productosObj = data.productos;
                cantidades = data.productos;
                vm.nombreLista = data.name;
                if(productosObj.length<=0)
                    vm.listaVacia=true;
                for(var i=0;i<productosObj.length;i++){
                    response = Productos.get({id : productosObj[i].prod_id});
                    response.$promise
                        .then(function(data, i){
                            producto = data;
                            vm.productosEnLista.push(producto);
                        },function(reason){
                            console.log("Error en devuelveCatalogo por: "+reason);
                        });
                }
            });
        }

        vm.searchListas = function(){


            vm.listasUsu = true;

            vm.listas = [];

            var response3 = $http.post('./../api/promociones/promocionesPorUsuario', {'id_usuario': idusu, 'inicio':vm.inicioPaginacion, 'fin': vm.finPaginacion });

            response3.success(function(data){
                listasMostrar = data.array;
                if(listasMostrar!=null && listasMostrar.length<=0) {
                    vm.hayListas = false;
                }else{
                    vm.hayListas = true;
                }

                console.log(listasMostrar);
                vm.numPags = Math.ceil(parseInt(data.total)/numElemsPag);
                for(var i=1; i<=vm.numPags; i++)
                    vm.navegacion.push(i);

                document.getElementById('loaderPromociones').classList.remove('bubbles');
                vm.cargado = true;
                vm.listas = listasMostrar;
                console.log(data);
            });

        }

        // LISTAS PREDEFINIDAS
        vm.cambiarListas = function(){
            vm.listasUsu = false;
            var response2;
            listasMostrar = [];

            var response4 = $http.post('./../api/promociones/promocionesBasadasEnCompras', {'id_usuario': idusu,'inicio': vm.inicioPaginacion, 'fin': vm.finPaginacion});

            response4.success(function(data){
                listasMostrar = data.array;

                vm.numPags = Math.ceil(parseInt(data.total)/numElemsPag);
                for(var i=1; i<=vm.numPags; i++)
                    vm.navegacion.push(i);

                vm.listas = listasMostrar;
            });
        }


        if($stateParams.listaId){
            vm.cargarProductosLista($stateParams.listaId);
        }

        //Se cogen las referencias a productos del usuario
        usuario.$promise
            .then(function(data) {
                idusu = data._id;
                vm.searchListas();
            },function(reason){
                console.log("Problema cogiendo la referencia a listas del usuario"+reason);
            });

        vm.listas = listasMostrar;

        vm.total = [ {cantidad: 9, precio:13.09} ];

        /**
         * Devuelve la cantidad de un producto en la lista cargada
         * @param prod_id
         */

        vm.cambiarPestanya = function(num){
            vm.inicioPaginacion = 0;
            vm.finPaginacion = numElemsPag;
            vm.numPags = 0;
            vm.navegacion = [];
            console.log(num);
            vm.paginacionActual = 1;
            switch(num){
                case 0: vm.searchListas();
                    break;
                case 1: vm.cambiarListas();
                    break;
                default:vm.searchListas();
                    break;
            }
        }

        vm.dameCantidad = function(prod_id){
            if (prod_id != null){
                for(var i=0;i<cantidades.length;i++){
                    if(prod_id.localeCompare(cantidades[i].prod_id) == 0){
                        return cantidades[i].cantidad;

                    }
                }
            }else{
                console.log("No hay cantidad asociada a "+prod_id);
            }
            return 0;
        }

        vm.dameEmpresa = function(prod_id, indice){
            if (prod_id != null){
                for(var i=0;i<cantidades.length;i++){
                    if(prod_id.localeCompare(cantidades[i].prod_id) == 0){
                        var responseDameEmpresa = Empresa.get({id: cantidades[i].empresa});
                        responseDameEmpresa.$promise
                            .then(function(data){
                                return data.name;
                            }, function(reason){
                                console.log("Error buscando empresa: "+reason);
                            });
                    }
                }
            }else{
                console.log("No hay empresa asociada a "+prod_id);
            }
            return 0;
        }

        vm.calcularCantidadTotal = function(){
            var suma = 0;
            for(var i =0;i<cantidades.length;i++){
                suma += cantidades[i].cantidad;
            }
            return suma;
        }

        vm.restarCantidad = function(id_producto, indice){
            if(vm.productosEnLista[indice].cantidad<=1){
                vm.eliminarProducto(vm.productosEnLista[indice].name, id_producto);
            }else {
                var responseRestar = $http.post('./../api/listas/cambiarCantidadProducto', {
                    'id_producto': id_producto,
                    'id_lista': $stateParams.listaId,
                    'cantidad': -1
                });

                responseRestar.success(function (datarc) {
                    listasMostrar = datarc;
                    vm.listas = listasMostrar;
                    //vm.cargarProductosLista($stateParams.listaId);

                    vm.productosEnLista[indice].cantidad = vm.productosEnLista[indice].cantidad - 1;
                    vm.calcularPrecioTotal();
                });
            }
        }

        vm.sumarCantidad = function(id_producto, indice){
            var responseSumar = $http.post('./../api/listas/cambiarCantidadProducto', {'id_producto': id_producto, 'id_lista': $stateParams.listaId, 'cantidad': 1});

            responseSumar.success(function(datars){
                listasMostrar = datars;
                vm.listas = listasMostrar;
                //vm.cargarProductosLista($stateParams.listaId);

                vm.productosEnLista[indice].cantidad = vm.productosEnLista[indice].cantidad+1;
                vm.calcularPrecioTotal();
            });
        }

        vm.eliminarProducto = function(nombre_producto, id_producto){

            swal({
                    title: "¿Eliminar "+ nombre_producto +" de la lista?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Eliminar",
                    closeOnConfirm: false
                },
                function(){
                    //Eliminar producto
                    var responseElimProduct = $http.post('./../api/listas/eliminarProductoLista', {'id_producto': id_producto, 'id_lista': $stateParams.listaId});

                    responseElimProduct.success(function(datare){
                        if(datare=="true") {
                            swal("¡Hecho!", nombre_producto + " ha sido eliminado de la lista.", "success");
                            vm.listas = listasMostrar;
                            vm.cargarProductosLista($stateParams.listaId);
                        }else
                            swal("¡Error!", "Se ha producido un error.", "error");
                    });

                }
            );
        }

        vm.eliminarLista = function(listaId){
            var nombreListaEliminar ="";

            var response = Listas.get({ id: listaId});
            response.$promise.then(function(data) {
                nombreListaEliminar=data.name;

                swal({
                        title: "¿Eliminar lista "+nombreListaEliminar+"?",
                        text: "Una vez eliminada no podrás volver a acceder a ella",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Eliminar",
                        closeOnConfirm: false
                    },
                    function(){
                        //Eliminar lista
                        var response = Listas.delete({id: data._id});
                        response.$promise.then(function(data){
                            document.getElementById("listasUsu").classList.remove("headerListasSel");
                            vm.searchListas();
                            swal("¡Hecho!", "La lista "+nombreListaEliminar+" ha sido eliminada.", "success");
                        }, function(err){
                            swal("¡Error!", "Se ha producido un error.", "error");
                        });

                    }
                );
            });

        }

        vm.calcularPrecioTotal = function(){
            vm.totalPrecio = 0;
            vm.totalCantidad = 0;
            if(vm.productosEnLista!=null) {
                for (var l = 0; l < vm.productosEnLista.length; l++) {
                    if(vm.productosEnLista[l].precio!=null && vm.productosEnLista[l].cantidad!=null) {
                        vm.totalCantidad += vm.productosEnLista[l].cantidad;
                        vm.totalPrecio += vm.productosEnLista[l].precio * vm.productosEnLista[l].cantidad;
                    }
                }
            }
        }

        //Genera una compra real con los productos existentes en la lista de compra
        vm.generarTicket = function(){
            var prods = [];
            var prodAux = "";
            for(var j=0; j<vm.productosEnLista.length; j++){
                prodAux = {id_prod: vm.productosEnLista[j]._id, cantidad: vm.productosEnLista[j].cantidad, precio_ud: vm.productosEnLista[j].precio};

                prods.push(prodAux);
            }
            //importe, empresa, usuario, productos(id, cantidad, precio) establecimiento
            var response = Tickets.save({'importe': vm.totalPrecio.toFixed(2), 'empresa': vm.productosEnLista[0].idEmpresa, usuario: usuario._id, productos: prods, establecimiento: null });

            response.$promise
                .then(function(data) {
                    var cont = 0;
                    for(var m=0; m<vm.productosEnLista.length; m++){
                        var response = $http.post('./../api/usuarios/modificarProducto', {'id_usuario': idusu, 'id_empresa': vm.productosEnLista[m].idEmpresa, 'id_producto': vm.productosEnLista[m]._id, 'cantidad': vm.productosEnLista[m].cantidad });
                        response.success(function(datarc){
                            cont++;
                            if(cont==vm.productosEnLista.length)
                                swal("¡Hecho!", "Tu ticket ha sido generado. Puedes verlo en el Historial de compras", "success");
                        });


                    }
                },function(reason){

                });
        }

        vm.dameNombreMes = function(num){
            switch(num){
                case 0:  return "Enero"; break;
                case 1:  return "Febrero"; break;
                case 2:  return "Marzo"; break;
                case 3:  return "Abril"; break;
                case 4:  return "Mayo"; break;
                case 5:  return "Junio"; break;
                case 6:  return "Julio"; break;
                case 7:  return "Agosto"; break;
                case 8:  return "Septiembre"; break;
                case 9:  return "Octubre"; break;
                case 10: return "Noviembre"; break;
                case 11: return "Diciembre"; break;
            }
        }

        vm.formatearFechaPretty = function(fecha){
            var date = new Date(fecha);
            var fecha = date.getDate().toString() + " de " + vm.dameNombreMes(date.getMonth()) + " de " + date.getFullYear().toString();
            return fecha;
        }

        vm.cambiarPaginacion = function(num){
            if(num>0 && num<=vm.numPags) {
                vm.paginacionActual = num;
                vm.inicioPaginacion = (num - 1) * numElemsPag;
                vm.finPaginacion = vm.inicioPaginacion + numElemsPag;
                if(vm.listasUsu==false) {
                    var linkPre=document.getElementById("listasPre").classList.remove("headerListasSel");
                    vm.cambiarListas();
                }else{
                    var linkPre=document.getElementById("listasUsu").classList.remove("headerListasSel");
                    vm.searchListas();
                }
            }
        }
    }]);