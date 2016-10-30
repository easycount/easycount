'use strict';
/**
 * Created by Xisco on 09/12/2015.
 */
angular.module('sbAdminApp')
    //recoge un producto a partir de su id
    .factory('Productos', ['$resource', function($resource) {
        return $resource('./../api/productos/:id', {id: '@_id' }, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: false}
        });
    }])
    //recoge un usuario a partir de su id
    .factory('Usuarios', ['$resource', function($resource) {
        return $resource('./../api/usuarios/:id',  {id: '@_id' }, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: false}
        });
    }])

    .factory('Empresa', ['$resource', function($resource) {
        return $resource('./../api/empresas/:id',  {id: '@_id' }, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: false}
        });
    }])

    .factory('Listas', ['$resource', function($resource) {
        return $resource('./../api/listas/:id',   {id: '@_id' }, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: true}
        });
    }])

    .controller('productoCtrl', ['$scope', '$timeout','Productos','Usuarios', 'Empresa','Listas','$stateParams','$http', function ($scope, $timeout, Productos, Usuarios, Empresa,Listas, $stateParams,$http) {
        var vm = this;
        vm.productoComprado = false;
        vm.producto = null;
        vm.comentarios = {
            usuarios: [],
            texto: []
        };

        var precio;

        var idProducto= $stateParams.superId;

        var response;

        response = Productos.get({id : idProducto});
        response.$promise
            .then(function(data)//si sale bien
            {

                vm.producto = data;
                document.getElementById('descc').innerHTML = data.description;
                vm.rellenarComentarios();
                /*comprobarUsuTieneProducto();
                comprobarUsuAOpinado();
                comprobarUsuAValorado();
                controlarEstrellas();*/

            },function(reason) //En caso de fallo
            {
                console.log("Error al recoger producto: "+reason);
            });


        /*vm.devuelveCatalogo = function(superId){
            var producto2;
            var response = Productos.query({id : superId});
            response.$promise.then(function(data, i, precios){
                producto2 = data;
                $scope.producto = producto2;

                for(var i=0 ; i<$scope.producto.opiniones.length; i++)
                {
                    var response;

                    response = Usuarios.query({id : $scope.producto.opiniones[i].user});
                    response.$promise
                        .then(function(data)//si sale bien
                        {
                            //recorro el array para encontrar el elemento onde está el id
                            for(var j=0; j<$scope.producto.opiniones.length; j++)
                            {
                                if($scope.producto.opiniones[j].user == data._id)
                                {
                                    vm.comentarios.usuarios[j] = data.name;
                                    vm.comentarios.texto[j] = $scope.producto.opiniones[j].texto;
                                }
                            }
                            $scope.comentarios = vm.comentarios;
                            var response = $http.post('./../api/usuarios/tieneProductoUsuario', {'id': data._id, 'id_producto': $stateParams.superId });

                            response.success(function(data){
                                vm.productoComprado = data=="true"? true : false;
                            });

                        },function(reason) //En caso de fallo
                        {
                            console.log("Error al recoger el usuario: "+reason);
                        });

                    //vm.comentarios.texto[i] = vm.producto.opiniones[i].texto;
                }
                //vm.rellenarComentarios($scope.producto.opiniones);
            });
        }
        vm.devuelveCatalogo($stateParams.superId);*/

        $scope.damePrecio = function(id_prod){
            for(var i=0;i<precios.length;i++){
                if(precios[i].prod_id.localeCompare(id_prod) == 0)
                    return precios[i].precio;
            }
        }



        vm.rellenarComentarios = function()
        {
            for(var i=0 ; i<vm.producto.opiniones.length; i++)
            {
                var response;

                response = Usuarios.get({id : vm.producto.opiniones[i].user});
                response.$promise
                    .then(function(data)//si sale bien
                    {
                        //recorro el array para encontrar el elemento onde está el id
                        for(var j=0; j<vm.producto.opiniones.length; j++)
                        {
                            if(vm.producto.opiniones[j].user == data._id)
                            {
                                vm.comentarios.usuarios[j] = data.name;
                                vm.comentarios.texto[j] = vm.producto.opiniones[j].texto;
                                //vm.asignaFotoEmpresa(j, vm.producto.opiniones[j].empresa);
                            }
                        }

                    },function(reason) //En caso de fallo
                    {
                        console.log("Error al recoger el usuario: "+reason);
                    });
            }
        };




    }]);