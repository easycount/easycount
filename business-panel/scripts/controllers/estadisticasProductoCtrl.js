'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('EstadisticasProductoCtrl', ['$scope', '$timeout', '$http' ,'Productos', 'Empresas', function ($scope, $timeout, $http, Productos, Empresas) {
        var vm = this;
        vm.tituloPestanya = "Valoración de productos";
        var empresa;
        vm.tipoProd = "";
        vm.todosTipos = [];
            /*["Electrónica",
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
        ]*/

        vm.mediasTipos = [];
        vm.mediasTiposEmpresa = [];

        vm.productosVal = [];
        vm.productosEmpresa = [];

        vm.numProductosMostrar = 5;

        vm.peoresProductos = [];
        vm.mejoresProductos = [];

        vm.valoracionMediaTotal = 0;

        vm.numElemsPag = 5;
        vm.inicioPaginacion = 0;
        vm.finPaginacion = vm.numElemsPag;
        vm.numPags = 0;

        vm.paginacionActual = 1;
        vm.navegacion = [];

        //Con esto recuperamos el nombre y la id del usuario de la sesión y la almacenamos en el controlador
        if(document.getElementById("hiddenName")!=null) {

            vm.nombreUsuario = document.getElementById("hiddenName").value;
            vm.idUsuario = document.getElementById("hiddenId").value;
            vm.emailUsuario = document.getElementById("hiddenEmail").value;
            vm.fotoUsuario = document.getElementById("hiddenPhoto").value;
            var responseEmpresa = $http.post('./../api/empresas/empresaDeUsuario', {usuario: vm.idUsuario});
            responseEmpresa.success(function(data){
                empresa = data[0];
                vm.cargarTiposDisponibles();
                vm.incializaValores();
            });
        }

        vm.incializaValores = function(){
            vm.crearListaFiltrada();
            vm.cargarDatosGraficoBarras1();
            vm.cargarDatosGraficoBarras2();
            vm.calculaMediaTotal();
        }

        var cont=0;
        //Crea la lista con los productos de la empresa y su valoración
        vm.crearObjetoLista = function(){
            vm.productosEmpresa = empresa.catalogo;
            for(var i=0; i<vm.productosEmpresa.length; i++){
                vm.cargarProducto(i);
            }
        }

        //Crea la lista con los productos de la empresa y su valoración
        vm.crearListaFiltrada = function(){
            var responseFiltro = $http.post('./../api/dataEmpresas/dameNProductosPorValoracionEmpresaTipo', {id_empresa: empresa._id, tipo: vm.tipoProd, inicio: vm.inicioPaginacion, cantidad: vm.finPaginacion});
            responseFiltro.success(function(data){
                vm.productosEmpresa = data.array;
                vm.numPags = Math.ceil(parseInt(data.total)/vm.numElemsPag);
                for(var i=1; i<=vm.numPags; i++)
                    vm.navegacion.push(i);
            });
        }

        vm.cargarTiposDisponibles = function(){
            var responseFiltro = $http.post('./../api/dataempresas/dameDatosDeTipos', {id_empresa: empresa._id});
            responseFiltro.success(function(data){
                vm.todosTipos = [];
                for(var i=0; i<data.length; i++){
                    vm.todosTipos.push(data[i].tipo);
                }
            });
        }


        //Recogemos nombre, tipo, valoración de producto en la empresa y valoración general del producto
        vm.cargarProducto = function(indice){
            var response = Productos.get({id: vm.productosEmpresa[indice].prod_id});
            response.$promise.then(function(data){
                vm.productosEmpresa[indice]['name'] = data.name;
                vm.productosEmpresa[indice]['type'] = data.type;
                vm.cargarValoraciones(indice);
            });
        }

        //Cargamos las valoraciones del producto en el sistema y en la empresa concreta
        vm.cargarValoraciones = function(indice){
            var responseInfo = $http.post("./../api/dataempresas/dameDatosDeProducto", {id_empresa: empresa._id, id_producto: vm.productosEmpresa[indice].prod_id})
            responseInfo.success(function(data){
                cont++;
                vm.productosEmpresa[indice]['valMed'] = data.valMedEmpresa;
                if(vm.productosEmpresa[indice]['valMed']==null){
                    vm.productosEmpresa[indice]['valMed']=0;
                }
                vm.productosEmpresa[indice]['valMedGen'] = data.valMedTot;
                if(vm.productosEmpresa[indice]['valMedGen']==null){
                    vm.productosEmpresa[indice]['valMedGen']=0;
                }
                if(cont>=vm.productosEmpresa.length){

                }
            });
        }

        var contMejores = 0;
        vm.cargarDatosGraficoBarras1 = function(){
            var responseInfo = $http.post("./../api/dataempresas/dameNProductosPorValoracionEmpresaTipo", {id_empresa: empresa._id, cantidad: vm.numProductosMostrar, peores: "false", tipo: vm.tipoProd});
            responseInfo.success(function(data){
                vm.mejoresProductos = data.array;
                for(var o=0; o<vm.mejoresProductos.length; o++){
                    vm.cargarNombreMejores(o);
                }
            });
        }

        vm.cargarNombreMejores = function(indice){
            var response = Productos.get({id: vm.mejoresProductos[indice].prod_id});
            response.$promise.then(function(data){
                contMejores++;
                vm.mejoresProductos[indice]['name'] = data.name;

                if(contMejores>=vm.mejoresProductos.length){
                    contMejores = 0;
                    vm.cambiarGraficoBarras1()
                }
            });
        }

        //Modifica con los datos calculados el grafico de barras con los productos mejor valorados
        vm.cambiarGraficoBarras1 = function(){
            var arrayNombre1 = [], arrayValoraciones1=[], arrayValoracionesGenerales1=[];
            for(var u=0; u<vm.mejoresProductos.length; u++ ){
                arrayNombre1.push(vm.mejoresProductos[u].name.substring(0, 15));
                arrayValoraciones1.push(parseFloat(vm.mejoresProductos[u].valMedEmpresa.toFixed(2)));
                arrayValoracionesGenerales1.push(parseFloat(vm.mejoresProductos[u].valMedTot.toFixed(2)));
            }

            $scope.bar = {
                labels: arrayNombre1,
                series: ["Valoración en mi empresa", "Valoración en general"],
                data: [arrayValoraciones1, arrayValoracionesGenerales1],
                colours: ["#00B931", "#A1E900"],
                onClick: function (points, evt) {
                    console.log(points, evt);
                }
            };
        }

        var contPeores = 0;
        vm.cargarDatosGraficoBarras2 = function(){
            var responseInfo = $http.post("./../api/dataempresas/dameNProductosPorValoracionEmpresaTipo", {id_empresa: empresa._id, cantidad: vm.numProductosMostrar, peores: "true", tipo: vm.tipoProd});
            responseInfo.success(function(data){
                vm.peoresProductos = data.array;
                for(var o=0; o<vm.peoresProductos.length; o++){
                    vm.cargarNombrePeores(o);
                }
            });
        }

        vm.cargarNombrePeores = function(indice){
            var response = Productos.get({id: vm.peoresProductos[indice].prod_id});
            response.$promise.then(function(data){
                contPeores++;
                vm.peoresProductos[indice]['name'] = data.name;

                if(contPeores>=vm.peoresProductos.length){
                    contPeores = 0;
                    vm.cambiarGraficoBarras2()
                }
            });
        }

        //Modifica con los datos calculados el grafico de barras con los productos mejor valorados
        vm.cambiarGraficoBarras2 = function(){
            var arrayNombre = [], arrayValoraciones=[], arrayValoracionesGenerales=[];
            for(var u=0; u<vm.peoresProductos.length; u++ ){
                arrayNombre.push(vm.peoresProductos[u].name.substring(0, 15));
                arrayValoraciones.push(parseFloat(vm.peoresProductos[u].valMedEmpresa.toFixed(2)));
                arrayValoracionesGenerales.push(parseFloat(vm.peoresProductos[u].valMedTot.toFixed(2)));
            }

            $scope.bar2 = {
                labels: arrayNombre,
                series: ["Valoración en mi empresa", "Valoración en general"],
                data: [arrayValoraciones, arrayValoracionesGenerales],
                colours: ["#F81D00", "#F87B00"],
                onClick: function (points, evt) {
                    console.log(points, evt);
                }
            };
        }

        vm.calculaMediaTotal = function(){
            var responseInfo = $http.post("./../api/dataempresas/valoracionMediaEmpresa", {id_empresa: empresa._id});
            responseInfo.success(function(data){
                vm.valoracionMediaTotal = data;
            });
        }

        vm.cambiarPaginacion = function(num){
            if(num>0 && num<=vm.numPags) {
                vm.paginacionActual = num;
                vm.inicioPaginacion = (num - 1) * vm.numElemsPag;
                vm.finPaginacion = vm.inicioPaginacion + vm.numElemsPag;
                vm.crearListaFiltrada();
            }
        }
    }]);/**
 * Created by Xisco on 15/02/2016.
 */
