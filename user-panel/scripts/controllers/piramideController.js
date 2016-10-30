
angular.module('sbAdminApp')

    .controller('piramideCtrl', ['$stateParams', 'Usuarios','Listas', '$http', function ($stateParams, Usuarios,Listas, $http)
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

    }]);