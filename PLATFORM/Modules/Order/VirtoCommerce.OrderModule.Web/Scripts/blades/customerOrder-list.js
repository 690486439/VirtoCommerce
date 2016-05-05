angular.module('virtoCommerce.orderModule')
.controller('virtoCommerce.orderModule.customerOrderListController', ['$scope', 'virtoCommerce.orderModule.order_res_customerOrders', 'platformWebApp.bladeUtils', 'platformWebApp.dialogService', 'platformWebApp.authService', 'uiGridConstants', 'platformWebApp.uiGridHelper', 'dateFilter',
function ($scope, order_res_customerOrders, bladeUtils, dialogService, authService, uiGridConstants, uiGridHelper, dateFilter) {
    var blade = $scope.blade;
    var bladeNavigationService = bladeUtils.bladeNavigationService;
    $scope.uiGridConstants = uiGridConstants;

    blade.refresh = function () {
        blade.isLoading = true;
        $scope.pageSettings.currentPage = $scope.pageSettings.loadingNextPage ? $scope.pageSettings.currentPage : 1;
        var criteria = {
            keyword: filter.keyword,
            sort: uiGridHelper.getSortExpression($scope),
            start: ($scope.pageSettings.currentPage - ($scope.pageSettings.loadingNextPage ? 0 : 1)) * $scope.pageSettings.itemsPerPageCount,
            count: $scope.pageSettings.itemsPerPageCount + 1
        };
        order_res_customerOrders.search(criteria, function (data) {
            $scope.objects = $scope.objects || [];
            uiGridHelper.setGridData($scope, $scope.objects, data.customerOrders);
            blade.isLoading = false;
        },
	   function (error) {
	       $scope.gridApi.infiniteScroll.dataLoaded();
	       bladeNavigationService.setError('Error ' + error.status, blade);
	   });
    };

    $scope.selectNode = function (node) {
        $scope.selectedNodeId = node.id;
        var newBlade = {
            id: 'orderDetail',
            title: 'orders.blades.customerOrder-detail.title',
            titleValues: { customer: node.customerName },
            subtitle: 'orders.blades.customerOrder-detail.subtitle',
            customerOrder: node,
            controller: 'virtoCommerce.orderModule.operationDetailController',
            template: 'Modules/$(VirtoCommerce.Orders)/Scripts/blades/customerOrder-detail.tpl.html'
        };

        bladeNavigationService.showBlade(newBlade, blade);
    };

    $scope.deleteList = function (list) {
        var dialog = {
            id: "confirmDeleteItem",
            title: "orders.dialogs.orders-delete.title",
            message: "orders.dialogs.orders-delete.message",
            callback: function (remove) {
                if (remove) {
                    closeChildrenBlades();

                    var itemIds = _.pluck(list, 'id');
                    order_res_customerOrders.remove({ ids: itemIds }, function (data, headers) {
                        blade.refresh();
                    },
                    function (error) {
                        bladeNavigationService.setError('Error ' + error.status, blade);
                    });
                }
            }
        }
        dialogService.showConfirmationDialog(dialog);
    }

    function closeChildrenBlades() {
        angular.forEach(blade.childrenBlades.slice(), function (child) {
            bladeNavigationService.closeBlade(child);
        });
    }

    blade.headIcon = 'fa-file-text';

    blade.toolbarCommands = [
    {
        name: "platform.commands.refresh", icon: 'fa fa-refresh',
        executeMethod: blade.refresh,
        canExecuteMethod: function () {
            return true;
        }
    },
                  {
                      name: "platform.commands.delete", icon: 'fa fa-trash-o',
                      executeMethod: function () {
                          $scope.deleteList($scope.gridApi.selection.getSelectedRows());
                      },
                      canExecuteMethod: function () {
                          return $scope.gridApi && _.any($scope.gridApi.selection.getSelectedRows());
                      },
                      permission: 'order:delete'
                  }
    ];

    var filter = $scope.filter = {};
    filter.criteriaChanged = function () {
        blade.refresh();
    };

    // ui-grid
    $scope.setGridOptions = function (gridOptions) {
        var createdDateColumn = _.findWhere(gridOptions.columnDefs, { name: 'createdDate' });
        if (createdDateColumn) { // custom tooltip
            createdDateColumn.cellTooltip = function (row, col) { return dateFilter(row.entity.createdDate, 'medium'); }
        }
        uiGridHelper.initialize($scope, gridOptions, function (gridApi) {
            gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
                $scope.pageSettings.loadingNextPage = true;
                blade.refresh();
            });
            uiGridHelper.bindRefreshOnSortChanged($scope);
        });

        bladeUtils.initializePaginationAndRefresh($scope);
    };


    // actions on load
    // blade.refresh() is called in bladeUtils.initializePaginationAndRefresh()
}]);