/**
 * Created by Xisco on 09/03/2016.
 */
'use strict';
/**
 * Created by Xisco on 01/02/2016.
 */
angular.module('sbAdminApp')


    .controller('nuevaEmpresaCtrl', ['$scope', '$timeout', '$stateParams', '$http',  function ($scope, $timeout,$stateParams,$http) {

        var vm = $scope;


        vm.crearEmpresa = function()
        {
            var nombre = document.getElementById('nombre').value;
            var cif = document.getElementById('cif').value;
            var photo = document.getElementById('foto').value;


            if(nombre == '' || cif == ''  || photo == '')
                alert('Rellena todos los campos');
            else {

                var response = $http.post('./../api/empresas', {
                    'name': nombre,
                    'cif': cif,
                    'photo': photo
                });
                response.success(function (data) {
                    swal('Empresa creada');
                    location.href = '/admin-panel/index#/dashboard/nuevaEmpresa';
                    document.getElementById('nombre').value = '';
                    document.getElementById('cif').value = '';
                    document.getElementById('foto').value = '';
                }, function (reason) {
                    console.log("Error en insertarEmpresa por: " + reason);
                });
            }
        }

    }]);

