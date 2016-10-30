'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('EstadisticasUsuarioCtrl', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

        var vm = this;
        vm.tituloPestanya = "Gasto por compra";
        vm.estadisticas = 0;

        vm.tipoProd = "todos";

        vm.tiposDeProducto = vm.todosTipos;

        vm.mediasTipos = [];
        vm.mediasTiposEmpresa = [];

        vm.misProductos=[];
        vm.valores = [];
        var empresa = "";

        //Con esto recuperamos el nombre y la id del usuario de la sesión y la almacenamos en el controlador
        if(document.getElementById("hiddenName")!=null) {

            vm.nombreUsuario = document.getElementById("hiddenName").value;
            vm.idUsuario = document.getElementById("hiddenId").value;
            vm.emailUsuario = document.getElementById("hiddenEmail").value;
            vm.fotoUsuario = document.getElementById("hiddenPhoto").value;
            var responseEmpresa = $http.post('./../api/empresas/empresaDeUsuario', {usuario: vm.idUsuario});
            responseEmpresa.success(function(data){
                empresa = data[0];
                vm.inicializaValores();
            });
        }

        vm.cargarEstadisticas = function(num){
            vm.cambiarClasePestanya(num);
            vm.estadisticas = num;
            switch(num){
                case 0: vm.tituloPestanya = "Gasto por compra";
                    break;
                case 1: vm.tituloPestanya = "Compras al mes";
                    break;
            }
        }

        vm.cambiarClasePestanya = function(num){
            var pestanyas = document.getElementsByClassName("headerListas");
            for(var y=0; y<pestanyas.length; y++){
                pestanyas[y].classList.remove("headerListasSel");
            }
            pestanyas[num].classList.add("headerListasSel");
        }

        vm.inicializaValores = function(){
            var responseDatos = $http.post("./../api/dataempresas/dameDatosDeCategorias", {id_empresa: empresa._id});
            responseDatos.success(function (data) {
                vm.valores = data;
                vm.cambiarValoresBar();
                vm.cambiarValoresRadar();
            });
        }

        vm.cambiarValoresBar = function(){
            var gastoMedioPorCliente = [];
            var gasto = [];
            var categoria = [];

            vm.valores.sort(compareGasto);
            vm.valores.reverse();

            for(var i=0; i<vm.valores.length; i++){
                categoria.push(vm.valores[i].categoria);
                gasto.push(vm.valores[i].gastoMedio);
            }

            $scope.bar1 = {
                labels: categoria,
                series: ['Gasto medio por cliente'],
                data: [gasto],
                colours : [{
                    fillColor: 'rgba(76, 180, 54, 0.7)',
                    strokeColor: 'rgba(76, 108, 54, 1)',
                    highlightFill: 'rgba(123, 207, 0, 0.7)',
                    highlightStroke: 'rgba(76, 108, 54, 1)'
                }]
            }
        };

        vm.cambiarValoresRadar = function(){
            var gastoMedioPorCliente = [];
            var compras = [];
            var categoria = [];

            vm.valores.sort(compareCompras);
            vm.valores.reverse();

            for(var i=0; i<vm.valores.length; i++){
                categoria.push(vm.valores[i].categoria);
                compras.push(vm.valores[i].comprasMes);
            }

            $scope.radar = {
                labels: categoria,

                data:[
                    compras,
                ],

                colours : [{
                    fillColor: 'rgba(76, 180, 54, 0.6)',
                    strokeColor: 'rgba(76, 108, 54, 1)',
                    highlightFill: 'rgba(46, 255, 83, 1)',
                    highlightStroke: 'rgba(76, 108, 54, 1)'
                }]
            };
        };

        function compareGasto(a,b) {
            if (a.gastoMedio > b.gastoMedio)
                return -1;
            else if (a.gastoMedio < b.gastoMedio)
                return 1;
            else
                return 0;
        }

        function compareCompras(a,b) {
            if (a.comprasMes > b.comprasMes)
                return -1;
            else if (a.comprasMes < b.comprasMes)
                return 1;
            else
                return 0;
        }

    }]);/**
 * Created by Xisco on 15/02/2016.
 */
