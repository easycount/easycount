/**
 * Created by Xisco on 09/03/2016.
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

    .controller('asignarUsuarioCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams,$http) {

        var vm = $scope;

        vm.empresas = new Array;
        //vm.promos.push(vm.promo1, vm.promo2, vm.promo3, vm.promo4);

        vm.devuelveEmpresas = function(){

            var response = $http.get('./../api/empresas');
            response.success(function(data)
            {
                for(var i = 0; i < data.length; i++)
                {
                    vm.empresa = { nombre: data[i].name, cif: data[i].cif, foto: data[i].photo, id: data[i]._id};
                    vm.empresas.push(vm.empresa);
                }
            },function(reason){
                console.log("Error en buscarEstablecimiento por: "+reason);
            });


        }

        vm.asignarAEmpresa = function(i)
        {

           var empresa = document.getElementById('empresa'+ i).value;


            if(empresa == '? undefined:undefined ?')
                console.log('Empresa no seleccionada');
            else
            {
                var response = $http.post('./../api/empresas/insertarUsuario', {
                    'id_empresa': empresa,
                    'id_usuario': i
                });
                response.success(function(data)
                {
                    swal('Usuario asignado');
                    location.reload();

                },function(reason){
                    console.log("Error en asignar ususario a empresa por: "+reason);
                });
            }

        }

        vm.devuelveEmpresas();

        vm.usuarios = new Array;

        vm.devuelveUsuarios = function(){

            var usuario;

            var response = $http.post('./../api/usuarios/usuariosSinEmpresa');
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
