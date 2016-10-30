/**
 * Created by Xisco on 01/02/2016.
 */
angular.module('sbAdminApp')

    .factory('Empresa', ['$resource', function($resource) {
        return $resource('./../api/empresas/:id',  {id: '@_id' }, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: false}
        });
    }])

    //recoge un producto a partir de su id
    .factory('Productos', ['$resource', function($resource) {
        return $resource('./../api/productos/:id', {id: '@_id' }, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: false}
        });
    }])

    .controller('catalogoCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams, $http) {

        var vm = this;

        vm.catalogo = new Array;
        //vm.catalogo.push(vm.producto1, vm.producto2, vm.producto3, vm.producto4);

        var precios = [];
        var catalogo = [];

        $scope.productos = catalogo;
        vm.orden='name';
        vm.invertir=false;
        vm.tiposDisponibles = [];
        vm.buscadorNombre = "";
        vm.buscadorTipo = "";

        var numElemsPag = 25;
        vm.inicioPaginacion = 0;
        vm.finPaginacion = numElemsPag;
        vm.numPags = 0;

        vm.paginacionActual = 1;
        vm.navegacion = [];

        //Con esto recuperamos el nombre y la id del usuario de la sesión y la almacenamos en el controlador
        if(document.getElementById("hiddenName")!=null) {

            vm.nombreUsuario = document.getElementById("hiddenName").value;
            vm.idUsuario = document.getElementById("hiddenId").value;
            vm.emailUsuario = document.getElementById("hiddenEmail").value;
            vm.fotoUsuario = document.getElementById("hiddenPhoto").value;
            var responseEmpresa = $http.post('./../api/empresas/empresaDeUsuario', {usuario: vm.idUsuario});
            responseEmpresa.success(function(data){
                empresa = data[0];
                var responseTipos = $http.post("./../api/empresas/tiposDisponibles", {id_empresa: empresa._id});
                responseTipos.success(function (data) {
                    vm.tiposDisponibles = data;
                });
                vm.devuelveCatalogo(empresa._id);
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
                responseCatalogo.success(function(data){
                    vm.navegacion = [];
                    $scope.productos = data.array;
                    vm.numPags = Math.ceil(parseInt(data.total)/numElemsPag);
                    for(var i=1; i<=vm.numPags; i++)
                        vm.navegacion.push(i);

                });
            },function(reason){
                console.log("Error en devuelveCatalogo fuera por: "+reason);
            });
        }

        vm.busquedaPorNombre = function(){
            var numAnterior = vm.tamBusqueda;
            vm.tamBusqueda=vm.buscadorNombre.length;
            if(vm.buscadorNombre.length>2 || (numAnterior>2 && vm.tamBusqueda<=2)){
                catalogo = [];
                vm.devuelveCatalogo(empresa._id);
            }
        }

        vm.recargarPagina = function(){
            vm.devuelveCatalogo(empresa._id);
        }

        vm.cambiarPaginacion = function(num){
            if(num>0 && num<=vm.numPags) {
                vm.paginacionActual = num;
                vm.inicioPaginacion = (num - 1) * numElemsPag;
                vm.finPaginacion = vm.inicioPaginacion + numElemsPag;

                vm.devuelveCatalogo(empresa._id);

            }
        }

    }]);