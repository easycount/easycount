/**
 * Created by Enrique 2 on 16/12/2015.
 */
angular.module('sbAdminApp')
    .controller('comerciosCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
        var vm = $scope;

        vm.comercio1 = {nombre:"Mercadona", numProductos:"1540", expira:"02/11/2017"};
        vm.comercio2 = {nombre:"Mendoza", numProductos:"450", expira:"25/07/2017"};
        vm.comercio3 = {nombre:"Hiperber", numProductos:"2630", expira:"02/02/2018"};
        vm.comercio4 = {nombre:"Carrefour", numProductos:"5000", expira:"23/10/2017"};

        vm.comercios = new Array;
        vm.comercios.push(vm.comercio1, vm.comercio2, vm.comercio3, vm.comercio4);

        $scope.supermercados = [
            { name: 'Mercadona', cantidad:1540},
            { name: 'Mendoza', cantidad:450},
            { name: 'Hiperber', cantidad:2630},
            { name: 'Carrefour', cantidad:5000}
        ];
    }]);