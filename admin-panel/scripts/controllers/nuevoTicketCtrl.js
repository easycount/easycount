'use strict';
/**
 * Created by Xisco on 11/04/2016.
 */

var products = [];
var productosLista = []

angular.module('sbAdminApp')


    .controller('nuevoTicketCtrl', ['$scope', '$timeout', 'Empresa', 'Productos', 'Tickets', '$stateParams', '$http',  function ($scope, $timeout,Empresa,Productos,Tickets,$stateParams,$http) {

        var vm = $scope;

        vm.crearTicket = function()
        {
            var usuario = document.getElementById('mySel3').value;
            var empresa = document.getElementById('empresa').value;
            var establecimiento = document.getElementById('mySel2').value;
            var fecha = document.getElementById('fecha').value;
            fecha = new Date(fecha);
            var importe = 0;
            var prods = [];
            var prodAux = "";
            for(var j=0; j<products.length; j++){
                prodAux = {id_prod: products[j].prod_id, cantidad: products[j].cantidad, precio_ud: products[j].precio};
                importe = importe + (products[j].cantidad * products[j].precio);
                prods.push(prodAux);
            }

            if(usuario == '' || empresa == '' || establecimiento == '' || fecha == '' || importe == 0)
                alert('Rellena todos los campos');
            else {

                var response = Tickets.save({'importe': importe, 'empresa': empresa, usuario: usuario, productos: prods, establecimiento: establecimiento});
                response.$promise.then(function (data) {
                    swal('Producto creado');
                    location.reload();
                }, function (reason) {
                    console.log(reason);
                });

                    /*wal('Producto creado');
                    location.href = '/admin-panel/index#/dashboard/nuevoProducto';
                    document.getElementById('nombre').value = '';
                    document.getElementById('barcode').value = '';
                    document.getElementById('type').selectedIndex = -1;
                    document.getElementById('descripcion').value = '';
                    document.getElementById('foto').value = '';*/

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

        vm.usuarios = new Array;
        vm.devuelveUsuarios = function(){

            var response = $http.get('./../api/usuarios');
            response.success(function(data)
            {
                for(var i = 0; i < data.length; i++)
                {
                    vm.usuario = {nombre: data[i].name, id: data[i]._id};
                    vm.usuarios.push(vm.usuario);
                }

            });

        }

        vm.devuelveUsuarios();

        vm.devuelveCatalogo = function(superId){
            var productosObj = [];
            var producto;

            var response = $http.post('./../api/empresas/catalogoPaginado', {
                'id_empresa': superId
            });
            response.success(function(data)
            {
                for(var i = 0; i < data.array.length; i++)
                {
                    vm.productosTipos.push({nombre: data.array[i].name, id: data.array[i].prod_id, precio:data.array[i].precio});
                }

            },function(reason){
                console.log("Error en buscarEstablecimiento por: "+reason);
            });

            /*
            var response = Empresa.get({ id: superId});
            response.$promise.then(function(data)
            {
                $scope.supermercado = data.name;
                productosObj = data.catalogo;

                for(var i=0;i<productosObj.length;i++){
                    response = Productos.get({id : productosObj[i].prod_id});

                    response.$promise.then(function(data, i, precios){
                        producto = data;
                        vm.productosTipos.push({nombre: producto.name, id: producto._id, precio:producto.precio});
                    });

                }
            });*/

        }




        vm.devuelveEstablecimientos = function(superId){

            var response = $http.post('./../api/establecimientos/establecimientosPorEmpresa', {
                'id_empresa': superId
            });
            response.success(function(data)
            {
                for(var i = 0; i < data.length; i++)
                {
                    vm.establecimientos.push({nombre: data[i].name, id: data[i]._id});
                }

            },function(reason){
                console.log("Error en buscarEstablecimiento por: "+reason);
            });

        }



        vm.hacambiado = function()
        {
            vm.productosTipos = new Array;
            vm.establecimientos = new Array;

            var idEmpresa = document.getElementById('empresa').value;

            vm.devuelveCatalogo(idEmpresa);
            vm.devuelveEstablecimientos(idEmpresa);
        }

        vm.verLista = function()
        {
            var inner = "<ul>";

            for(var i = 0; i < productosLista.length; i++)
            {
                inner = inner + "<li>" + productosLista[i].empresa + ': ' + productosLista[i].producto + " - x" + productosLista[i].cantidad + " - " + productosLista[i].precio + "eur/u" + "</li>";
            }

            inner = inner + "</ul>";

            swal({
                title: "Productos añadidos",
                html:true,
                text: inner
            });
        }

        $(document).on( "click","#buttonAceptarCantidad",  function(e){
            var empresa = document.getElementById('empresa').value;
            var producto = document.getElementById('mySel').value;
            var cantidad = document.getElementById('cantidadNum').value;
            var prodName = $("#mySel option:selected").html();
            var empresaName = $("#empresa option:selected").html();

            var aa = producto.split('|');

            producto = aa[0];
            var precio = aa[1];

            products.push({prod_id: producto, cantidad: cantidad, empresa: empresa, precio: precio});
            productosLista.push({producto: prodName, cantidad: cantidad, empresa: empresaName, precio: precio});

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

                        $("#mySel3").select2({
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