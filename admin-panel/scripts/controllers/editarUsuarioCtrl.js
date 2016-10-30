/**
 * Created by Xisco on 16/03/2016.
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

    .controller('editarUsuarioCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams,$http) {

        var vm = $scope;

        var id = window.location.href;

        var pa = id.split("=");

        id = pa[1];

        vm.usuario = new Array;

        vm.devuelveUsuario = function(superId){


            var response = $http.get('./../api/usuarios/' + superId  );
            response.success(function(data)
            {
                //vm.usuario.push = { id: data._id, nombre: data.name, email: data.email, f_nacimiento: data.f_nacimiento, f_registro: data.fregistro, genero: data.genero, rol: data.role};

                if(data.name != null)
                    document.getElementById('nombre').value = data.name;

                if(data.email != null)
                    document.getElementById('email').value = data.email;

                if(data.password != null)
                    document.getElementById('password').value = data.password;

                if(data.f_nacimiento != null)
                    document.getElementById('f_nacimiento').value = data.f_nacimiento;

                if(data.genero != null)
                    $("#genero").val(data.genero);

                if(data.role != null)
                    $("#role").val(data.role);

            },function(reason){
                console.log("Error en buscarUsuario por: "+reason);
            });


        }

        vm.editarUsuario = function()
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

                var response = $http.put('./../api/usuarios/'+ id, {
                    'name': nombre,
                    'email': email,
                    'password': password,
                    'fregistro': new Date().toLocaleString(),
                    'provider': 'web',
                    'role': role,
                    'f_nacimiento': f_nacimiento,
                    'genero': genero,
                    'n_personas': '1'
                });
                response.success(function (data) {
                    swal('Usuario editado');
                    location.href = '/admin-panel/index#/dashboard/verUsuarios';

                }, function (reason) {
                    console.log("Error en insertarUsuario por: " + reason);
                });
            }
        }


        vm.devuelveUsuario(id);

    }]);
