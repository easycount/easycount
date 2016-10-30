'use strict';
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

    //recoge un producto a partir de su id
    .factory('Establecimientos', ['$resource', function($resource) {
        return $resource('./../api/establecimientos/:id', {id: '@_id' }, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: false}
        });
    }])

    .controller('nuevoEstablecimientoCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', 'Establecimientos', function ($scope, $timeout,Empresa,Productos,$stateParams,$http,Establecimientos) {

        var vm = $scope;

        vm.crearEstablecimiento = function()
        {
            var nombre = document.getElementById('nombre').value;
            var longitud = document.getElementById('longitud').value;
            var latitud = document.getElementById('latitud').value;
            var ciudad = document.getElementById('ciudad').value;
            var comunidad = document.getElementById('comunidad').value;
            var empresa = '5697c2f8e4b07f04a74941fb';
            var coordenadas = latitud + ', ' + longitud;

            if(nombre == '' || longitud == '' || latitud == '' || ciudad == '' || comunidad == '')
                alert('Rellena todos los campos');
            else {

                var response = $http.post('./../api/establecimientos', {
                    'name': nombre,
                    'empresa': empresa,
                    'coordenadas': coordenadas,
                    'ciudad': ciudad,
                    'comunidad': comunidad
                });
                response.success(function (data) {
                    location.href = '/business-panel/index#/dashboard/establecimientos';
                }, function (reason) {
                    console.log("Error en insertarProducto por: " + reason);
                });
            }
        }

    }]);

