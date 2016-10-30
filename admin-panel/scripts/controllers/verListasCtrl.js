/**
 * Created by Xisco on 11/03/2016.
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

    .controller('verListasCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams,$http) {

        var vm = $scope;

        vm.listas = new Array;
        //vm.promos.push(vm.promo1, vm.promo2, vm.promo3, vm.promo4);

        vm.devuelveListas = function(){

            var response = $http.get('./../api/listas');
            response.success(function(data)
            {
                for(var i = 0; i < data.length; i++)
                {
                    vm.lista = { nombre: data[i].name, descripcion: data[i].description, predefinida: data[i].predefinida, email: data[i].emailUsuario};
                    vm.listas.push(vm.lista);
                }
            },function(reason){
                console.log("Error en buscarEstablecimiento por: "+reason);
            });


        }

        vm.devuelveListas();

    }]);
