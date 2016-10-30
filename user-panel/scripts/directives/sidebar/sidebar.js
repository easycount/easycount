'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */

angular.module('sbAdminApp')
    .directive('sidebar',['$location',function() {
      return {
        templateUrl:'scripts/directives/sidebar/sidebar.html',
        restrict: 'E',
        replace: true,
        scope: {
        },
        controller:function($scope){
          $scope.selectedMenu = 'dashboard';
          $scope.collapseVar = 0;
          $scope.multiCollapseVar = 0;

          $scope.check = function(x){

            if(x==$scope.collapseVar)
              $scope.collapseVar = 0;
            else
              $scope.collapseVar = x;
          };

          $scope.multiCheck = function(y){

            if(y==$scope.multiCollapseVar)
              $scope.multiCollapseVar = 0;
            else
              $scope.multiCollapseVar = y;
          };
        }
      }
    }]);

$(document).ready(function(){

  $.getScript('//cdnjs.cloudflare.com/ajax/libs/select2/3.4.8/select2.min.js',function(){
    $.getScript('//cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.3.0/js/bootstrap-datepicker.min.js',function(){
      $.getScript('//cdnjs.cloudflare.com/ajax/libs/moment.js/2.6.0/moment.min.js',function(){
        $.getScript('//cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/3.0.0/js/bootstrap-datetimepicker.min.js',function(){
          $.getScript('//cdnjs.cloudflare.com/ajax/libs/jasny-bootstrap/3.1.3/js/jasny-bootstrap.min.js',function(){

            $("#mySel").select2({
              closeOnSelect:false
            });

            $("#mySel2").select2({
              closeOnSelect:false
            });
            var nombreUsuario = document.getElementById("hiddenName").value;
            if(document.getElementById('nombreSidebar')!=null) {
              document.getElementById('nombreSidebar').innerHTML = nombreUsuario;
            }
            if(document.getElementById("hiddenPhoto")!=null) {
              var fotoUsuario = document.getElementById("hiddenPhoto").value;
              if(document.getElementById('fotoSidebar')!=null)
                if(fotoUsuario.indexOf("http")==-1)
                  document.getElementById('fotoSidebar').innerHTML = '<img  src="../images/profile/' + fotoUsuario + '">';
                else{
                  document.getElementById('fotoSidebar').innerHTML = '<img  src="'+ fotoUsuario + '">';
                }
            }else{
              if(document.getElementById('fotoSidebar')!=null)
                document.getElementById('fotoSidebar').innerHTML = '<img  src="../images/profile/user.png>';
            }

          });//script
        });//script
      });//script
    });//script
  });//script

});


