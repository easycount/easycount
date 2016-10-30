/**
 * Created by Enrique 2 on 11/11/2015.
 */
angular.module("corporativeApp", ['ngResource', 'ngRoute'])

    .factory('Usuarios', ['$resource', function($resource) {
        return $resource('/api/usuarios/:id', null, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: true}
        });
    }])

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

    .controller('corporativeAppCtrl', ['$scope', '$route', 'Usuarios', '$http', 'fileUpload', function ($scope, $route, Usuarios, $http, fileUpload) {
        var vm = this;
        vm.variable = '#toregister';
        vm.isPushedDown = false;

        //Recogemos el contenido de la sesión de usuario
        vm.nombreUsuario = "";
        vm.idUsuario = "";
        vm.useremail = "";

        if(document.getElementById("nombreInput")!=null) {
            vm.nombreUsuario = document.getElementById("hiddenName").value;
            vm.idUsuario = document.getElementById("hiddenId").value;
        }
        var usuarios = [];
        var response = Usuarios.query();    // GET
        response.$promise.then(function(data){
            for(var i=0;i<data.length;i++){
                usuarios[i] = data[i];
            }
        });
        vm.quienesPage = function(){
            window.location = "quienessomos";
        }
        vm.contactoPage = function(){
            window.location = "contacto";
        }
        vm.loginPage = function(){
            window.location = "login";
        }

        vm.descargaManual = function(){
            window.location = "manual";
        }

        vm.userLogin = function(){

            if(vm.checkEmail()){
                if( vm.getPass(vm.useremail) == vm.userpass ){
                    vm.showName(vm.useremail);
                    if(vm.keeplogin){
                        console.log("No cerrar sesión en true");
                    }
                    vm.userRole = vm.getRole(vm.useremail);
                    if(vm.userRole == "admin")
                        window.location = "admin-panel/index";
                    else if(vm.userRole == "business")
                        window.location = "business-panel/index";
                    else
                        window.location = "user-panel/index";
                }else{
                    alert("Contraseña incorrecta");
                }
            }else{
                alert("Email no registrado, compruebe sus datos o regístrese");
            }
        }

        vm.userRegistration = function(){
            if(vm.userpass1 == vm.userpass2){
                if(!vm.checkEmail()){
                    vm.registerUser();
                }else{
                    alert("Email ya registrado en nuestra base de datos");
                }
            }else{
                alert("Las contraseñas no coinciden");
            }
        }

        vm.checkEmail = function(){
            for(var i=0;i<usuarios.length;i++){
                if(usuarios[i].email == vm.useremail){
                    return true;
                }
            }
            return false;
        }

        vm.registerUser = function(){
            var nuevoRegistro = new Usuarios ({name: vm.username, email: vm.useremail, password: vm.userpass1});
            nuevoRegistro.$save(function(){
                document.getElementById("bsignup").disabled = true;
                return true;
            });
        }
        vm.showName = function(email){
            for(var i=0;i<usuarios.length;i++){
                if(usuarios[i].email == email){
                    alert("Bienvenido, "+ usuarios[i].name);
                }
            }
            return false;
        }

        vm.getPass = function(email){
            for(var i=0;i<usuarios.length;i++){
                if(usuarios[i].email == email){
                    return usuarios[i].password;
                }
            }
            return false;
        }
        vm.pushDown = function(){
            if(!vm.isPushedDown){
                vm.bodyClass = "body-pushed-down";
                vm.isPushedDown = true;
            }
            else{
                vm.bodyClass = '';
                vm.isPushedDown = false;
            }
        }
        vm.getRole = function(email){
            for(var i=0;i<usuarios.length;i++){
                if(usuarios[i].email == email){
                    return usuarios[i].role;
                }
            }
        }

        vm.irAPanel = function(){
            window.location.href = '/user-panel/index';
        }

        vm.actualizarMail = function(id){

            var restr = [];

            if(vm.vegetarianoTwitter==true)
                restr.push('vegetariano');

            if(vm.celiacoTwitter==true)
                restr.push('celiaco');

            if(vm.lactosaTwitter==true)
                restr.push('lactosa');

            if(vm.diabeticoTwitter==true)
                restr.push('diabetico');

            if(vm.frutosTwitter==true)
                restr.push('frutos');

            if(vm.emailTwitter) {
                Usuarios.update({id: id}, {
                    "email": vm.emailTwitter,
                    "restricciones": restr,
                    "f_nacimiento": vm.fechaTwitter,
                    "n_personas": vm.personasTwitter,
                    "genero": vm.sexoTwitter
                }, function (post, err) {
                    vm.irAPanel();
                });
            }else{
                var responseAct = Usuarios.update({id: id}, {
                    "restricciones": restr,
                    "f_nacimiento": vm.fechaTwitter,
                    "n_personas": vm.personasTwitter,
                    "genero": vm.sexoTwitter
                });

                responseAct.$promise.then(function(data) {
                    vm.irAPanel();
                });
            }
        }




        vm.enviarForms = function() {
            if(document.getElementById("avatarsignup")!=null) {
                //Envio del archivo por post
                var file = vm.myFile;
                var uploadUrl = '/upload/' + vm.useremail;
                fileUpload.uploadFileToUrl(file, uploadUrl);
            }
            document.getElementById("formRegistro").submit();

        }

    }]);


