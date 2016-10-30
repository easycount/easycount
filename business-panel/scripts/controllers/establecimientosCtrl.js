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

    .controller('establecimientosCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams,$http) {

        var vm = this;

        vm.establecimientos = new Array;

        var numElemsPag = 5;
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
                vm.devuelveEstablecimientos(empresa._id);
            });
        }

        vm.devuelveEstablecimientos = function(superId){
            var establecimientosObj = [];
            vm.establecimientos = [];

            var response = $http.post('./../api/establecimientos/establecimientosEmpresa', {'empresa': superId, 'inicio':vm.inicioPaginacion, 'cantidad':vm.finPaginacion });
            response.success(function(data)
            {
                var num = data.array.length;
                vm.numPags = Math.ceil(parseInt(data.total)/numElemsPag);

                for(var i=1; i<=vm.numPags; i++)
                    vm.navegacion.push(i);

                for(var i = 0; i < num; i++)
                {
                    vm.establecimiento = { nombre: data.array[i].name, coordenadas: data.array[i].coordenadas, ciudad: data.array[i].ciudad, comunidad: data.array[i].comunidad};
                    vm.establecimientos.push(vm.establecimiento);
                }
            },function(reason){
                console.log("Error en buscarEstablecimiento por: "+reason);
            });


        }

        vm.formatearFechaPretty = function(fecha){
            var date = new Date(fecha);
            var fecha = date.getDate().toString() + " de " + vm.dameNombreMes(date.getMonth()) + " de " + date.getFullYear().toString();
            fecha += " - ";
            fecha += date.getHours()+":"+("0" + date.getMinutes()).slice(-2);
            return fecha;
        }

        vm.cambiarPaginacion = function(num){
            if(num>0 && num<=vm.numPags) {
                vm.paginacionActual = num;
                vm.inicioPaginacion = (num - 1) * numElemsPag;
                vm.finPaginacion = vm.inicioPaginacion + numElemsPag;
                vm.devuelveEstablecimientos(empresa._id);
            }
        }
    }]);
