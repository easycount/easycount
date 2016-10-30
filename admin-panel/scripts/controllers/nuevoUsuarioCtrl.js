'use strict';
/**
 * Created by Xisco on 01/02/2016.
 */
angular.module('sbAdminApp')


    .controller('nuevoUsuarioCtrl', ['$scope', '$timeout', '$stateParams', '$http',  function ($scope, $timeout,$stateParams,$http) {

        var vm = $scope;

        vm.crearUsuario = function()
        {
            var nombre = document.getElementById('nombre').value;
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            var f_nacimiento = document.getElementById('f_nacimiento').value;
            var genero = document.getElementById('genero').value;
            var role = document.getElementById('role').value;
            var now = new Date();


            if(nombre == '' || email == '' || password == '' || f_nacimiento == '' || genero == '' || role == '')
                alert('Rellena todos los campos');
            else {

                var response = $http.post('./../api/usuarios/createUser', {
                    'name': nombre,
                    'email': email,
                    'password': password,
                    'provider': 'web',
                    'role': role,
                    'f_nacimiento': new Date(f_nacimiento),
                    'genero': genero,
                    'n_personas': '1'
                });
                response.success(function (data) {
                    swal('Usuario creado');
                    location.href = '/admin-panel/index#/dashboard/nuevoUsuario';
                    document.getElementById('nombre').value = '';
                    document.getElementById('email').value = '';
                    document.getElementById('password').value = '';
                    document.getElementById('f_nacimiento').value = '';
                    document.getElementById('role').selectedIndex = -1;
                    document.getElementById('genero').selectedIndex = -1;
                }, function (reason) {
                    console.log("Error en insertarUsuario por: " + reason);
                });
            }
        }

    }]);

