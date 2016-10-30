'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
	.controller('ChartCtrl', ['$scope', '$timeout', 'Empresas', 'Productos', '$http', function ($scope, $timeout, Empresas, Productos, $http) {
		var vm=this;
		vm.numMeses=6;
		var numMeses = 6;
		var numProductos = 10;
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

		vm.tituloPestanya = "Gasto medio por tiempo";
		vm.estadisticas = 0;
		vm.listas=[];
		vm.productosVal=[];

		vm.ejeAbscisas=[];
		vm.ejeOrdenadas=[];

		vm.cargadoEstad1 = false;

		vm.empresasCompra=[];
		vm.nombresEmpresa=[];
		vm.matrizMesesComerciosCompra = [];
		vm.gastoMedioCompraAnual=0;
		vm.gastoMedioCompraMensual=0;

		vm.misProductos = [];

		vm.empresasRestringidas = [];
		vm.auxEmpresas = [];
		//Con esto recuperamos el nombre y la id del usuario de la sesión y la almacenamos en el controlador
		if(document.getElementById("hiddenName")!=null) {
			vm.nombreUsuario = document.getElementById("hiddenName").value;
			vm.idUsuario = document.getElementById("hiddenId").value;
			vm.emailUsuario = document.getElementById("hiddenEmail").value;
			vm.fotoUsuario = document.getElementById("hiddenPhoto").value;
			vm.datosUsuario = [];

			var responseDatosUsuario = $http.post("./../api/datausuarios/buscar", {usuario: vm.idUsuario});
			responseDatosUsuario.success(function(data){
				vm.datosUsuario=data[0];
			});

		}

		vm.restringirEmpresas = function(emp){

			var pos = vm.empresasRestringidas.indexOf(emp._id);
			if(pos==-1)
				vm.empresasRestringidas.push(emp._id);
			else
				vm.empresasRestringidas.splice(pos, 1);

			vm.cargarMisProductos();
		}

		vm.anyadirEmpresasRestringidas = function(){
			for(var t=0; t<vm.empresasRestringidas.length; t++){
				var responseEmp = $http.post('./../api/empresas/buscar', {'_id': vm.empresasRestringidas[t]});
				responseEmp.success(function(data) {
					vm.empresasCompra.push(data[0]);
				});
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

		//===============================FUNCION DE REDIRECCION A LAS DISTINTAS FUNCIONES=======================================
		vm.cargarEstadisticas = function(cod){
			var pestanyas = document.getElementsByClassName("headerListas");
			for(var i = 0; i<pestanyas.length; i++){
				pestanyas[i].classList.remove("headerListasSel");
				if(i==cod)
					pestanyas[i].classList.add("headerListasSel");
			}
			document.getElementById('loaderEstad1').classList.add('bubbles');
			vm.cargadoEstad1 = false;
			vm.cargadoEstad2 = false;
			vm.cargadoEstad3 = false;
			vm.cargadoEstad4 = false;

			switch(cod){
				case 0: vm.tituloPestanya = "Gasto medio por tiempo";
					vm.cargarGastoMedioTiempo();
					break;
				case 1: vm.tituloPestanya = "Gasto medio por compra";
					vm.cargarGastoMedioCompra();
					break;
				case 2: vm.tituloPestanya = "Productos favoritos de la comunidad";
					vm.cargarPestanyaProductosValorados();
					break;
				case 3: vm.tituloPestanya = "Mis productos más comprados";
					vm.cargarMisProductos();
					break;
				case 4: vm.tituloPestanya = "Productos más comprados en EasyCount";
					vm.cargarProductosComunidad();
					break;
			}
		}


		//************************************************ FUNCIONES DE CARGADO PESTAÑA 1 ******************************************
		vm.cargarGastoMedioTiempo = function(){
			var meses;
			vm.calculaGastoAcumulado();
			vm.cargarGastoMeses(vm.gastoMedio);
		}

		vm.calculaGastoAcumulado = function(){
			vm.gastoActualMensual = 0;
			vm.gastoActualAnual = 0;
			vm.gastoMedioMensual = 128;
			vm.gastoMedioAnual = 129;

			var fechaActual = new Date();

			var response1 = $http.post("./../api/tickets/dameImporteAcumuladoMesUsuario", {'id_usuario': vm.idUsuario, 'mes': fechaActual.getMonth(), 'anyo':fechaActual.getFullYear()});
			response1.success(function (data) {
				vm.gastoActualMensual = data;
			})

			var response2 = $http.post("./../api/tickets/dameImporteAcumuladoAnyoUsuario", {'id_usuario': vm.idUsuario, 'anyo':fechaActual.getFullYear()});
			response2.success(function (data) {
				vm.gastoActualAnual = data;
			})

		}

		vm.cargarGastoMeses = function(){
			var cont = 0;

			var fechaActual = new Date();

			vm.ejeAbscisas = [];
			var valorMesActual = 0;
			vm.ejeOrdenadas = [];
			var valorNombreActual = "";

			fechaActual.setMonth(fechaActual.getMonth()-(numMeses-1));

			for (var j=0; j<numMeses; j++){
				cont++;
				vm.cargarValorMes(cont, fechaActual.getMonth(), fechaActual.getFullYear());
				valorNombreActual = vm.dameNombreMes(fechaActual.getMonth());

				vm.ejeAbscisas.push(valorNombreActual);

				fechaActual.setMonth(fechaActual.getMonth()+1);
			}
		}

		vm.cargarValorMes = function(cont, mes, anyo){
			var response = $http.post("./../api/tickets/dameImporteAcumuladoMesUsuario", {'id_usuario': vm.idUsuario, 'mes': mes, 'anyo': anyo});
			response.success(function (data) {
				vm.ejeOrdenadas[cont-1]=data;
				if(cont==numMeses) {
					vm.cambiarGraficoLineas1(vm.ejeOrdenadas, vm.ejeAbscisas);
				}
			});
		}

		vm.cambiarGraficoLineas1 = function(ordenadas, abscisas) {
			var arrayMedia = [];
			var media = 0.0;
			for(var k=0; k<ordenadas.length; k++){
				if(ordenadas[k]!=null)
					media+=parseFloat(ordenadas[k]);
			}
			media = media/ordenadas.length;

			for(var i=0; i<numMeses; i++){
				//arrayMedia.push(parseFloat(vm.datosUsuario.gastoMedioMensual.toFixed(2)));
				arrayMedia.push(media);
			}
			$timeout(function() {
				$scope.line1 = {
					labels: abscisas,
					series: ['Tu gasto mensual', 'Gasto medio'],
					data: [
						ordenadas,
						arrayMedia
					],
					colours: [
						{
							fillColor: 'rgba(0,0,0,0)', //azul invi
							strokeColor: 'rgb(0, 167, 49)', //media
							highlightFill: 'rgba(0,0,0,0)',
							highlightStroke: 'rgb(0, 167, 49)'
						}, {
							fillColor: 'rgba(15, 182, 238, 0.0)', //azul invi
							strokeColor: 'rgb(204, 225, 13)', //media
							highlightFill: 'rgba(15, 182, 238, 0.0)',
							highlightStroke: 'rgba(15, 182, 238, 0.0)'
						}],
					onClick: function (points, evt) {
						console.log(points, evt);
					}
				};
				document.getElementById('loaderEstad1').classList.remove('bubbles');
				vm.cargadoEstad1 = true;
				vm.estadisticas = 0;
			}, 300);
		}

		//************************************************ FUNCIONES DE CARGADO PESTAÑA 2 ******************************************
		vm.cargarGastoMedioCompra = function(){
			vm.cargarComprasMeses();
			vm.cargarGastosCompra();

		}

		///////////////////////////////////////////GRAFICO 2_1: NUMERO DE COMPRAS POR MES
		//Cargamos el numero de compras por mes
		vm.cargarComprasMeses = function(){
			var cont = 0;

			var fechaActual = new Date();

			vm.barraAbscisas = [];
			var valorMesActual = 0;
			vm.barraOrdenadas = [];
			var valorNombreActual = "";

			fechaActual.setMonth(fechaActual.getMonth()-(numMeses-1));

			//Para cada mes, carga el numero de compras por mes y establecimiento en la matriz que lo mostrara luego
			for (var j=0; j<numMeses; j++){
				cont++;
				vm.cargarComprasMes(cont, fechaActual.getMonth(), fechaActual.getFullYear());
				valorNombreActual = vm.dameNombreMes(fechaActual.getMonth());

				vm.barraAbscisas.push(valorNombreActual);

				fechaActual.setMonth(fechaActual.getMonth()+1);
			}
		}


		//Cont hace referencia al mes. Carga todos los tickets de un mes y usuario y cuenta el numero de veces que un usuario ha comprado
		//En cada establecimiento y mes
		vm.cargarComprasMes = function(cont, mes, anyo){
			vm.empresasCompra=[];
			var response = $http.post("./../api/tickets/dameTicketsMesUsuario", {'id_usuario': vm.idUsuario, 'mes': mes, 'anyo': anyo});
			//Recibo todos los tickets del mes indicado
			response.success(function (data) {
				//Para cada ticket, actualizamos la cantidad de compras
				for(var m=0; m<data.length; m++) {
					var indice = vm.empresasCompra.indexOf(data[m].empresa)
					//Si el ticket es de una empresa aún no almacenada
					if (indice == -1) {
						indice = vm.empresasCompra.push(data[m].empresa);
						vm.auxEmpresas.push(true);
						indice=indice-1;
						vm.pedirNombreEmpresa(data[m].empresa, indice);
					}
					if(vm.matrizMesesComerciosCompra[indice]==null)
						vm.matrizMesesComerciosCompra[indice]=[];
					if (vm.matrizMesesComerciosCompra[indice][cont-1] == null)
						vm.matrizMesesComerciosCompra[indice][cont-1] = 0;
					vm.matrizMesesComerciosCompra[indice][cont-1]+=1;
				}

				if(cont==numMeses) {
					vm.cambiarGraficoBarras2();
				}
			});
		}

		//Llamada a la BBDD para hallar el nombre de una empresa
		vm.pedirNombreEmpresa = function(id, indice){
			var response = $http.post('./../api/empresas/buscar', {'_id': id});
			response.success(function(data) {
				vm.nombresEmpresa[indice]=data[0].name;
			});
		}

		//Modifica con los datos calculados el grafico de barras de la pestaña 2
		vm.cambiarGraficoBarras2 = function(){

			//Bucle para rellenar con 0 los comercios/meses en los que no se haya comprado
			for(var i=0;i<vm.matrizMesesComerciosCompra.length; i++){
				if(vm.matrizMesesComerciosCompra[i]==null)
					vm.matrizMesesComerciosCompra=[];
				for(var j=0;j<numMeses; j++){
					if(vm.matrizMesesComerciosCompra[i][j]==null || vm.matrizMesesComerciosCompra[i][j]==""){
						vm.matrizMesesComerciosCompra[i][j]=0;
					}
				}
			}

			//Cambiamos ids de empresa por nombres
			var nombresEmpresa = [];
			var response;

				document.getElementById('loaderEstad1').classList.remove('bubbles');
				vm.cargadoEstad2 = true;
			$scope.bar1 = {
				labels: vm.barraAbscisas,
				series: vm.nombresEmpresa,
				data: vm.matrizMesesComerciosCompra,
				colours: [{
					fillColor: 'rgb(0, 167, 49)', //azul invi
					strokeColor: 'rgb(0, 167, 49)', //media
					highlightFill: 'rgba(0,0,0,0)',
					highlightStroke: 'rgb(0, 167, 49)'
				}],
				onClick: function (points, evt) {
					console.log(points, evt);
				}
			};
		}

		///////////////////////////////////////////GRAFICO 2_2: NUMERO DE COMPRAS POR MES

		//Para cada mes de los ultimos n meses, carga en el vector a mostrar el gasto medio por compra
		vm.cargarGastosCompra = function(){
			var cont = 0;

			var fechaActual = new Date();

			vm.ejeAbscisas = [];
			var valorMesActual = 0;
			vm.ejeOrdenadas = [];
			var valorNombreActual = "";

			fechaActual.setMonth(fechaActual.getMonth()-(numMeses-1));

			for (var j=0; j<numMeses; j++){
				cont++;
				vm.cargarGastoMedioMes(cont, fechaActual.getMonth(), fechaActual.getFullYear());
				valorNombreActual = vm.dameNombreMes(fechaActual.getMonth());

				vm.ejeAbscisas.push(valorNombreActual);

				fechaActual.setMonth(fechaActual.getMonth()+1);
			}
		}
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		//Llamada para recibir el dato de gasto medio por compra mensual. Cuando llega al ultimo mes, llama a pintar grafico de lineas
		vm.cargarGastoMedioMes = function(cont, mes, anyo){
			var response = $http.post("./../api/datausuarios/dameGastoMedioCompraMes", {'id_usuario': vm.idUsuario, 'mes': mes, 'año': anyo});
			response.success(function (data) {
				if(data!="false"){
					vm.ejeOrdenadas[cont-1] = parseFloat((data.gastoPorCompra).toFixed(2));
				}else{
					vm.ejeOrdenadas[cont-1] = 0;
				}

				if(cont>=numMeses) {
					vm.cambiarGraficoLineas2(vm.ejeOrdenadas, vm.ejeAbscisas);
				}
			});
		}
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		//Modifica el grafico de lineas para adaptarlo a los datos recien obtenidos
		vm.cambiarGraficoLineas2 = function(ordenadas, abscisas) {
			var arrayMedia = [];
			for(var i=0; i<numMeses; i++){
				arrayMedia.push(parseInt(vm.datosUsuario.gastoPorCompraMensual.toFixed(2)));
			}
			$timeout(function() {
				$scope.line2 = {
					labels: abscisas,
					series: ['Gasto medio por compra mensual', 'Gasto medio por compra anual'],
					colours: [{
						fillColor: 'rgba(0,0,0,0)', //azul invi
						strokeColor: 'rgb(0, 167, 49)', //media
						highlightFill: 'rgba(0,0,0,0)',
						highlightStroke: 'rgb(0, 167, 49)'
					}, {
						fillColor: 'rgba(15, 182, 238, 0.0)', //azul invi
						strokeColor: 'rgb(204, 225, 13)', //media
						highlightFill: 'rgba(15, 182, 238, 0.0)',
						highlightStroke: 'rgba(15, 182, 238, 0.0)'
					}],
					data: [
						ordenadas,
						arrayMedia
					],
					onClick: function (points, evt) {
						console.log(points, evt);
					}
				};
				vm.estadisticas = 1;
			}, 300);
		}
		//************************************************ FUNCIONES DE CARGADO PESTAÑA 3 ******************************************
		vm.cargarPestanyaProductosValorados = function(){
			vm.cargarProductosValorados();
		}

		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		vm.cargarProductosValorados = function(){
			//Se debe pedir a la tabla DataEmpresa el listado con los n productos mejor valorados
			var response = $http.post("./../api/productos/dameProductosValoracionMedia", {cantidad: 11});
			response.success(function (data) {
				vm.productosVal = data;
				for(var i=0; i<vm.productosVal.length; i++){
					vm.dameNombreProductoVal(i);
				}
			});
		}
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		vm.dameNombreProductoVal = function(indice){
			var fin = false;
			var responseProd = Productos.get({id: vm.productosVal[indice]._id});
			responseProd.$promise.then(function(data){
				vm.productosVal[indice]['name'] = data.name;
				if(indice==vm.productosVal.length-1) {
					vm.cambiarGraficoBarras3();
				}
			});
		}

		//Modifica con los datos calculados el grafico de barras de la pestaña 2
		vm.cambiarGraficoBarras3 = function() {
			var ejeX = [];
			var ejeY = [];
			ejeY[0] = [];

			var aux = vm.productosVal.slice();

			aux = aux.slice(0, numProductos);
			aux.reverse();

			for (var i = 0; i < aux.length; i++) {
				ejeX.push(aux[i].name.substring(0, 25));
				ejeY[0].push(parseInt(aux[i].valMedia));
			}
			document.getElementById('loaderEstad1').classList.remove('bubbles');
			vm.cargadoEstad3 = true;
			$scope.bar2 = {
				labels: ejeX,
				series: ['Productos mejor valorados'],
				data: ejeY,
				colours: [{
					fillColor: 'rgb(0, 167, 49)', //azul invi
					strokeColor: 'rgb(0, 167, 49)', //media
					highlightFill: 'rgba(0,0,0,0)',
					highlightStroke: 'rgb(0, 167, 49)'
				}],
				onClick: function (points, evt) {
					console.log(points, evt);
				}
			};

			vm.estadisticas = 2;
		}

		//************************************************ FUNCIONES DE CARGADO PESTAÑA 4 ******************************************
		vm.cargarMisProductos = function(){
			vm.cargarMisProductosMasComprados();
		}

		vm.cargarMisProductosMasComprados = function(){
			var response = $http.post("./../api/usuarios/dameNProductosMasCompradosPorTipo", {'id_usuario': vm.idUsuario, 'cantidad': numProductos, 'tipo':vm.tipoProd});
			response.success(function (data) {
				vm.misProductos = data;
				vm.filtrarMisProductos();
				for(var i=0; i<vm.misProductos.length; i++){
					vm.dameNombreProducto(i);
				}
			});
		}

		vm.dameNombreProducto = function(indice){
			var fin = false;

			var responseProd = Productos.get({id: vm.misProductos[indice].id_prod});
			responseProd.$promise.then(function(data){
				vm.misProductos[indice]['name'] = data.name;
				if(indice==vm.misProductos.length-1) {
					if(fin==true)
						vm.cambiarGraficoBarras4();
					else
						fin=true;
				}
			});
			vm.empresasCompra = [];
			var responseEmpr = $http.post('./../api/empresas/buscar', {'_id': vm.misProductos[indice].empresa});
			responseEmpr.success(function(data) {
				var inserta = true;
				for(var p=0; p<vm.empresasCompra.length; p++){
					if(vm.empresasCompra[p]._id==data[0]._id){
						inserta=false;
					}
				}
				if(inserta==true){
					vm.empresasCompra.push(data[0]);
					vm.auxEmpresas.push(true);
				}



				vm.misProductos[indice]['nombreEmpresa'] = data[0].name;
				vm.misProductos[indice]['fotoEmpresa'] = data[0].photo;
				if(indice==vm.misProductos.length-1) {
					vm.anyadirEmpresasRestringidas();
					if(fin==true)
						vm.cambiarGraficoBarras4();
					else
						fin=true;
				}
			});
		}

		vm.filtrarMisProductos = function(){
			for(var g=0; g<vm.misProductos.length; g++){
				if(vm.empresasRestringidas.indexOf(vm.misProductos[g].empresa)!=-1){
					vm.misProductos.splice(g, 1);
					g--;
				}
			}
		}

		//Modifica con los datos calculados el grafico de barras de la pestaña 2
		vm.cambiarGraficoBarras4 = function() {

			var ejeX = [];
			var ejeY = [];
			ejeY[0] = [];

			for (var i = vm.misProductos.length-1; i >= 0 ; i--) {
				ejeX.push(vm.misProductos[i].name);
				ejeY[0].push(parseInt(vm.misProductos[i].cantidad));
			}

			//Cambiamos ids de empresa por nombres
			var nombresEmpresa = [];
			var response;
			document.getElementById('loaderEstad1').classList.remove('bubbles');
			vm.cargadoEstad4 = true;

			$scope.bar3 = {
				labels: ejeX,
				series: ['Productos que más has comprado'],
				data: ejeY,
				colours: [{
					fillColor: 'rgb(0, 167, 49))', //azul invi
					strokeColor: 'rgb(0, 167, 49)', //media
					highlightFill: 'rgba(0,0,0,0)',
					highlightStroke: 'rgb(0, 167, 49)'
				}],
				onClick: function (points, evt) {
					console.log(points, evt);
				}
			};

			vm.estadisticas = 3;

		}

		//************************************************ FUNCIONES DE CARGADO PESTAÑA 5 ******************************************
		vm.cargarProductosComunidad = function(){
			vm.cargarProductosMasCompradosComunidad();
		}

		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		vm.cargarProductosMasCompradosComunidad = function(){
			var response = $http.get("./../api/productos");
			response.success(function (data) {
				vm.productosCom = data;
				for(var i=0; i<vm.productosCom.length; i++){
					vm.calcularVecesComprado(i);
					vm.dameNombreProductoCom(i);
				}
			});
		}

		vm.calcularVecesComprado = function(indice){
			var id = vm.productosCom[indice]._id;
			var responseVecesComprado = $http.post("./../api/dataempresas/calculaVecesComprado", {id_producto: id});
			responseVecesComprado.success(function(data){
				vm.productosCom[indice]['vecesComprado'] = parseInt(data);
			});
		}
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		vm.dameNombreProductoCom = function(indice){
			var fin = false;
			var responseProd = Productos.get({id: vm.productosCom[indice]._id});
			responseProd.$promise.then(function(data){
				vm.productosCom[indice]['name'] = data.name;
				if(indice==vm.productosCom.length-1) {
					if(fin==true)
						vm.cambiarGraficoBarras5();
					else
						fin=true;
				}
			});

			var responseEmpr = $http.post('./../api/empresas/buscar', {'_id': vm.productosCom[indice].empresa});
			responseEmpr.success(function(data) {
				vm.productosCom[indice]['nombreEmpresa'] = data[0].name;
				vm.productosCom[indice]['fotoEmpresa'] = data[0].photo;
				if(indice==vm.productosCom.length-1) {
					if(fin==true)
						vm.cambiarGraficoBarras5();
					else
						fin=true;
				}
			});
		}

		//Modifica con los datos calculados el grafico de barras de la pestaña 2
		vm.cambiarGraficoBarras5 = function() {
			vm.productosCom.sort(compareCantTotal);
			var ejeX = [];
			var ejeY = [];
			ejeY[0] = [];

			var aux = vm.productosCom.slice();
			aux = aux.slice(0, numProductos);
			aux.reverse();

			for (var i = 0; i < aux.length ; i++) {
				ejeX.push(aux[i].name);
				ejeY[0].push(parseInt(aux[i].vecesComprado));
			}

			//Cambiamos ids de empresa por nombres
			var nombresEmpresa = [];
			var response;

			$scope.bar4 = {
				labels: ejeX,
				series: ['Productos que más has comprado'],
				data: ejeY,
				colours: ["#00A731"],
				onClick: function (points, evt) {
					console.log(points, evt);
				}
			};

			vm.estadisticas = 4;
		}

		vm.cambiarNumMeses = function(){
			numMeses=vm.numMeses;
			vm.cargarEstadisticas(vm.estadisticas);
		}

		function compareCantTotal(a,b) {
			if (a.vecesComprado > b.vecesComprado)
				return -1;
			else if (a.vecesComprado < b.vecesComprado)
				return 1;
			else
				return 0;
		}
	}]);