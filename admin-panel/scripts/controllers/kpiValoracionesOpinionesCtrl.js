'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('kpiValoracionesOpinionesCtrl', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {
        var vm = this;
        vm.tituloPestanya = "Valoraciones y opiniones";
        vm.estadisticas = 0;

        vm.entradasPorMes=[];
        vm.numMeses = 6;

        vm.objetoValoraciones = [];

        vm.valoraciones = [];
        vm.opiniones = [];

        //Variables paginación
        vm.numElemsPag = 5;
        vm.inicioPaginacion = 0;
        vm.finPaginacion = vm.numElemsPag;
        vm.numPags = 0;

        vm.paginacionActual = 1;
        vm.navegacion = [];

        var empresa = "";

        vm.cargarEstadisticas = function(num){
            vm.cambiarClasePestanya(num);
            vm.estadisticas = num;
            switch(num){
                case 0: vm.tituloPestanya = "Llamadas a la API";
                    break;
                case 1: vm.tituloPestanya = "Llamadas a la API fallidas";
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
            vm.cargarLlamadasAPI();
        }

        vm.cargarLlamadasAPI = function(){
            var fechaActual = new Date();
            vm.entradasPorMes = [];
            fechaActual.setMonth(fechaActual.getMonth()-(vm.numMeses-1));
            var cont=0;
            //Para cada mes, carga el numero de entradas al sistema
            for (var j=0; j<vm.numMeses; j++) {
                var responseLlamadas = $http.post('./../apiInfo/infosistema/devuelveNumValoraciones', {mes: fechaActual.getMonth(), anyo: fechaActual.getFullYear()});

                responseLlamadas.success(function (data) {
                    vm.valoraciones.push(data);
                    cont++;
                    if(cont>=vm.numMeses*2){
                        vm.cambiarValoresLinea();
                    }
                });

                var responseValorados = $http.post('./../apiInfo/infosistema/devuelveNumOpiniones', {mes: fechaActual.getMonth(), anyo: fechaActual.getFullYear()});
                responseValorados.success(function(data){
                    vm.opiniones.push(data);
                    cont++;
                    if(cont>=vm.numMeses*2){
                        vm.cambiarValoresLinea();
                    }
                });

                fechaActual.setMonth(fechaActual.getMonth()+1);
            }
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

        vm.cambiarValoresLinea = function () {

            var meses = [];
            var valorApi = [], valorFallo = [];

            var objetoAux;

            vm.valoraciones.sort(compareMes);
            vm.opiniones.sort(compareMes);

            for(var j=0; j<vm.valoraciones.length; j++){
                meses.push(vm.dameNombreMes(vm.valoraciones[j].mes));
                valorApi.push(vm.valoraciones[j].contador);
                valorFallo.push(vm.opiniones[j].contador);
                objetoAux = {
                    num: vm.valoraciones[j].contador,
                    numFallidas: vm.opiniones[j].contador,
                    fecha: vm.dameNombreMes(vm.valoraciones[j].mes)+" del "+vm.valoraciones[j].anyo
                }
                vm.objetoValoraciones.push(objetoAux);
            }

            vm.objetoValoraciones.reverse();

            $scope.line = {
                labels: meses,
                series: ['Valoraciones realizadas', 'Opiniones realizadas'],
                data: [
                    valorApi, valorFallo
                ],
                colours: ["#00A731", "#CCE10D"],
                onClick: function (points, evt) {
                    console.log(points, evt);
                }
            };
        }

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


        vm.inicializaValores();

    }]);/**
 * Created by Xisco on 15/02/2016.
 */
