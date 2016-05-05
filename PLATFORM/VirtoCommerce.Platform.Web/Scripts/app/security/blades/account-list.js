angular.module('platformWebApp')
.controller('platformWebApp.accountListController', ['$scope', 'platformWebApp.accounts', 'platformWebApp.dialogService', 'platformWebApp.uiGridHelper', 'platformWebApp.bladeNavigationService', 'platformWebApp.bladeUtils',
function ($scope, accounts, dialogService, uiGridHelper, bladeNavigationService, bladeUtils) {
    $scope.uiGridConstants = uiGridHelper.uiGridConstants;
    var blade = $scope.blade;

    blade.refresh = function () {
        blade.isLoading = true;
        $scope.pageSettings.currentPage = $scope.pageSettings.loadingNextPage ? $scope.pageSettings.currentPage : 1;
        accounts.search({
            keyword: filter.keyword,
            sort: uiGridHelper.getSortExpression($scope),
            skipCount: ($scope.pageSettings.currentPage - ($scope.pageSettings.loadingNextPage ? 0 : 1)) * $scope.pageSettings.itemsPerPageCount,
            takeCount: $scope.pageSettings.itemsPerPageCount + 1
        }, function (data) {
            blade.currentEntities = blade.currentEntities || [];
            uiGridHelper.setGridData($scope, blade.currentEntities, data.users);
            blade.isLoading = false;
        }, function (error) {
            $scope.gridApi.infiniteScroll.dataLoaded();
            bladeNavigationService.setError('Error ' + error.status, blade);
        });
    };

    blade.selectNode = function (node) {
        $scope.selectedNodeId = node.userName;

        var newBlade = {
            id: 'listItemChild',
            data: node,
            title: node.userName,
            subtitle: blade.subtitle,
            controller: 'platformWebApp.accountDetailController',
            template: '$(Platform)/Scripts/app/security/blades/account-detail.tpl.html'
        };

        bladeNavigationService.showBlade(newBlade, blade);
    };

    $scope.delete = function (data) {
        deleteList([data]);
    };

    function deleteList(selection) {
        var dialog = {
            id: "confirmDeleteItem",
            title: "platform.dialogs.account-delete.title",
            message: "platform.dialogs.account-delete.message",
            callback: function (remove) {
                if (remove) {
                    bladeNavigationService.closeChildrenBlades(blade, function () {
                        var itemIds = _.pluck(selection, 'userName');
                        accounts.remove({ names: itemIds }, function (data, headers) {
                            blade.refresh();
                        }, function (error) {
                            bladeNavigationService.setError('Error ' + error.status, blade);
                        });
                    });
                }
            }
        };
        dialogService.showConfirmationDialog(dialog);
    }

    blade.headIcon = 'fa-key';

    blade.toolbarCommands = [
        {
            name: "platform.commands.refresh", icon: 'fa fa-refresh',
            executeMethod: blade.refresh,
            canExecuteMethod: function () {
                return true;
            }
        },
        {
            name: "platform.commands.add", icon: 'fa fa-plus',
            executeMethod: function () {
                bladeNavigationService.closeChildrenBlades(blade, function () {
                    var newBlade = {
                        id: 'listItemChild',
                        currentEntity: { roles: [], userType: 'Manager' },
                        title: 'platform.blades.account-detail.title-new',
                        subtitle: blade.subtitle,
                        controller: 'platformWebApp.newAccountWizardController',
                        template: '$(Platform)/Scripts/app/security/wizards/newAccount/new-account-wizard.tpl.html'
                    };
                    bladeNavigationService.showBlade(newBlade, blade);
                });
            },
            canExecuteMethod: function () {
                return true;
            },
            permission: 'platform:security:create'
        },
        {
            name: "platform.commands.delete", icon: 'fa fa-trash-o',
            executeMethod: function () { deleteList($scope.gridApi.selection.getSelectedRows()); },
            canExecuteMethod: function () {
                return $scope.gridApi && _.any($scope.gridApi.selection.getSelectedRows());
            },
            permission: 'platform:security:delete'
        }
    ];


    var filter = $scope.filter = {};
    filter.criteriaChanged = function () {
        blade.refresh();
    };

    // ui-grid
    $scope.setGridOptions = function (gridOptions) {
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