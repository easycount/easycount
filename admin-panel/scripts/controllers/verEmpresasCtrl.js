/**
 * Created by Xisco on 09/03/2016.
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

    .controller('verEmpresasCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams,$http) {

        var vm = $scope;

        vm.empresas = new Array;
        //vm.promos.push(vm.promo1, vm.promo2, vm.promo3, vm.promo4);

        vm.devuelveEmpresas = function(){

            var response = $http.get('./../api/empresas');
            response.success(function(data)
            {
                for(var i = 0; i < data.length; i++)
                {
                    vm.empresa = { nombre: data[i].name, cif: data[i].cif, foto: data[i].photo};
                    vm.empresas.push(vm.empresa);
                }
            },function(reason){
                console.log("Error en buscarEstablecimiento por: "+reason);
            });


        }

        vm.devuelveEmpresas();

    }]);
