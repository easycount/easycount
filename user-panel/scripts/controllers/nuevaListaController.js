/**
 * Created by Miguel on 09/02/2016.
 *
 * Controlador que permite crear una nueva lista
 */

angular.module('sbAdminApp')

    .controller('nuevaListaCtrl', ['$stateParams', 'Usuarios','Listas', '$http', function ($stateParams, Usuarios,Listas, $http)
    {
        var vm = this;
        var usuario = Usuarios.get({id : document.getElementById("hiddenId").value});
        var idusu;
        vm.deshabilitado = false;

        usuario.$promise
            .then(function(data) {
                idusu = data._id;
            },function(reason){
                console.log("Problema cogiendo el nombre del usuario"+reason);
            });
        vm.nombre = "";
        vm.descripcion = "";

        vm.error ="";

        vm.crearLista = function()
        {
            if(vm.nombre=="" || vm.descripcion == "")
            {
                vm.error="Por favor rellene todos los campos antes de continuar";
            }
            else
            {
                vm.nuevaLista();
            }
        }

        vm.nuevaLista = function(){
            vm.deshabilitado = true;
            var nuevaLista = new Listas ({name: vm.nombre, description: vm.descripcion, productos: [], importe: 0,
                predefinida: false, usuario: idusu});
            nuevaLista.$save(function(data){
                vm.avisoListaCorrecta('Event');
            }, function(err){
                vm.avisoListaIncorrecta('Event');
            });
        }

        //METODO OBSOLETO
        /*vm.asignarListaUsuario = function(lista_id){
         var response;
         response = Usuarios.update(
         {id: idusu},
         {listas: lista_id}
         );
         response.$promise
         .then(function (data) { //Si la operacion sale bien
         vm.avisoListaCorrecta('Event');
         }, function (reason) { //Si va mal
         vm.avisoListaIncorrecta('Event');
         });
         }*/

        vm.avisoListaCorrecta = function(ev){
            swal(
                {
                    type: "success",
                    title: "¡La lista "+ vm.nombre +" ha sido añadida correctamente!",
                    text: "Pulsa el botón para acceder a tus listas",
                    confirmButtonText: "Ir a listas",
                    animation: "slide-from-top"
                },
                function()
                {
                    window.location = "/user-panel/index#/dashboard/listas";
                }
            );
        }

        vm.avisoListaIncorrecta = function(ev){
            swal(
                {
                    type: "error",
                    title: "¡Ha habido un error!",
                    text: "La lista"+ vm.nombre +" no se ha añadido. Vuelve a intentarlo más tarde.",
                    confirmButtonText: "Aceptar",
                    animation: "slide-from-top"
                },
                function()
                {
                    vm.deshabilitado = false;
                }
            );
        }

    }]);