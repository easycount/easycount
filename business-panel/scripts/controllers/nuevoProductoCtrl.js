/**
 * Created by Xisco on 21/03/2016.
 */
'use strict';
angular.module('sbAdminApp')


    .controller('nuevoProductoCtrl', ['$scope', '$timeout', '$stateParams', '$http',  function ($scope, $timeout,$stateParams,$http) {

        var empresa;
        if(document.getElementById("hiddenName")!=null) {

            var idUsuario = document.getElementById("hiddenId").value;
            var responseEmpresa = $http.post('./../api/empresas/empresaDeUsuario', {usuario: idUsuario});
            responseEmpresa.success(function(data){
                empresa = data[0]._id;

            });
        }

        var vm = $scope;

        vm.productosTipos = [];

        var arrayTypes = ['-----','Infusiones y solubles','Animales', 'Agua', 'Limpieza', 'Dietéticos', 'Botiquín', 'Azucar y edulcorantes', 'Postres', 'Fruta', 'Untables', 'Aceites', 'Sal, especias y sazonadores', 'Caldos y purés', 'Precocinados', 'Cosméticos', 'Lácteos y huevos', 'Higiene', 'Bebidas alcohólicas', 'Aperitivos', 'Refrescos', 'Panadería', 'Dulces', 'Pescados', 'Carnes', 'Bebés', 'Electrónica', 'Papelería', 'Multimedia', 'Deportes', 'Ropa y calzado', 'Muebles', 'Legumbres', 'Pastas', 'Vegetales', 'Salsas', 'Congelados', 'Conservas'];
        arrayTypes = arrayTypes.sort();
        for(var i = 0; i < arrayTypes.length; i++)
        {
            vm.productosTipos.push({nombre: arrayTypes[i]});
        }

        vm.crearProducto = function()
        {
            var nombre = document.getElementById('nombre').value;
            var barcode = document.getElementById('barcode').value;
            var type = document.getElementById('type').value;
            var description = document.getElementById('descripcion').value;
            var photo = document.getElementById('foto').value;


            if(nombre == '' || barcode == '' || type == '' || description == '' || photo == '')
                alert('Rellena todos los campos');
            else {

                var response = $http.post('./../api/productos', {
                    'name': nombre,
                    'barcode': barcode,
                    'type': type,
                    'description': description,
                    'photo': photo
                });
                response.success(function (data) {

                    var precio = document.getElementById('precio').value;

                    var response3 = $http.post('./../api/empresas/modificarPrecio', {'id_empresa': empresa , 'id_producto' : data._id, 'precio' : precio });
                    response3.success(function(data3)
                    {
                        swal('Producto creado');

                        document.getElementById('nombre').value = '';
                        document.getElementById('barcode').value = '';
                        document.getElementById('type').selectedIndex = -1;
                        document.getElementById('descripcion').value = '';
                        document.getElementById('foto').value = '';
                        document.getElementById('precio').value = '';
                    },function(reason){
                        console.log("Error en actualizarPrecio por: "+reason);
                    });


                }, function (reason) {
                    console.log("Error en insertarPRoducto por: " + reason);
                });
            }
        }

    }]);

