'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('kpiEntradasSistemaCtrl', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {
        var vm = this;
        vm.tituloPestanya = "Entradas al sistema";
        vm.estadisticas = 0;
        vm.prov = "";

        vm.entradasPorMes=[];
        vm.numMeses = 6;

        //Variables paginación
        vm.numElemsPag = 10;
        vm.inicioPaginacion = 0;
        vm.finPaginacion = vm.numElemsPag;
        vm.numPags = 0;

        vm.paginacionActual = 1;
        vm.navegacion = [];

        vm.cargarEstadisticas = function(num){
            vm.cambiarClasePestanya(num);
            vm.estadisticas = num;
            switch(num){
                case 0: vm.tituloPestanya = "Entradas al sistema";
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
            vm.cargarEntradasAlSistema();
            vm.cargarValoresBar();
        }

        vm.dameNombreMes = function(num){
            switch(num){
                case 0:  return "Enero"; break;
                case 1:  return "Febrero"; break;
                case 2:  return "Marzo"; break;
                case 3:  return "Abril"; break;
                case 4:  return "Mayo"; break;
                case 5:  return "Junio"; break;
                case 6:  return "Julio"; break;
                case 7:  return "Agosto"; break;
                case 8:  return "Septiembre"; break;
                case 9:  return "Octubre"; break;
                case 10: return "Noviembre"; break;
                case 11: return "Diciembre"; break;
            }
        }

        vm.formatearFechaPretty = function(fecha){
            var date = new Date(fecha);
            var fecha = date.getDate().toString() + " de " + vm.dameNombreMes(date.getMonth()) + " de " + date.getFullYear().toString();
            fecha += " - ";
            fecha += date.getHours()+":"+("0" + date.getMinutes()).slice(-2);
            return fecha;
        }

        vm.cargarEntradasAlSistema = function(){
            var responseValorados = $http.post('./../apiInfo/infosistema/devuelveEntradasSistemaFecha', {inicio: vm.inicioPaginacion, fin: vm.finPaginacion});
            responseValorados.success(function(data){
                vm.entradasSistema = data.arrayEntradas;
                vm.numPags = Math.ceil(parseInt(data.total)/vm.numElemsPag);

                for(var i=1; i<=vm.numPags; i++)
                    vm.navegacion.push(i);

            });
        }

        vm.cargarValoresBar = function(){
            var fechaActual = new Date();
            vm.entradasPorMes = [];
            fechaActual.setMonth(fechaActual.getMonth()-(vm.numMeses-1));
            var cont=0;
            //Para cada mes, carga el numero de entradas al sistema
            for (var j=0; j<vm.numMeses; j++){
                var responseValorados = $http.post('./../apiInfo/infosistema/devuelveEntradasAlSistema', {mes: fechaActual.getMonth(), anyo: fechaActual.getFullYear(), provider: vm.prov});

                responseValorados.success(function(data){
                    vm.entradasPorMes.push(data);
                    cont++;

                    if(cont==vm.numMeses){
                        vm.cambiarGraficoLineas1();
                    }
                });
                fechaActual.setMonth(fechaActual.getMonth()+1);
            }
        };

        vm.cambiarGraficoLineas1 = function() {

            var meses = [];
            var valor = [], valorWeb=[], valorGoogle=[], valorTwitter=[];

            vm.entradasPorMes.sort(compareMes);

            for(var j=0; j<vm.entradasPorMes.length; j++){
                meses.push(vm.dameNombreMes(vm.entradasPorMes[j].mes));
                valor.push(vm.entradasPorMes[j].total);
                valorWeb.push(vm.entradasPorMes[j].entradasWeb);
                valorGoogle.push(vm.entradasPorMes[j].entradasGoogle);
                valorTwitter.push(vm.entradasPorMes[j].entradasTwitter);
            }

            valorTwitter=[326, 215, 203, 125, 50, 20];
            valorTwitter.reverse();
            valorGoogle=[53, 23, 14, 12, 2, 3];
            valorGoogle.reverse();
            valorWeb=[536, 457, 469, 368, 124, 230];
            valorWeb.reverse();

            $scope.line = {
                labels: meses,
                series: ['Entradas por Twitter', 'Entradas por web','Entradas por Google+'],
                data: [
                    valorTwitter, valorWeb , valorGoogle
                ],
                colours: ["#0FB5EE", "#00A731", "#D34836"],
                onClick: function (points, evt) {
                    console.log(points, evt);
                }
            };

        }

        vm.cambiarPaginacion = function(num){
            if(num>0 && num<=vm.numPags) {
                vm.paginacionActual = num;
                vm.inicioPaginacion = (num - 1) * vm.numElemsPag;
                vm.finPaginacion = vm.inicioPaginacion + vm.numElemsPag;
                vm.cargarEntradasAlSistema();
            }
        }

        vm.inicializaValores();

        function compareMes(a,b){
            var f1 = a.mes+ a.anyo*100;
            var f2 = b.mes+ b.anyo*100;
            if (f1 < f2)
                return -1;
            else if (f1 > f2)
                return 1;
            else
                return 0;
        }
    }]);/**
 * Created by Xisco on 15/02/2016.
 */
