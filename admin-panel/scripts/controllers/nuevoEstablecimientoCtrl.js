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

    .controller('nuevoEstablecimientoCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', 'Promociones', function ($scope, $timeout,Empresa,Productos,$stateParams,$http,Promociones) {

        var vm = $scope;


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



        vm.crearEstablecimiento = function()
        {
            var nombre = document.getElementById('nombre').value;
            var coordenadas = document.getElementById('coordenadas').value;
            var ciudad = document.getElementById('ciudad').value;
            var comunidad = document.getElementById('comunidad').value;
            var empresa = document.getElementById('empresa').value;

            if(nombre == '' || coordenadas == '' || ciudad == '' || comunidad == '' || empresa == '')
                alert('Rellena todos los campos');
            else
            {
                var response = $http.post('./../api/establecimientos', {
                    'name': nombre,
                    'coordenadas': coordenadas,
                    'ciudad': ciudad,
                    'comunidad': comunidad,
                    'empresa': empresa
                });
                response.success(function (data) {
                    location.href = '/admin-panel/index#/dashboard/verEstablecimientos';

                }, function (reason) {
                    console.log("Error en insertarProducto por: " + reason);
                });

            }
        }

    }]);

$(document).ready(function(){

    $.getScript('//cdnjs.cloudflare.com/ajax/libs/select2/3.4.8/select2.min.js',function(){
        $.getScript('//cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.3.0/js/bootstrap-datepicker.min.js',function(){
            $.getScript('//cdnjs.cloudflare.com/ajax/libs/moment.js/2.6.0/moment.min.js',function(){
                $.getScript('//cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/3.0.0/js/bootstrap-datetimepicker.min.js',function(){
                    $.getScript('//cdnjs.cloudflare.com/ajax/libs/jasny-bootstrap/3.1.3/js/jasny-bootstrap.min.js',function(){

                        $("#empresa").select2({
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
