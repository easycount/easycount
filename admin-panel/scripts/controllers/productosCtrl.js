/**
 * Created by Enrique 2 on 18/12/2015.
 */

angular.module('sbAdminApp')
    .controller('comerciosCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
        var vm = $scope;

        vm.comercio1 = {nombre:"Calgonit", fechaCompra:"16/112015", supermercado:""};
    }]);
