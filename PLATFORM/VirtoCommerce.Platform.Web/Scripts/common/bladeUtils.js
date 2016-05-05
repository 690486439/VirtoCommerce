angular.module('platformWebApp')
 .factory('platformWebApp.bladeUtils', ['platformWebApp.bladeNavigationService', function (bladeNavigationService) {
     function initializePagination($scope, skipDefaultWatch) {
         //pagination settings
         $scope.pageSettings = {
             totalItems: 0,
             currentPage: 1,
             numPages: 5,
             itemsPerPageCount: 20
         };

         if (!skipDefaultWatch)
             $scope.$watch('pageSettings.currentPage', $scope.blade.refresh);
     }

     function initializePaginationAndRefresh($scope) {
         $scope.pageSettings = {
             currentPage: 1,
             itemsPerPageCount: 20
         };

         $scope.blade.refresh();
     }

     return {
         bladeNavigationService: bladeNavigationService,
         initializePagination: initializePagination,
         initializePaginationAndRefresh: initializePaginationAndRefresh
     };
 }]);
