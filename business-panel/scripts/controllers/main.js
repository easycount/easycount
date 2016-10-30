'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .service('fileUpload', ['$http', function ($http) {
      this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('avatarsignup', file);
        $http.post(uploadUrl, fd, {
              transformRequest: angular.identity,
              headers: {'Content-Type': undefined}
            })
            .success(function(){
            })
            .error(function(){
            });
      }
    }])

    .directive('fileModel', ['$parse', function ($parse) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;

          element.bind('change', function(){
            scope.$apply(function(){
              modelSetter(scope, element[0].files[0]);
            });
          });
        }
      };
    }])

    .controller('MainCtrl',['Usuarios', 'Productos', '$http', 'fileUpload', '$cookies', function (Usuarios, Productos, $http, fileUpload, $cookies){

      var vm = this;
      vm.usuario;
      vm.fotoSocial = false;
      vm.mostrarCampo = [true, true, true, true, true, true, true, true];
      vm.vegetariano = "";
      vm.productosOpinados = [];
      vm.productosValorados = [];

      vm.numProductosComprados = 0;
      vm.numProductosOpinados = 0;
      vm.numProductosValorados = 0;

      //Con esto recuperamos el nombre y la id del usuario de la sesión y la almacenamos en el controlador
      if(document.getElementById("hiddenName")!=null) {
        vm.nombreUsuario = document.getElementById("hiddenName").value;
        vm.idUsuario = document.getElementById("hiddenId").value;
        vm.emailUsuario = document.getElementById("hiddenEmail").value;
        vm.fotoUsuario = document.getElementById("hiddenPhoto").value;
      }

      vm.inicializarUsuario = function(){
        vm.idUsuario = document.getElementById("hiddenId").value;
        //recoge los datos del producto por su id
        var response;

        response = Usuarios.get({id: vm.idUsuario});
        response.$promise
            .then(function(data)//si sale bien
            {
              vm.usuario = data;

              //////////////Inicializamos la imagen del usuario si estamos en la página de perfil
              if(window.location.href.indexOf("perfil")!=-1) {
                //if(vm.usuario.photo=="web") {
                if (vm.usuario.photo!=null && vm.usuario.photo.indexOf("http://") == -1 && vm.usuario.photo.indexOf("https://") == -1) {
                  if (vm.usuario.photo == "")
                    vm.usuario.photo = "http://www.myfirmsapp.co.uk/wp-content/uploads/2014/02/icon-person-circle2-320x320.png";
                  else
                    vm.usuario.photo = "../images/profile/" + vm.usuario.photo + "?" + new Date().getTime();
                } else
                  vm.fotoSocial = true;

                if (vm.usuario.f_nacimiento)
                  vm.usuario.f_nacimiento = vm.formatearFecha(vm.usuario.f_nacimiento);

                vm.genero = vm.usuario.genero;


                var rest = vm.usuario.restricciones;

                if (rest.indexOf("vegetariano") != -1)
                  vm.vegetariano = true;

                if (rest.indexOf("celiaco") != -1)
                  vm.celiaco = true;

                if (rest.indexOf("diabetico") != -1)
                  vm.diabetico = true;

                if (rest.indexOf("lactosa") != -1)
                  vm.lactosa = true;

                if (rest.indexOf("frutos") != -1)
                  vm.frutos = true;

                vm.nuevonombre = vm.usuario.name;
                vm.nuevoemail = vm.usuario.email;
                vm.nuevon_personas = vm.usuario.n_personas;
                vm.nuevaFechaNac = vm.usuario.f_nacimiento;
              }
              vm.inicializarContenido();
            },function(reason) //En caso de fallo
            {
              console.log("Error al recoger producto: "+reason);
            });
      }
      vm.formatearFecha = function(fecha){
        var date = new Date(fecha);
        var string = "";
        string += date.getDate().toLocaleString()+"/"+(date.getMonth()+1).toLocaleString()+"/"+date.getFullYear();
        return string;
      }

      vm.cambiarCampo = function(campo){
        if(vm.mostrarCampo[campo]==false)
          vm.mostrarCampo[campo]=true;
        else
          vm.mostrarCampo[campo]=false;
      }

      vm.inicializarUsuario();

      ///////////////////////////////////////////////////// FUNCIONES DE EDICIÓN DE USUARIO /////////////////////////////////////////////////////
      vm.modificarNombreUsu = function(){
        if(vm.nuevonombre  && vm.nuevonombre!=""){
          var url = "./../api/usuarios/" + vm.usuario._id;
          var response = $http.put(url, {'name': vm.nuevonombre});
          response.success(function (data) {
            swal("¡Hecho!", "Tu nombre ha sido modificado", "success");
            vm.inicializarUsuario();
          })
        }else{
          swal("Error", "No has escrito tu nuevo nombre", "warning");
        }
      }

      vm.modificarEmail = function(){
        var url = "./../api/usuarios/"+vm.usuario._id;
        if(vm.nuevoemail && vm.nuevoemail!="") {
          var response = $http.put(url, {'email': vm.nuevoemail});
          response.success(function (data) {
            swal("¡Hecho!", "Tu email ha sido modificado", "success");
            vm.inicializarUsuario();
          })
        }else{
          swal("Error", "El email indicado no es correcto", "warning");
        }
      }

      vm.modificarPassword = function(){
        if(vm.oldPassword){
          var url = "./../api/usuarios/checkLogin";
          var response = $http.post(url, {'email': vm.usuario.email, 'password': vm.oldPassword});
          response.success(function (data) {
            if(data == "true"){
              if(vm.newPassword && vm.newPassword != "" && vm.newPasswordConfirm && vm.newPasswordConfirm != "" && vm.newPassword == vm.newPasswordConfirm) {
                url = "./../api/usuarios/" + vm.usuario._id;
                response = $http.put(url, {'password': vm.newPassword});
                response.success(function (data) {
                  swal("¡Hecho!", "Contraseña actualizada", "success");
                })
              }else{
                swal("Error", "Las nuevas contraseñas no coinciden", "warning");
              }
            }else{
              swal("Error", "No has escrito correctamente tu contraseña actual", "warning");
            }
          })
        }else{
          swal("Error", "Debes escribir tu contraseña actual", "warning");
        }
      }

      vm.subirImagen = function(){
        if(document.getElementById("avatarsignup")!=null && document.getElementById("avatarsignup").value !="") {
          //Envio del archivo por post
          var file = vm.myFile;
          var uploadUrl = '/upload/' + vm.usuario.email;
          fileUpload.uploadFileToUrl(file, uploadUrl);
          swal("¡Hecho!", "Imagen actualizada", "success");
          vm.modificarRutaAvatar();
        }else{
          swal("Error", "No se ha seleccionado imagen", "warning");
        }
      }

      //Necesario para modificar ruta de los avatares de RRSS
      vm.modificarRutaAvatar = function(){
        var url = "./../api/usuarios/"+vm.usuario._id;
        var nuevaRuta = vm.usuario.email+".jpg"

        var response = $http.put(url, {'photo': nuevaRuta});
        response.success(function (data) {
          vm.inicializarUsuario();
        })
      }

      vm.modificarFechaNacimiento = function(){
        var nuevaFechaUsu;
        if(vm.validarFecha(vm.nuevaFechaNac)){
          nuevaFechaUsu = new Date(vm.nuevaFechaNac);
          var url = "./../api/usuarios/"+vm.usuario._id;

          var response = $http.put(url, {'f_nacimiento': nuevaFechaUsu});
          response.success(function (data) {
            swal("¡Hecho!", "Fecha de nacimiento actualizada", "success");
            vm.inicializarUsuario();
          })
        }else{
          swal("Error", "La fecha de nacimiento introducida no es válida", "error");
        }
      }


      vm.validarFecha = function(f){
        var fecha = new Date(f);

        if(fecha.toString().indexOf('Invalid')==-1)
          return true;
        else
          return false;
      }

      vm.modificarGenero = function(){
        var url = "./../api/usuarios/"+vm.usuario._id;

        if(vm.genero && vm.genero!="") {
          if(vm.genero!=vm.usuario.genero) {
            var response = $http.put(url, {'genero': vm.genero});
            response.success(function (data) {
              swal("¡Hecho!", "Tu género ha sido modificado", "success");
              vm.inicializarUsuario();
            })
          }
        }else{
          swal("Error", "El numero indicado no es correcto", "warning");
        }
      }

      vm.modificarRestricciones = function(){
        var url = "./../api/usuarios/"+vm.usuario._id;
        var rest = [];

        if(vm.vegetariano==true)
          rest.push("vegetariano");

        if(vm.celiaco==true)
          rest.push("celiaco");

        if(vm.lactosa==true)
          rest.push("lactosa");

        if(vm.diabetico==true)
          rest.push("diabetico");

        if(vm.frutos==true)
          rest.push("frutos");

        var response = $http.put(url, {'restricciones': rest});
        response.success(function (data) {
          swal("¡Hecho!", "Tus restricciones han sido modificadas con éxito", "success");
          vm.inicializarUsuario();
        })
      }

      vm.modificarPersonas = function(){
        var url = "./../api/usuarios/"+vm.usuario._id;

        if(vm.nuevon_personas && vm.nuevon_personas!="" && typeof(vm.nuevon_personas)=="number") {
          var response = $http.put(url, {'n_personas': vm.nuevon_personas});
          response.success(function (data) {
            swal("¡Hecho!", "El número de personas para las que compras ha sido modificado", "success");
            vm.inicializarUsuario();
          })
        }else{
          swal("Error", "El numero indicado no es correcto", "warning");
        }
      }

      vm.irA = function(valor){
        switch(valor){
          case 1: window.location = "/user-panel/index#/dashboard/chart";
            break;
          case 2: window.location = "/user-panel/index#/dashboard/valoraciones";
            break;
          case 3: window.location = "/user-panel/index#/dashboard/valoracionesRealizadas/"+vm.usuario._id;
            break;
          case 4: window.location = "/user-panel/index#/dashboard/opinionesRealizadas/"+vm.usuario._id;
            break;
        }
      }

      vm.inicializarContenido = function(){
        vm.calculaGastoAcumulado();
        vm.calculaProductosComprados();
        vm.calculaProductos();
      }

      vm.calculaGastoAcumulado = function(){
        vm.gastoAcumulado = 0;

        var fechaActual = new Date();

        var response = $http.post("./../api/tickets/dameImporteAcumuladoMesUsuario", {'id_usuario': vm.idUsuario, 'mes': fechaActual.getMonth(), 'anyo':fechaActual.getFullYear()});
        response.success(function (data) {
          vm.gastoAcumulado = data;
        })


      }

      vm.calculaProductosComprados = function(){
        vm.numProductosComprados = vm.usuario.productos.length;
      }

      vm.calculaProductos = function(){
        var responseProd = Productos.query();
        responseProd.$promise.then(
            function(data){
              for(var i=0; i<data.length; i++){
                vm.calculaValProducto(data[i]);
                vm.calculaOpiProducto(data[i]);
              }
              vm.numProductosOpinados = vm.productosOpinados.length;
              vm.numProductosValorados = vm.productosValorados.length;
            }
        );
      }

      vm.calculaValProducto = function(prod1){
        var opiniones = prod1.opiniones;
        for(var j=0; j<opiniones.length; j++){
          if(opiniones[j]!=null && opiniones[j].user==vm.usuario._id) {
            vm.productosOpinados.push(opiniones[j]);
          }
        }
      }

      vm.calculaOpiProducto = function(prod2){
        var valoraciones = prod2.valoraciones;
        for(var j=0; j<valoraciones.length; j++){
          if(valoraciones[j].user==vm.usuario._id)
            vm.productosValorados.push(valoraciones[j]);
        }
      }
    }]);
