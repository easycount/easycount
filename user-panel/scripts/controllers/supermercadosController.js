'use strict';
/**
 * Created by Xisco on 09/12/2015.
 */
angular.module('sbAdminApp')

    .controller('SupermercadosCtrl', ['$scope', '$timeout','Empresas', function ($scope, $timeout, Empresas) {
        var vm = this;
        var response = Empresas.query();
        vm.cargado = false;
        var supermercados = [];
        response.$promise.then(function(data){
            for(var i=0;i<data.length;i++){

                supermercados[i] = data[i];
                if(i == data.length-1){
                    document.getElementById('loaderComercios').classList.remove('bubbles');
                    vm.cargado = true;
                    $scope.supermercados = supermercados;
                }
            }
        });


            //[
        //    { name: 'Mercadona', cantidad:1540},
        //    { name: 'Mendoza', cantidad:450},
        //    { name: 'Hiperber', cantidad:2630},
        //    { name: 'Carrefour', cantidad:5000}
        //];
    }]);
