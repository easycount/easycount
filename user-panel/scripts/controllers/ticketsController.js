angular.module('sbAdminApp')
    .controller('TicketsCtrl', ['$scope', '$timeout','Tickets','TicketUnico','Productos','Empresa','Usuarios', '$stateParams','$http', function ($scope, $timeout, Tickets , TicketUnico ,Productos, Empresa,Usuarios, $stateParams,$http) {
        var vm = this;
        var tickets = [];
        var cantidades = [];
        var precios = [];
        var empresa = null;
        var numElemsPag = 10;


        vm.tickets=[];
        vm.totalCantidad = 0;
        vm.totalPrecio = 0;
        vm.ticketVacio = false;

        vm.cargado = false;

        vm.inicioPaginacion = 0;
        vm.finPaginacion = numElemsPag;
        vm.numPags = 0;

        vm.paginacionActual = 1;
        vm.navegacion = [];

        vm.cargarTickets = function() {
            var response3 = $http.post('./../api/tickets/ticketsUsuario', {'id_usuario': document.getElementById("hiddenId").value, 'inicio': vm.inicioPaginacion, 'cantidad':vm.finPaginacion });

            response3.success(function (data) {
                document.getElementById('loaderTickets').classList.remove('bubbles');
                vm.cargado = true;
                vm.tickets = data.array;
                vm.numPags = Math.ceil(parseInt(data.total)/numElemsPag);
                for(var i=1; i<=vm.numPags; i++)
                    vm.navegacion.push(i);
                /*for (var i = 0; i < data.length; i++) {
                    vm.tickets[i] = data[i];
                    //vm.asociarNombreEmpresaTicket(i, vm.tickets[i].empresa);
                }*/
            });
        }
        vm.ticketVacio = false;

        /*
        vm.asociarNombreEmpresaTicket = function(indice, ticketId){
            var responseTicket = Empresa.get({ id: ticketId});
            responseTicket.$promise.then(function(data) {
                empresa=data;
                vm.tickets[indice]['nombreEmpresa'] = data.name;
                vm.tickets[indice]['fotoEmpresa'] = data.photo;
            }, function(reason){
                console.log("Error")
            });
        }
        */
        vm.cargarTickets();

        vm.cargarProductosTicket = function(ticketId){
            var responseTicket = TicketUnico.get({ id: ticketId});
            responseTicket.$promise.then(function(data){
                vm.fechaTicket = data.fecha;
                vm.productosEnTicket=[];
                vm.totalPrecio = data.importe;

                var productosObj = data.productos;
                cantidades = data.productos;
                vm.cargaObjetoEmpresa(data.empresa);

                if(productosObj.length<=0)
                    vm.ticketVacio=true;

                for(var i=0;i<productosObj.length;i++){
                    var responseProductosEnTicket = Productos.get({id : productosObj[i].id_prod});
                    responseProductosEnTicket.$promise
                        .then(function(data){
                            vm.productosEnTicket.push(data);
                        },function(reason){
                            console.log("Error en cargarProductosTicket por: "+reason);
                        });
                }

            }, function(reason){
                console.log("Error en cargarProductosTicket fuera por: "+reason);
            });
        }


        if($stateParams.ticketId)
            vm.cargarProductosTicket($stateParams.ticketId);

        vm.dameCantidad = function(prod_id){
            for(var i=0; i<cantidades.length; i++){
                if(cantidades[i].id_prod.localeCompare(prod_id) == 0){
                    return cantidades[i].cantidad;
                }
            }
            return 0;
        }

        vm.damePrecio = function(prod_id){
            for(var i=0; i<precios.length; i++){
                if(precios[i].prod_id.localeCompare(prod_id) == 0){
                    return precios[i].precio;
                }
            }
            return 0;
        }

        vm.cargaObjetoEmpresa = function(id_empresa){
            var responseEmpresa = Empresa.get({id: id_empresa});
            responseEmpresa.$promise
                .then(function(data){
                    precios = data.catalogo;
                    empresa = data;
                },function(reason){
                    console.log("Error en cargaObjetoEmpresa por: "+reason);
                });
        }

        //Recorre y añade a los objetos productosEnTicket su precio, empresa y cantidad
        vm.cargarPreciosTicket = function(){
            for(var l=0; l<vm.productosEnTicket.length; l++){
                if(vm.productosEnTicket[l]!=null) {
                    var prod_id = vm.productosEnTicket[l]._id;
                    if (prod_id != null) {
                        for (var i = 0; i < cantidades.length; i++) {
                            if (prod_id.localeCompare(cantidades[i].id_prod) == 0) {
                                vm.productosEnTicket[l]['cantidad']=cantidades[i].cantidad;
                                vm.asociarEmpresaTicket(l, prod_id, cantidades[i].empresa);
                            }
                        }
                    } else {
                        console.log("No hay empresa asociada a " + prod_id);
                    }
                }
            }
        }

        vm.asociarEmpresaTicket = function(indiceProducto, id_producto, idEmpresa){
            var prods = empresa.catalogo;
            var encontradoProd = false;
            for (var j = 0; j < prods.length; j++) {
                //Encuentra el producto en el array de productos de la lista
                if (id_producto == prods[j].prod_id && encontradoProd == false) {
                    encontradoProd = true;
                    vm.productosEnTicket[indiceProducto]['precio'] = prods[j].precio;
                    vm.calcularCantidadTotal();
                }
            }
        }

        vm.calcularCantidadTotal = function(){
            vm.totalCantidad = 0;
            if(vm.productosEnTicket!=null){
                for (var l = 0; l < vm.productosEnTicket.length; l++) {
                    if(vm.productosEnTicket[l].cantidad!=null) {
                        vm.totalCantidad += vm.productosEnTicket[l].cantidad;
                    }
                }
            }
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

        vm.formatearFecha = function(fecha){
            var date = new Date(fecha);
            return date.toLocaleString();
        }

        vm.formatearFechaPretty = function(fecha){
            var date = new Date(fecha);
            var fecha = date.getDate().toString() + " de " + vm.dameNombreMes(date.getMonth()) + " de " + date.getFullYear().toString();
            fecha += " - ";
            fecha += date.getHours()+":"+("0" + date.getMinutes()).slice(-2);
            return fecha;
        }

        vm.eliminarTicket = function(id) {
            var nombreTicketEliminar = "";
            var response = $http.get("./../api/tickets/"+id);
            response.success(function (data) {
                var infoTicket = data.productos.slice();
                var infoEmpresa = data.empresa;
                nombreTicketEliminar = data.name;
                swal({
                        title: "¿Eliminar ticket?",
                        text: "Una vez eliminado no podrás volver a acceder a él",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Eliminar",
                        closeOnConfirm: false
                    },
                    function () {
                        //Eliminar ticket
                        var response = $http.delete("./../api/tickets/"+data._id);//Tickets.delete({id: data._id});
                        response.success(function (data2) {
                            swal("¡Hecho!", "El ticket ha sido eliminado.", "success");

                            var cont=0;
                            //Eliminamos los objetos del usuario
                            //var prods = infoTicket.productos;
                            for(var q=0; q<infoTicket.length; q++){
                                var response3 = $http.post('./../api/usuarios/modificarProducto',
                                    {
                                        'id_usuario': document.getElementById("hiddenId").value,
                                        'id_producto': infoTicket[q].id_prod,
                                        'id_empresa': infoEmpresa,
                                        'cantidad': infoTicket[q].cantidad*-1
                                    }
                                );
                                response3.success(function(data3){
                                    alert(data3);
                                    cont++;
                                    if(cont>=infoTicket.length-1){
                                        $timeout(function(){location.reload()}, 3000);
                                    }
                                });
                            }
                        }, function (err) {
                            swal("¡Error!", "Se ha producido un error.", "error");
                        });

                    }
                );
            });
        }
        vm.cambiarPaginacion = function(num){
            if(num>0 && num<=vm.numPags) {
                vm.paginacionActual = num;
                vm.inicioPaginacion = (num - 1) * numElemsPag;
                vm.finPaginacion = vm.inicioPaginacion + numElemsPag;

                vm.cargarTickets();

            }
        }
    }]);
