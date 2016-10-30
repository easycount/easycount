/**
 * Created by Enrique 2 on 19/12/2015.
 */
angular.module('sbAdminApp')

    .controller('ListasCtrl', ['ProductosMulti', 'ListaUnica', 'ListasMulti','Empresa', '$http', '$timeout', 'Usuarios', 'Productos', 'Tickets', '$stateParams', function (ProductosMulti, Listas, ListasMulti,
                                                                                                                                                               Empresa, $http, $timeout, Usuarios, Productos, Tickets, $stateParams) {
        var vm = this;
        var usuario = Usuarios.get({id : document.getElementById("hiddenId").value});
        var idusu;
        //var response = Listas.query();
        var listasUsuario = [];
        var listasMostrar = [];
        var cantidades = [];
        var numElemsPag = 5;
        vm.cargado = false;
        vm.hayListas = false;
        vm.nombreLista = "";
        vm.listasUsu = true;
        vm.listaVacia=false;

        vm.totalPrecio = 0;
        vm.totalCantidad = 0;

        vm.todosDescuentos  = [];
        vm.descuentosAplicables = [];

        vm.inicioPaginacion = 0;
        vm.finPaginacion = numElemsPag;
        vm.numPags = 0;

        vm.paginacionActual = 1;
        vm.navegacion = [];

        var avisoMostrado = false;

        vm.todasPromociones = [];
        vm.promocionesLista = [];
        vm.promocionesDesglosadas = [];
        vm.promocionesDesechadas = [];
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

                var response = $http.post('./../api/listas/productosLista', {id_lista: listaId});

                response.success(function(resultado){
                    vm.productosEnLista = resultado.array;
                    cantidades = resultado.array;

                    vm.nombreLista = data.name;
                    if(vm.productosEnLista.length<=0)
                        vm.listaVacia=true;

                    vm.cargarPromociones();
                    vm.calcularPrecioTotal();
                });
            });
        }

        vm.searchListas = function() {
            vm.listasUsu = true;
            vm.listas = [];

            var response3 = $http.post('./../api/listas/listasUsuario', {
                'id_usuario': idusu,
                'inicio': vm.inicioPaginacion,
                'cantidad': vm.finPaginacion
            });

            response3.success(function (data) {
                listasMostrar = data.array;
                vm.numPags = Math.ceil(parseInt(data.total) / numElemsPag);
                for (var i = 1; i <= vm.numPags; i++)
                    vm.navegacion.push(i);

                document.getElementById('loaderListas').classList.remove('bubbles');
                vm.cargado = true;
                vm.listas = listasMostrar;

            });
        }

        // LISTAS PREDEFINIDAS
        vm.cambiarListas = function(){

            vm.listasUsu = false;
            var response2;
            listasMostrar = [];

            var response4 = $http.post('./../api/listas/listasPredefinidas', {'inicio': vm.inicioPaginacion, 'cantidad': vm.finPaginacion});

            response4.success(function(data){
                listasMostrar = data.array;
                vm.numPags = Math.ceil(parseInt(data.total)/numElemsPag);
                for(var i=1; i<=vm.numPags; i++)
                    vm.navegacion.push(i);

                vm.listas = listasMostrar;
            });

        }

        //Recorre y añade a los objetos productosEnLista su precio, empresa y cantidad
        vm.cargarPrecios = function(){
            for(var l=0; l<vm.productosEnLista.length; l++){
                if(vm.productosEnLista[l]!=null) {
                    var prod_id = vm.productosEnLista[l]._id;
                    if (prod_id != null) {
                        for (var i = 0; i < cantidades.length; i++) {
                            if (prod_id.localeCompare(cantidades[i].prod_id) == 0) {
                                vm.productosEnLista[l]['cantidad']=cantidades[i].cantidad;
                                vm.asociarEmpresa(l, prod_id, cantidades[i].empresa);
                            }
                        }
                    } else {
                        console.log("No hay empresa asociada a " + prod_id);
                    }
                }
            }
        }

        vm.asociarEmpresa = function(indiceProducto, id_producto, idEmpresa){
            if(vm.listasUsu == true) {
                var responseDameProd = Empresa.get({id: idEmpresa});
                responseDameProd.$promise
                    .then(function (dataProd) {
                        var prods = dataProd.catalogo;
                        var encontradoProd = false;
                        for (var j = 0; j < prods.length; j++) {
                            //Encuentra el producto en el array de productos de la lista
                            if (id_producto == prods[j].prod_id && encontradoProd == false) {
                                encontradoProd = true;
                                vm.productosEnLista[indiceProducto]['empresa'] = dataProd.photo;
                                vm.productosEnLista[indiceProducto]['nombreEmpresa'] = dataProd.name;
                                vm.productosEnLista[indiceProducto]['idEmpresa'] = dataProd._id;
                                vm.productosEnLista[indiceProducto]['precio'] = prods[j].precio;
                                vm.productosEnLista[indiceProducto]['indice'] = indiceProducto;
                                vm.calcularPrecioTotal();
                            }
                        }
                    }, function (reasonProd) {
                        console.log("Error buscando precio: " + reasonProd);
                    });
            }
        }

        if($stateParams.listaId){
            vm.cargarProductosLista($stateParams.listaId);
        }

        //Se cogen las referencias a productos del usuario
        usuario.$promise
            .then(function(data) {
                idusu = data._id;
                vm.hayListas = true;
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

        vm.cargarPromociones = function(){
            var promocionesCompras, promocionesUsu;

            var response1 = $http.post('./../api/promociones/promocionesBasadasEnCompras', {'id_usuario': idusu});

            response1.success(function(data1){
                promocionesCompras = data1.array;
                var response2 = $http.post('./../api/promociones/promocionesPorUsuario', {'id_usuario': idusu});
                response2.success(function(data2){
                    promocionesUsu = data2.array;
                    vm.todasPromociones = concatenarArrays(promocionesCompras, promocionesUsu);
                    vm.filtrarPromociones();
                });
            });
        }

        //Nos quedamos con las promociones aplicables
        vm.filtrarPromociones = function(){
            var prodsAux = [];
            var anyadida = false;
            var indiceProd = -1;
            vm.promocionesDesglosadas = [];
            vm.promocionesDesechadas = [];
            //Recorremos las promociones
            for(var t=0; t<vm.todasPromociones.length; t++){
                prodsAux = vm.todasPromociones[t].productos;
                empAux = vm.todasPromociones[t].empresa;
                indiceProd = -1;
                anyadida=false;
                //Recorremos los productos y los comparamos con cada promoción para ver si se puede aplicar
                for(var r=0; r<vm.productosEnLista.length; r++){
                    indiceProd = prodsAux.indexOf(vm.productosEnLista[r]._id);
                    if(indiceProd!=-1 && vm.productosEnLista[r].idEmpresa == empAux){
                        vm.promocionesLista.push(vm.todasPromociones[t]);
                        vm.promocionesDesglosadas.push({
                            name: vm.todasPromociones[t].name,
                            description: vm.todasPromociones[t].description,
                            empresa: vm.todasPromociones[t].empresa,
                            photoEmpresa: vm.productosEnLista[r].empresa,
                            f_desde: vm.todasPromociones[t].f_desde,
                            f_hasta: vm.todasPromociones[t].f_hasta,
                            tipo: vm.todasPromociones[t].tipo,
                            producto: vm.productosEnLista[r].name,
                            idProducto: vm.productosEnLista[r]._id,
                            precioProducto: vm.productosEnLista[r].precio,
                            cantidadProducto: vm.productosEnLista[r].cantidad
                        })
                        vm.calcularTipoOferta(vm.promocionesDesglosadas.length-1);
                    }
                }
                if(avisoMostrado==false)
                    $timeout(vm.avisoPromos, 3000);
                vm.calcularPrecioTotal();
            }
        }

        vm.calcularTipoOferta = function(indice){
            var promocion = vm.promocionesDesglosadas[indice];
            switch(promocion.tipo){
                case "Descuento del 5%":
                    vm.promocionesDesglosadas[indice]['valorDescuento'] = 0.05*vm.promocionesDesglosadas[indice].precioProducto;
                    break;
                case "Descuento del 10%":
                    vm.promocionesDesglosadas[indice]['valorDescuento'] = 0.1*vm.promocionesDesglosadas[indice].precioProducto;
                    break;
                case "Descuento del 15%":
                    vm.promocionesDesglosadas[indice]['valorDescuento'] = 0.15*vm.promocionesDesglosadas[indice].precioProducto;
                    break;
                case "Descuento del 20%":
                    vm.promocionesDesglosadas[indice]['valorDescuento'] = 0.2*vm.promocionesDesglosadas[indice].precioProducto;
                    break;
                case "Descuento del 25%":
                    vm.promocionesDesglosadas[indice]['valorDescuento'] = 0.25*vm.promocionesDesglosadas[indice].precioProducto;
                    break;
                case "2x1":
                    if(vm.promocionesDesglosadas[indice].cantidadProducto>=2){
                        var cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto;
                        if(vm.promocionesDesglosadas[indice].cantidadProducto%2==0){//Par
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto;
                        }else{//Impar
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto-1;
                        }
                        vm.promocionesDesglosadas[indice]['valorDescuento'] = cantidadADescontar*vm.promocionesDesglosadas[indice].precioProducto/2;
                    }else{
                        //Eliminar promoción del array
                        vm.promocionesDesechadas.push(vm.promocionesDesglosadas[indice]);
                        vm.promocionesDesglosadas.splice(indice, 1);
                    }
                    break;
                case "3x2":
                    if(vm.promocionesDesglosadas[indice].cantidadProducto>=3){
                        var cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto;

                        if(vm.promocionesDesglosadas[indice].cantidadProducto%3==0){//Todos los productos entran en promoción
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto;
                        }else if((vm.promocionesDesglosadas[indice].cantidadProducto-1)%3==0){//Un producto no entra en promoción
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto-1;
                        }else if((vm.promocionesDesglosadas[indice].cantidadProducto-2)%3==0){//Dos productos no entran en promoción
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto-2;
                        }
                        vm.promocionesDesglosadas[indice]['valorDescuento'] = cantidadADescontar/3*vm.promocionesDesglosadas[indice].precioProducto;
                    }else{
                        //Eliminar promoción del array
                        vm.promocionesDesechadas.push(vm.promocionesDesglosadas[indice]);
                        vm.promocionesDesglosadas.splice(indice, 1);
                    }
                    break;
                case "2º unidad 25%":
                    if(vm.promocionesDesglosadas[indice].cantidadProducto>=2){
                        var cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto;
                        if(vm.promocionesDesglosadas[indice].cantidadProducto%2==0){//Par
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto;
                        }else{//Impar
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto-1;
                        }
                        vm.promocionesDesglosadas[indice]['valorDescuento'] = cantidadADescontar*vm.promocionesDesglosadas[indice].precioProducto/2 * 0.75;
                    }else{
                        //Eliminar promoción del array
                        vm.promocionesDesechadas.push(vm.promocionesDesglosadas[indice]);
                        vm.promocionesDesglosadas.splice(indice, 1);
                    }
                    break;
                case "2º unidad 50%":
                    if(vm.promocionesDesglosadas[indice].cantidadProducto>=2){
                        var cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto;
                        if(vm.promocionesDesglosadas[indice].cantidadProducto%2==0){//Par
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto;
                        }else{//Impar
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto-1;
                        }
                        vm.promocionesDesglosadas[indice]['valorDescuento'] = cantidadADescontar*vm.promocionesDesglosadas[indice].precioProducto/2 * 0.5;
                    }else{
                        //Eliminar promoción del array
                        vm.promocionesDesechadas.push(vm.promocionesDesglosadas[indice]);
                        vm.promocionesDesglosadas.splice(indice, 1);
                    }
                    break;
                case "3º unidad 25%":
                    if(vm.promocionesDesglosadas[indice].cantidadProducto>=3){
                        var cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto;

                        if(vm.promocionesDesglosadas[indice].cantidadProducto%3==0){//Todos los productos entran en promoción
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto;
                        }else if((vm.promocionesDesglosadas[indice].cantidadProducto-1)%3==0){//Un producto no entra en promoción
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto-1;
                        }else if((vm.promocionesDesglosadas[indice].cantidadProducto-2)%3==0){//Dos productos no entran en promoción
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto-2;
                        }
                        vm.promocionesDesglosadas[indice]['valorDescuento'] = cantidadADescontar/3*vm.promocionesDesglosadas[indice].precioProducto*0.75;
                    }else {
                        //Eliminar promoción del array
                        vm.promocionesDesechadas.push(vm.promocionesDesglosadas[indice]);
                        vm.promocionesDesglosadas.splice(indice, 1);
                    }
                    break;
                case "3º unidad 50%":
                    if(vm.promocionesDesglosadas[indice].cantidadProducto>=3){
                        var cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto;

                        if(vm.promocionesDesglosadas[indice].cantidadProducto%3==0){//Todos los productos entran en promoción
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto;
                        }else if((vm.promocionesDesglosadas[indice].cantidadProducto-1)%3==0){//Un producto no entra en promoción
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto-1;
                        }else if((vm.promocionesDesglosadas[indice].cantidadProducto-2)%3==0){//Dos productos no entran en promoción
                            cantidadADescontar = vm.promocionesDesglosadas[indice].cantidadProducto-2;
                        }
                        vm.promocionesDesglosadas[indice]['valorDescuento'] = cantidadADescontar/3*vm.promocionesDesglosadas[indice].precioProducto*0.5;
                    }else {
                        //Eliminar promoción del array
                        vm.promocionesDesechadas.push(vm.promocionesDesglosadas[indice]);
                        vm.promocionesDesglosadas.splice(indice, 1);
                    }
                    break;
                default: break;
            }
        }

        vm.cambiarPestanya = function(num){
            vm.inicioPaginacion = 0;
            vm.finPaginacion = numElemsPag;
            vm.numPags = 0;
            vm.navegacion = [];

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
                    vm.filtrarPromociones();
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
                vm.filtrarPromociones();
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
                            vm.filtrarPromociones();
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

            for(var z=0; z<vm.promocionesDesglosadas.length; z++){
                vm.totalPrecio -= vm.promocionesDesglosadas[z].valorDescuento;
            }
            document.getElementById('loaderListas2').classList.remove('bubbles');
            vm.cargado = true;
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
            fecha += " - ";
            fecha += date.getHours()+":"+("0" + date.getMinutes()).slice(-2);
            return fecha;
        }

        vm.formatearFechaFran = function(fecha){
            var date = new Date(fecha);
            var fecha = date.getDate().toString() + "/" + (parseInt(date.getMonth())+1) + "/" + date.getFullYear().toString();
            return fecha;
        }

        vm.avisoPromos = function(){
            //if(vm.promocionesDesechadas.length>0){
            avisoMostrado = true;

            if(window.location.href.indexOf("/viewLista/")!=-1) {

                if(vm.promocionesDesechadas.length>0) {
                    var lista = "<ul>";
                    for (var i = 0; i < vm.promocionesDesechadas.length; i++) {
                        lista += "<li>" + vm.promocionesDesechadas[i].name + " - " + vm.promocionesDesechadas[i].producto + "</li>";
                    }
                    lista += "</ul>";
                    swal(
                        {
                            title: "¡ATENCIÓN!",
                            html: true,
                            text: "<p>Las siguientes promociones aplicables a productos de tu lista están siendo desaprovechadas:</p><br />"
                            + "<div style='text-align:center;list-style-position: inside;' id='promosDes'>" + lista + "</div>"
                            ,
                            type: "warning",
                            showCancelButton: false,
                            closeOnConfirm: true,
                            animation: "slide-from-top"
                        }
                    );
                }
            }
        }

        //COMIENZO GENERAR PDF
        demoFromHTML = function() {
            document.getElementById('impresion').style.display='block';
            var pdf = new jsPDF('p', 'pt', 'letter');
            // source can be HTML-formatted string, or a reference
            // to an actual DOM element from which the text will be scraped.
            var nombreLista = 'Prueba';
            var source = document.getElementById("impresion");
            var divv = document.getElementById("superDiv");
            divv.style.display = 'block';
            source.style.visibility = 'visible';



            // we support special element handlers. Register them with jQuery-style
            // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
            // There is no support for any other type of selectors
            // (class, of compound) at this time.
            specialElementHandlers = {
                // element with id of "bypass" - jQuery style selector
                '#bypassme': function (element, renderer) {
                    // true = "handled elsewhere, bypass text extraction"
                    return true
                }
            };
            var margins = {
                top: 80,
                bottom: 60,
                left: 40,
                width: 522
            };
            // all coords and widths are in jsPDF instance's declared units
            // 'inches' in this case
            pdf.addHTML(source, function () {
                var string = pdf.output('datauristring');
                $('.preview-pane').attr('src', string);
            });

        }

        escapar = function() {
            var source = document.getElementById("impresion");
            var divv = document.getElementById("superDiv");
            divv.style.display = 'none';
            source.style.display = 'none';
        }

        document.onkeydown = function(evt) {
            evt = evt || window.event;
            if (evt.keyCode == 27) {
                escapar();
            }
        };
        //FIN DE GENERAR PDF

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

        //Funcion que elimina los valores duplicados de un array
        function concatenarArrays(array1, array2) {
            var insertado = false;
            for(var i=0; i<array1.length; i++){
                insertado = false;
                for(var j=0; j<array2.length; j++){
                    if(array1[i]._id == array2._id && insertado==false){
                        array2.push(array1[i]);
                        insertado=true;
                    }
                }
            }
            return array2;
        }
    }]);