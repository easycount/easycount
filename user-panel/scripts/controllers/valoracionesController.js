angular.module('sbAdminApp')

    .controller('valoracionesCtrl', ['$stateParams', 'Usuarios', 'Productos', 'Empresas', '$http', function ($stateParams, Usuarios, Productos, Empresas, $http)
    {
        var vm = this;
        vm.ordenVal = "name";
        vm.usuario;

        vm.productosValorados1 = [];
        vm.productosOpinados1 = [];

        var usuario = Usuarios.get({id : $stateParams.userId});
        usuario.$promise
            .then(function(data) {
                vm.usuario = data;

                if(window.location.href.indexOf("valoraciones")!=-1) {
                    vm.rellenarProductosValorados();
                }else{
                    vm.rellenarProductosOpinados();
                }
            },function(reason){
                console.log("Problema cogiendo el nombre del usuario: "+reason);
            });

        vm.rellenarProductosValorados = function(){
            var productos = vm.usuario.productos;
            for(var i=0; i< productos.length; i++){
                vm.buscarValoracion(productos[i].id_prod, productos[i].empresa, i, productos.length-1);
            }
        }

        vm.rellenarProductosOpinados = function(){
            var productos = vm.usuario.productos;
            for(var i=0; i< productos.length; i++){
                vm.buscarOpinion(productos[i].id_prod, productos[i].empresa, i, productos.length-1);
            }
        }

        vm.buscarValoracion = function(id_producto, emp, actual, ultimo){
            var responseValProduct = Productos.get({'id':id_producto});
            responseValProduct.$promise
                .then(function(prod) {
                    var nombre = prod.name;
                    var response = $http.post("./../api/productos/valoradoPorUsuario", {'id_producto': id_producto, 'id_empresa': emp,'id_usuario': vm.usuario._id});
                    response.success(function (data) {
                        if(data != "false"){
                            data['nombreProducto'] = nombre;
                            data['_id'] = id_producto;
                            data['fechaOrden'] = new Date(data.fecha);
                            var indice = vm.productosValorados1.push(data);
                            indice = indice-1;
                            vm.getNombreEmpresaVal(indice, vm.productosValorados1[indice].empresa);
                        }
                    })
                },function(reason){
                });
        }

        vm.buscarOpinion = function(id_producto, emp, actual, ultimo){
            var responseValProduct = Productos.get({'id':id_producto});
            responseValProduct.$promise
                .then(function(prod) {
                    var nombre = prod.name;
                    var response = $http.post("./../api/productos/opinadoPorUsuario", {'id_producto': id_producto, 'id_empresa': emp, 'id_usuario': vm.usuario._id});
                    response.success(function (data) {
                        if(data != "false"){
                            data['nombreProducto'] = nombre;
                            data['fechaOrden'] = new Date(data.fecha)
                            var indice = vm.productosOpinados1.push(data);
                            indice = indice-1;
                            vm.getNombreEmpresaOpi(indice, vm.productosOpinados1[indice].empresa);
                        }
                    })
                },function(reason){
                });
        }

        vm.getNombreEmpresaVal = function(indice, id_empresa){
            var responseEmpresa = $http.post("./../api/empresas/buscar", {'_id': id_empresa});
            responseEmpresa.success(function (data) {
                vm.productosValorados1[indice]['nombreEmpresa']=data[0].name;
            });
        }

        vm.getNombreEmpresaOpi = function(indice, id_empresa){
            var responseEmpresa = $http.post("./../api/empresas/buscar", {'_id': id_empresa});
            responseEmpresa.success(function (data) {
                vm.productosOpinados1[indice]['nombreEmpresa']=data[0].name;
            });
        }

        vm.formatearFecha = function(fecha){
            var date = new Date(fecha);
            var string = "";
            string += date.getDate().toLocaleString()+"/"+(date.getMonth()+1).toLocaleString()+"/"+date.getFullYear();
            return string;
        }

    }]);