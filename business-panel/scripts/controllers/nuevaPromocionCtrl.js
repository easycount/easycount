'use strict';
/**
 * Created by Xisco on 01/02/2016.
 */

function escapar(){
    var source = document.getElementById("impresion");
    var divv = document.getElementById("superDiv");
    divv.style.display = 'none';
    source.style.visibility = 'hidden';
}

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
    .factory('Promociones', ['$resource', function($resource) {
        return $resource('./../api/promociones/:id', {id: '@_id' }, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: false}
        });
    }])

    .controller('nuevaPromocionCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', 'Promociones', function ($scope, $timeout,Empresa,Productos,$stateParams,$http,Promociones) {

        var vm = $scope;

        vm.tipo1 = {nombre:"Descuento del 5%"};
        vm.tipo2 = {nombre:"Descuento del 10%"};
        vm.tipo3 = {nombre:"Descuento del 15%"};
        vm.tipo4 = {nombre:"Descuento del 20%"};
        vm.tipo5 = {nombre:"Descuento del 25%"};
        vm.tipo6 = {nombre:"2x1"};
        vm.tipo7 = {nombre:"3x2"};
        vm.tipo8 = {nombre:"2º unidad 25%"};
        vm.tipo9 = {nombre:"2º unidad 50%"};
        vm.tipo10 = {nombre:"3º unidad 25%"};
        vm.tipo11 = {nombre:"3º unidad 50%"};

        vm.tipos = new Array;
        vm.tipos.push(vm.tipo1, vm.tipo2, vm.tipo3, vm.tipo4, vm.tipo5, vm.tipo6, vm.tipo7, vm.tipo8, vm.tipo9, vm.tipo10, vm.tipo11);

        vm.productos = new Array;
        vm.producto1 = {nombre:"Todos los productos"};
        vm.producto2 = {nombre:"Un tipo de producto"};
        vm.producto3 = {nombre:"Un producto en concreto"};
        vm.productos.push(vm.producto1, vm.producto2, vm.producto3);

        vm.productosTipos = new Array;
        vm.productosTipo1 = {nombre: "-----"};
        vm.productosTipos.push(vm.productosTipo1);

        //vm.catalogo.push(producto1, producto2, producto3, producto4);

        /*var precios = [];
         var catalogo = [];


        vm.devuelveCatalogo = function(superId){
            var productosObj = [];
            var producto;
            var response = Empresa.query({ id: superId});
            response.$promise.then(function(data)
            {
                $scope.supermercado = data.name;
                productosObj = data.catalogo;

                for(var i=0;i<productosObj.length;i++){
                    response = Productos.query({id : productosObj[i].prod_id});

                    response.$promise.then(function(data, i, precios){
                        producto = data;
                        //console.log(producto.name);
                        vm.productosTipos.push({nombre: producto.name});
                    });

                }
            });

        }
        //vm.devuelveCatalogo('5697c2f8e4b07f04a74941fb');

         $scope.damePrecio = function(id_prod){
         for(var i=0;i<precios.length;i++){
         if(precios[i].prod_id.localeCompare(id_prod) == 0)
         return precios[i].precio;
         }
         }
         //vm.devuelveCatalogo($stateParams.superId);*/

        vm.devuelveCatalogo = function(superId){
            var productosObj = [];
            var producto;
            var response = Empresa.query({ id: superId});
            response.$promise.then(function(data)
            {
                $scope.supermercado = data.name;
                productosObj = data.catalogo;

                for(var i=0;i<productosObj.length;i++){
                    response = Productos.query({id : productosObj[i].prod_id});

                    response.$promise.then(function(data, i, precios){
                        producto = data;
                        //console.log(producto);
                        vm.productosTipos.push({nombre: producto.name, id: producto._id});
                    });

                }
            });

        }

        vm.crearPromocion = function()
        {
            var nombre = document.getElementById('nombre').value;
            var codigo = document.getElementById('codigo').value;
            var tipoPromocion = document.getElementById('tipoPromocion').value;
            var descripcion = document.getElementById('descripcion').value;
            var tipo = document.getElementById('tipo').value;
            var productosAfectados = document.getElementById('productosAfectados').value;
            var productos = [];
            var fechaInicio = document.getElementById('fechaInicio').value;
            var fechaFinal = document.getElementById('fechaFinal').value;
            var categorias = [];


            var childs = document.getElementById('s2id_mySel').firstElementChild;
            var nums = childs.childElementCount;

            var childs2 = document.getElementById('s2id_mySel2').firstElementChild;
            var nums2 = childs2.childElementCount;


            var productosIds = [];

            if(nombre == '' || codigo == '' || isNaN(codigo) || codigo.length != 13 || tipoPromocion == '' || descripcion == '' || fechaInicio == '' || fechaFinal == '' || (nums < 2 && productosAfectados != 'Todos los productos') || nums2 < 2 )
                alert('Rellena todos los campos');
            else {

                while(nums > 1)
                {
                    productos.push(childs.firstElementChild.firstElementChild.textContent);
                    childs.removeChild(childs.firstElementChild);
                    nums = nums - 1;
                }

                while(nums2 > 1)
                {
                    categorias.push(childs2.firstElementChild.firstElementChild.textContent);
                    childs2.removeChild(childs2.firstElementChild);
                    nums2 = nums2 - 1;
                }


                if (productosAfectados == 'Un producto en concreto') {


                    var num = productos.length;

                    if (num == 0)
                        alert('No has seleccionado ningun producto');
                    else {
                        var final = num -1;
                        var inicio = 0;
                        for (var i = 0; i < num; i++) {
                            var response = $http.post('./../api/productos/buscar', {'name': productos[i]});

                            response.success(function (data) {
                                productosIds.push(data[0]._id);

                                if (inicio == final) {
                                    var response2 = $http.post('./../api/promociones', {
                                        'name': nombre,
                                        'description': descripcion,
                                        'barcode': codigo,
                                        'empresa': '5697c2f8e4b07f04a74941fb',
                                        'tipo': tipo,
                                        'f_desde': fechaInicio,
                                        'f_hasta': fechaFinal,
                                        'categorias': categorias,
                                        'productos': productosIds
                                    });
                                    response2.success(function (data2) {
                                        location.href = '/business-panel/index#/dashboard/promociones';

                                    }, function (reason) {
                                        console.log("Error en insertarProducto por: " + reason);
                                    });
                                }

                                inicio = inicio + 1;

                            }, function (reason) {
                                console.log("Error buscando el producto por: " + reason);
                            });
                        }
                    }

                }
                else if (productosAfectados == 'Un tipo de producto') {
                    var productosIds = [];

                    var num = productos.length;

                    for (var i = 0; i < num; i++) {
                        var response = $http.post('./../api/productos/buscar', {'name': productos[i]});

                        response.success(function (data) {
                            productosIds.push(data[0]._id);

                            if (i == (num - 1)) {
                                var response2 = $http.post('./../api/promociones', {
                                    'name': nombre,
                                    'description': descripcion,
                                    'barcode': codigo,
                                    'empresa': '5697c2f8e4b07f04a74941fb',
                                    'tipo': tipo,
                                    'f_desde': fechaInicio,
                                    'f_hasta': fechaFinal,
                                    'categorias': categorias,
                                    'productos': productosIds
                                });
                                response2.success(function (data2) {
                                    location.href = '/business-panel/index#/dashboard/promociones';
                                }, function (reason) {
                                    console.log("Error en insertarProducto por: " + reason);
                                });
                            }

                        }, function (reason) {
                            console.log("Error buscando el producto por: " + reason);
                        });
                    }


                }
                else {
                    var productosIds = [];
                    var productosObj = [];
                    var producto;

                    var response = Empresa.query({id: '5697c2f8e4b07f04a74941fb'});
                    response.$promise.then(function (data) {
                        productosObj = data.catalogo;

                        var inicio = 0;
                        var final = productosObj.length - 1;

                        for (var j = 0; j < productosObj.length; j++) {
                            response = Productos.query({id: productosObj[j].prod_id});

                            response.$promise.then(function (data, i, precios) {
                                producto = data;

                                productosIds.push(producto._id);

                                if (inicio == final) {
                                    var response2 = $http.post('./../api/promociones', {
                                        'name': nombre,
                                        'description': descripcion,
                                        'barcode': codigo,
                                        'empresa': '5697c2f8e4b07f04a74941fb',
                                        'tipo': tipo,
                                        'f_desde': fechaInicio,
                                        'f_hasta': fechaFinal,
                                        'categorias': categorias,
                                        'productos': productosIds
                                    });
                                    response2.success(function (data2) {
                                        location.href = '/business-panel/index#/dashboard/promociones';
                                    }, function (reason) {
                                        console.log("Error en insertarProducto por: " + reason);
                                    });
                                }
                                inicio = inicio + 1;
                            });

                        }

                    });

                }
            }
        }

        vm.hacambiado = function()
        {
            if(vm.selectvalue == 'Un tipo de producto') {
                vm.productosTipos = new Array;
                var childs = document.getElementById('s2id_mySel').firstElementChild;
                var nums = childs.childElementCount;
                while(nums > 1)
                {
                    childs.removeChild(childs.firstElementChild);
                    nums = nums - 1;
                }
                vm.productosTipos = [];

                var arrayTypes = ['-----','Infusiones y solubles','Animales', 'Agua', 'Limpieza', 'Dietéticos', 'Botiquín', 'Azucar y edulcorantes', 'Postres', 'Fruta', 'Untables', 'Aceites', 'Sal, especias y sazonadores', 'Caldos y purés', 'Precocinados', 'Cosméticos', 'Lácteos y huevos', 'Higiene', 'Bebidas alcohólicas', 'Aperitivos', 'Refrescos', 'Panadería', 'Dulces', 'Pescados', 'Carnes', 'Bebés', 'Electrónica', 'Papelería', 'Multimedia', 'Deportes', 'Ropa y calzado', 'Muebles', 'Legumbres', 'Pastas', 'Vegetales', 'Salsas', 'Congelados', 'Conservas'];
                arrayTypes = arrayTypes.sort();
                for(var i = 0; i < arrayTypes.length; i++)
                {
                    vm.productosTipos.push({nombre: arrayTypes[i]});
                }
            }
            else if(vm.selectvalue == 'Todos los productos')
            {
                vm.productosTipos = new Array;
                var childs = document.getElementById('s2id_mySel').firstElementChild;
                var nums = childs.childElementCount;
                while(nums > 1)
                {
                    childs.removeChild(childs.firstElementChild);
                    nums = nums - 1;
                }
                //vm.productosTipos.push(vm.productosTipo1);
            }
            else if(vm.selectvalue == 'Un producto en concreto')
            {
                vm.productosTipos = new Array;
                var childs = document.getElementById('s2id_mySel').firstElementChild;
                var nums = childs.childElementCount;
                while(nums > 1)
                {
                    childs.removeChild(childs.firstElementChild);
                    nums = nums - 1;
                }
                vm.devuelveCatalogo('5697c2f8e4b07f04a74941fb');
            }
        }

        vm.imprimirCodigo = function()
        {
            //COMIENZO GENERAR PDF
            var pdf = new jsPDF('p', 'pt', 'letter');
            // source can be HTML-formatted string, or a reference
            // to an actual DOM element from which the text will be scraped.
            var nombreLista = 'Prueba';
            var source = document.getElementById("codeDiv");
            var divv = document.getElementById("superDiv");
            divv.style.display = 'block';
            source.style.visibility = 'visible';



            // we support special element handlers. Register them with jQuery-style
            // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
            // There is no support for any other type of selectors
            // (class, of compound) at this time.
            var specialElementHandlers = {
                // element with id of "bypass" - jQuery style selector
                '#bypassme': function (element, renderer) {
                    // true = "handled elsewhere, bypass text extraction"
                    return true
                }
            };
            var margins = {
                top: 80,
                bottom: 60,
                left: 40,
                width: 522
            };

            // all coords and widths are in jsPDF instance's declared units
            // 'inches' in this case
            pdf.addHTML(source, function () {
                var string = pdf.output('datauristring');
                $('.preview-pane').attr('src', string);
            });


        }



        document.onkeydown = function(evt) {
            evt = evt || window.event;
            if (evt.keyCode == 27) {
                escapar();
            }
        };


                document.getElementById('productosAfectados');

    }]);



$(document).ready(function(){

    $.getScript('//cdnjs.cloudflare.com/ajax/libs/select2/3.4.8/select2.min.js',function(){
        $.getScript('//cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.3.0/js/bootstrap-datepicker.min.js',function(){
            $.getScript('//cdnjs.cloudflare.com/ajax/libs/moment.js/2.6.0/moment.min.js',function(){
                $.getScript('//cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/3.0.0/js/bootstrap-datetimepicker.min.js',function(){
                    $.getScript('//cdnjs.cloudflare.com/ajax/libs/jasny-bootstrap/3.1.3/js/jasny-bootstrap.min.js',function(){

                        $("#mySel").select2({
                            closeOnSelect:false
                        });

                        $("#mySel2").select2({
                            closeOnSelect:false
                        });

                        /*
                        $('#datepicker').datepicker({
                            autoclose:true,
                        }).on("changeDate", function(e){
                            console.log(e.date);
                        });

                        $('.input-daterange').datepicker({
                            autoclose:true
                        }).on("changeDate", function(e){
                            console.log(e.date);
                        });

                        $('#timepicker').datetimepicker({
                            pickDate: false
                        });*/

                        $("input").bind('keyup change',function() {
                            var $t = $(this);
                            var $par = $t.parent();
                            var min = $t.attr("data-valid-min");
                            var match = $t.attr("data-valid-match");
                            var pattern = $t.attr("pattern");

                            if (typeof match!="undefined"){
                                if ($t.val()!=$('#'+match).val()) {
                                    $par.removeClass('has-success').addClass('has-error');
                                }
                                else {
                                    $par.removeClass('has-error').addClass('has-success');
                                }
                            }
                            else if (!this.checkValidity()) {
                                $par.removeClass('has-success').addClass('has-error');
                            }
                            else {
                                $par.removeClass('has-error').addClass('has-success');
                            }

                            if ($par.hasClass("has-success")) {
                                $par.find('.form-control-feedback').removeClass('fade');
                            }
                            else {
                                $par.find('.form-control-feedback').addClass('fade');
                            }

                        });





                    });//script
                });//script
            });//script
        });//script
    });//script

});
