/**
 * Created by Xisco on 14/03/2016.
 */
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

    .controller('verEstablecimientosCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams,$http) {

        var vm = $scope;

        vm.establecimientos = new Array;
        //vm.promos.push(vm.promo1, vm.promo2, vm.promo3, vm.promo4);

        vm.devuelveEstablecimientos = function(){

            var response = $http.get('./../api/establecimientos');
            response.success(function(data)
            {
                for(var i = 0; i < data.length; i++)
                {
                    vm.establecimiento = { nombre: data[i].name, empresa: data[i].empresa, coordenadas: data[i].coordenadas, ciudad: data[i].ciudad, comunidad: data[i].comunidad};
                    vm.establecimientos.push(vm.establecimiento);
                }
            },function(reason){
                console.log("Error en buscarEstablecimiento por: "+reason);
            });


        }

        vm.devuelveEstablecimientos();

    }]);
