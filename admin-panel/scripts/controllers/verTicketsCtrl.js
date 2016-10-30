/**
 * Created by Xisco on 11/04/2016.
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

    .controller('verTicketsCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams,$http) {

        var vm = $scope;

        vm.promos = new Array;
        //vm.promos.push(vm.promo1, vm.promo2, vm.promo3, vm.promo4);

        vm.devuelvePromociones = function(){
            var promocionesObj = [];
            var promocion;

            var response = $http.get('./../api/tickets/todosTickets');
            response.success(function(data)
            {
                for(var i = 0; i < data.length; i++)
                {
                    vm.promo = { id: data[i]._id, usuario: data[i].nombreUsuario, fecha: data[i].fecha, importe: data[i].importe, empresa: data[i].nombreEmpresa, establecimiento: data[i].nombreEstablecimiento};
                    vm.promos.push(vm.promo);
                }

            },function(reason){
                console.log("Error en buscarEstablecimiento por: "+reason);
            });


        }

        vm.devuelvePromociones();

    }]);