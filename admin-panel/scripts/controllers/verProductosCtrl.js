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

    .controller('verProductosCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams,$http) {

        var vm = $scope;

        vm.productos = new Array;

        vm.devuelveProductos = function(){

            var producto;

            var response = $http.get('./../api/productos');
            response.success(function(data)
            {
                var num = data.length;

                for(var i = 0; i < num; i++)
                {
                    var de = data[i].description;
                    if(de != null) {
                        de = de.indexOf(".", de.indexOf('.'));

                        if (de != '-1') {
                            var des = data[i].description.substr(0, de);
                            des = des.replace(/<\/?[^>]+(>|$)/g, "");

                            des = des.replace(/[<>&'"]/g, function (c) {
                                switch (c) {
                                    case '<':
                                        return '&lt;';
                                    case '>':
                                        return '&gt;';
                                    case '&':
                                        return '';
                                    case '\'':
                                        return '&apos;';
                                    case '"':
                                        return '&quot;';
                                }
                            });
                            var re = new RegExp('#13;', 'g');

                            des = des.replace(re, ' ');
                            data[i].description = des;
                        }
                    }

                    vm.producto = { id: data[i]._id,  nombre: data[i].name, barcode: data[i].barcode, type: data[i].type, description: data[i].description, photo: data[i].photo};
                    vm.productos.push(vm.producto);
                }
            },function(reason){
                console.log("Error en buscarEstablecimiento por: "+reason);
            });


        }

        vm.devuelveProductos();

        vm.editarProducto = function(input)
        {
            location.href = '/admin-panel/index#/dashboard/editarProducto?id=' + input.producto.id;
        }

        vm.eliminarProducto = function(input)
        {
            swal({
                    title: "Seguroq que quieres eliminar el producto?",
                    text: "No se podrá volver a recuperar",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Eliminar",
                    closeOnConfirm: false
                },
                function(){

                    var response = $http.delete('./../api/productos/' + input.producto.id );
                    response.success(function(data)
                    {
                        swal("Eliminado", "El producto ha sido dado de baja", "success");
                        location.reload();

                    },function(reason){
                        console.log("Error en eliminarProducto por: "+reason);
                    });

                });
        }



    }]);
/**
 * Created by Xisco on 07/03/2016.
 */
