/**
 * Created by Xisco on 01/02/2016.
 */

var editando = false;
var preEdit = '';

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

    .controller('verUsuariosCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams,$http) {

        var vm = $scope;

        vm.usuarios = new Array;

        vm.devuelveUsuarios = function(){

            var usuario;

            var response = $http.get('./../api/usuarios');
            response.success(function(data)
            {
                var num = data.length;

                for(var i = 0; i < num; i++)
                {
                    vm.usuario = { id: data[i]._id, nombre: data[i].name, email: data[i].email, f_nacimiento: data[i].f_nacimiento, f_registro: data[i].fregistro, genero: data[i].genero, rol: data[i].role};
                    vm.usuarios.push(vm.usuario);
                }
            },function(reason){
                console.log("Error en buscarEstablecimiento por: "+reason);
            });


        }

        vm.devuelveUsuarios();

        vm.editarUsuario = function(input)
        {
            location.href = '/admin-panel/index#/dashboard/editarUsuario?id=' + input.usuario.id;
        }

        vm.eliminarUsuario = function(input)
        {
            swal({
                    title: "Seguroq que quieres eliminar el usuario?",
                    text: "No se podrá volver a recuperar",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Eliminar",
                    closeOnConfirm: false
                },
                function(){

                    var response = $http.delete('./../api/usuarios/' + input.usuario.id );
                    response.success(function(data)
                    {
                        swal("Eliminado", "El usuario ha sido dado de baja", "success");
                        location.reload();

                    },function(reason){
                        console.log("Error en buscarEstablecimiento por: "+reason);
                    });

                });
        }

    }]);
