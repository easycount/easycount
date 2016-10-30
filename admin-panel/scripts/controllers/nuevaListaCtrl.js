/**
 * Created by Xisco on 11/03/2016.
 */
'use strict';

var products = [];
var productosLista = []

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

    .controller('nuevaListaCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', 'Promociones', function ($scope, $timeout,Empresa,Productos,$stateParams,$http,Promociones) {

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
        vm.empresas = new Array;
        vm.devuelveEmpresas = function(){

            var response = $http.get('./../api/empresas');
            response.success(function(data)
            {
                for(var i = 0; i < data.length; i++)
                {
                    vm.empresa = {nombre: data[i].name, id: data[i]._id};
                    vm.empresas.push(vm.empresa);
                }

            });

        }

        vm.devuelveEmpresas();

        vm.devuelveCatalogo = function(superId){
            var productosObj = [];
            var producto;
            var response = Empresa.get({ id: superId});
            response.$promise.then(function(data)
            {
                $scope.supermercado = data.name;
                productosObj = data.catalogo;

                for(var i=0;i<productosObj.length;i++){
                    response = Productos.get({id : productosObj[i].prod_id});

                    response.$promise.then(function(data, i, precios){
                        producto = data;
                        vm.productosTipos.push({nombre: producto.name, id: producto._id});
                    });

                }
            });

        }

        vm.crearLista = function()
        {
            var nombre = document.getElementById('nombre').value;
            var descripcion = document.getElementById('descripcion').value;

            if(nombre == '' || descripcion == '' || products.length == 0 )
                alert('Rellena todos los campos');
            else
            {
                var response = $http.post('./../api/listas', {
                    'name': nombre,
                    'description': descripcion,
                    'productos': products,
                    'predefinida': 'true'
                });
                response.success(function (data) {
                    location.href = '/admin-panel/index#/dashboard/verListas';

                }, function (reason) {
                    console.log("Error en insertarProducto por: " + reason);
                });

            }
        }

        vm.hacambiado = function()
        {
            vm.productosTipos = new Array;

            var idEmpresa = document.getElementById('empresa').value;

            vm.devuelveCatalogo(idEmpresa);
        }

        vm.verLista = function()
        {
            var inner = "<ul>";

            for(var i = 0; i < productosLista.length; i++)
            {
                inner = inner + "<li>" + productosLista[i].empresa + ': ' + productosLista[i].producto + " - x" + productosLista[i].cantidad + "</li>";
            }

            inner = inner + "</ul>";

            swal({
                    title: "Productos añadidos",
                    html:true,
                    text: inner
                });
        }

        document.getElementById('productosAfectados');

        $(document).on( "click","#buttonAceptarCantidad",  function(e){
            var empresa = document.getElementById('empresa').value;
            var producto = document.getElementById('mySel').value;
            var cantidad = document.getElementById('cantidadNum').value;
            var prodName = $("#mySel option:selected").html();
            var empresaName = $("#empresa option:selected").html();

            products.push({prod_id: producto, cantidad: cantidad, empresa: empresa});
            productosLista.push({producto: prodName, cantidad: cantidad, empresa: empresaName});

            document.getElementById('mySel').selectedIndex = -1;

            document.getElementById('cantidadNum').value = '';

        });

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

                        $("#mySel").on('change', function()
                        {
                            if(document.getElementById('mySel').selectedIndex != -1) {
                                var inner = "<label class='col-md-4 control-label' for='cantidad'>Cantidad</label>";
                                inner = inner + "<div class='col-md-4'>";
                                inner = inner + "<input type='number' min='1' id='cantidadNum' class='form-control input-md' placeholder='Cantidad'/>";
                                inner = inner + "<div id='buttonCantidad' class='col-md-1'></div>";
                                inner = inner + "</div>";

                                document.getElementById('cantidad').innerHTML = inner;
                            }
                            else
                            {
                                document.getElementById('cantidad').innerHTML = '';
                            }

                        });

                        $("#cantidad").on('change', function()
                        {
                            if(document.getElementById('cantidadNum').value > 0) {
                                var inner = "<button style='margin-top:8px;margin-left:-13px;' class='btn btn-primary' id='buttonAceptarCantidad'>Insertar Producto</button>";
                                document.getElementById('buttonCantidad').innerHTML = inner;
                            }
                            else
                            {
                                document.getElementById('buttonAceptarCantidad').enabled = false;
                            }
                        });

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
