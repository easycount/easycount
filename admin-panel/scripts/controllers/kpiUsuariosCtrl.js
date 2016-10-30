'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('kpiUsuariosCtrl', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {
        var vm = this;
        vm.tituloPestanya = 0;
        vm.estadisticas = 0;
        vm.prov = "";

        vm.usuariosPorMes=[];
        vm.usuariosSistema=[];
        vm.numMeses = 6;

        //Variables paginación
        vm.numElemsPag = 5;
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

        vm.cargarValoresBar = function(){
            var fechaActual = new Date();
            vm.usuariosPorMes = [];
            fechaActual.setMonth(fechaActual.getMonth()-(vm.numMeses-1));
            var cont=0;
            //Para cada mes, carga el numero de entradas al sistema
            for (var j=0; j<vm.numMeses; j++){
                var responseValorados = $http.post('./../api/usuarios/nuevosUsuarios', {mes: fechaActual.getMonth(), anyo: fechaActual.getFullYear(), provider: vm.prov});

                responseValorados.success(function(data){
                    vm.usuariosPorMes.push(data);
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
            var valor = []

            vm.usuariosPorMes.sort(compareMes);

            var objAux;

            for(var j=0; j<vm.usuariosPorMes.length; j++){
                meses.push(vm.dameNombreMes(vm.usuariosPorMes[j].mes));
                valor.push(vm.usuariosPorMes[j].totalNuevosUsuarios);

                objAux = {
                    mes: vm.dameNombreMes(vm.usuariosPorMes[j].mes)+" del "+vm.usuariosPorMes[j].anyo,
                    nuevos: vm.usuariosPorMes[j].totalNuevosUsuarios
                }

                vm.tituloPestanya= vm.usuariosPorMes[j].totalUsuarios.toString();

                vm.usuariosSistema.push(objAux);
            }

            $scope.line = {
                labels: meses,
                series: ['Nuevos usuarios'],
                data: [
                    valor
                ],
                colours: ["#00A731"],
                onClick: function (points, evt) {
                    console.log(points, evt);
                }
            };

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
