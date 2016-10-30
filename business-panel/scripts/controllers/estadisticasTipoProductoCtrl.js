'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('EstadisticasTipoProductoCtrl', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {
        var vm = this;
        vm.tituloPestanya = "Valoración de tipos de producto";
        vm.estadisticas = 0;

        vm.tipoProd = "todos";
        vm.todosTipos = ["Electrónica",
            "Papelería",
            "Multimedia",
            "Deportes",
            "Ropa",
            "Muebles",
            "Infusiones",
            "Cosméticos",
            "Higiene",
            "Aperitivos",
            "Bebés",
            "Lácteos_y_huevos",
            "Refrescos",
            "Panadería",
            "Dulces",
            "Pescados",
            "Carnes",
            "Legumbres",
            "Pastas",
            "Vegetales",
            "Salsas",
            "Congelados",
            "Conservas"
        ]

        vm.tiposDeProducto = vm.todosTipos;

        vm.mediasTipos = [];
        vm.mediasTiposEmpresa = [];

        vm.misProductos=[];

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
                case 0: vm.tituloPestanya = "Valoración de tipos de producto";
                        break;
                case 1: vm.tituloPestanya = "Ventas de tipos de producto";
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
            vm.cargarProductosValorados();
        }

        vm.rellenarAleatorio = function(){
            var numAux = 0;
            for(var i=0; i<vm.todosTipos.length; i++){
                numAux = (Math.floor(Math.random() * 5) + 1) + (Math.floor(Math.random() * 9) * 0.1);
                vm.mediasTipos.push(numAux.toFixed(2));
                numAux = (Math.floor(Math.random() * 5) + 1) + (Math.floor(Math.random() * 9) * 0.1);
                vm.mediasTiposEmpresa.push(numAux.toFixed(2));
            }
        }

        vm.cargarProductosValorados = function(){
            var responseValorados = $http.post('./../api/dataempresas/dameDatosDeTipos', {id_empresa: empresa._id});
            responseValorados.success(function(data){
                vm.tiposDeProducto = data;
                vm.cambiarValoresRadar1();
                vm.cambiarValoresBar2();
            });
        }

        vm.cambiarValoresRadar1 = function () {

            var arrayNombres = [];
            var arrayMediasGen = [];
            var arrayMediasEmp = [];

            for(var i=0; i<vm.tiposDeProducto.length; i++){
                arrayNombres.push(vm.tiposDeProducto[i].tipo);
                arrayMediasEmp.push(vm.tiposDeProducto[i].valMedTipo);
                arrayMediasGen.push(vm.tiposDeProducto[i].valMedTipoTotal);
            }

            $scope.radar1 = {
                labels: arrayNombres,
                series: ['Valoración general', 'Valoración en la empresa'],

                data: [
                    arrayMediasGen,
                    arrayMediasEmp,
                ],
                colours : [{
                    fillColor: 'rgba(248, 123, 0, 0.6)',
                    strokeColor: 'rgba(248, 123, 0, 0.6)',
                    highlightFill: 'rgba(248, 123, 0, 0.6)',
                    highlightStroke: 'rgba(248, 123, 0, 0.6)'
                },
                    {
                        fillColor: 'rgba(2, 124, 153, 0.6)',
                        strokeColor: 'rgba(2, 124, 153, 0.6)',
                        highlightFill: 'rgba(2, 124, 153, 0.6)',
                        highlightStroke: 'rgba(2, 124, 153, 0.6)'
                    }
                ]

            };
        }

        vm.cambiarValoresBar2 = function () {

            var arrayNombres = [];
            var numComprados = [];

            for(var i=0; i<vm.tiposDeProducto.length; i++){
                arrayNombres.push(vm.tiposDeProducto[i].tipo);
                numComprados.push(vm.tiposDeProducto[i].numProductosComprados);
            }
            /*
            $scope.radar2 = {
                labels: arrayNombres,
                series: ['Número de productos vendidos'],

                data: [
                    numComprados
                ]

            };
            */

            $scope.bar2 = {
                labels: arrayNombres,
                series: ['Número de productos vendidos'],

                data: [numComprados],
                colours : [{
                    fillColor: 'rgba(76, 180, 54, 0.6)',
                    strokeColor: 'rgba(76, 108, 54, 1)',
                    highlightFill: 'rgba(46, 255, 83, 1)',
                    highlightStroke: 'rgba(76, 108, 54, 1)'
                }]

            }
        }
        vm.rellenarAleatorio();

    }]);/**
 * Created by Xisco on 15/02/2016.
 */
