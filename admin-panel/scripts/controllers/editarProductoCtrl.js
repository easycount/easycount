
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

    .controller('editarProductoCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams,$http) {

        var vm = $scope;

        vm.productosTipos = [];

        var arrayTypes = ['-----','Infusiones y solubles','Animales', 'Agua', 'Limpieza', 'Dietéticos', 'Botiquín', 'Azucar y edulcorantes', 'Postres', 'Fruta', 'Untables', 'Aceites', 'Sal, especias y sazonadores', 'Caldos y purés', 'Precocinados', 'Cosméticos', 'Lácteos y huevos', 'Higiene', 'Bebidas alcohólicas', 'Aperitivos', 'Refrescos', 'Panadería', 'Dulces', 'Pescados', 'Carnes', 'Bebés', 'Electrónica', 'Papelería', 'Multimedia', 'Deportes', 'Ropa y calzado', 'Muebles', 'Legumbres', 'Pastas', 'Vegetales', 'Salsas', 'Congelados', 'Conservas'];
        arrayTypes = arrayTypes.sort();
        for(var i = 0; i < arrayTypes.length; i++)
        {
            vm.productosTipos.push({nombre: arrayTypes[i]});
        }

        //vm.productosTipos.push(vm.productosTipo1, vm.productosTipo2, vm.productosTipo3, vm.productosTipo4, vm.productosTipo5, vm.productosTipo6, vm.productosTipo7, vm.productosTipo8, vm.productosTipo9, vm.productosTipo10, vm.productosTipo11, vm.productosTipo12, vm.productosTipo13, vm.productosTipo14, vm.productosTipo15, vm.productosTipo16, vm.productosTipo17, vm.productosTipo18, vm.productosTipo19, vm.productosTipo20, vm.productosTipo21, vm.productosTipo22, vm.productosTipo23);


        var id = window.location.href;

        var pa = id.split("=");

        id = pa[1];

        vm.usuario = new Array;

        vm.devuelveProducto = function(superId){


            var response = $http.get('./../api/productos/' + superId  );
            response.success(function(data)
            {
                //vm.usuario.push = { id: data._id, nombre: data.name, email: data.email, f_nacimiento: data.f_nacimiento, f_registro: data.fregistro, genero: data.genero, rol: data.role};

                if(data.name != null)
                    document.getElementById('nombre').value = data.name;

                if(data.barcode != null)
                    document.getElementById('barcode').value = data.barcode;

                if(data.type != null)
                    $("#type").val(data.type);

                if(data.description != null)
                    document.getElementById('descripcion').value = data.description;

                if(data.photo != null)
                    document.getElementById('foto').value = data.photo;

            },function(reason){
                console.log("Error en buscarUsuario por: "+reason);
            });


        }

        vm.editarProducto = function()
        {
            var nombre = document.getElementById('nombre').value;
            var barcode = document.getElementById('barcode').value;
            var type = document.getElementById('type').value;
            var description = document.getElementById('descripcion').value;
            var photo = document.getElementById('foto').value;


            if(nombre == '' || barcode == '' || type == '' || description == '' || photo == '')
                alert('Rellena todos los campos');
            else {

                var response = $http.put('./../api/productos/'+ id, {
                    'name': nombre,
                    'barcode': barcode,
                    'type': type,
                    'description': description,
                    'photo': photo
                });
                response.success(function (data) {
                    swal('Producto editado');
                    location.href = '/admin-panel/index#/dashboard/verProductos';

                }, function (reason) {
                    console.log("Error en editarProducto por: " + reason);
                });
            }
        }


        vm.devuelveProducto(id);

    }]);
