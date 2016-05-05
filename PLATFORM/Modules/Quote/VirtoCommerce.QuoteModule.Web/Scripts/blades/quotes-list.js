angular.module('virtoCommerce.quoteModule')
.controller('virtoCommerce.quoteModule.quotesListController', ['$scope', 'virtoCommerce.quoteModule.quotes', 'platformWebApp.dialogService', 'platformWebApp.uiGridHelper', 'platformWebApp.bladeUtils',
    function ($scope, quotes, dialogService, uiGridHelper, bladeUtils) {
        $scope.uiGridConstants = uiGridHelper.uiGridConstants;
        var blade = $scope.blade;
        var bladeNavigationService = bladeUtils.bladeNavigationService;

        blade.refresh = function () {
            blade.isLoading = true;
            $scope.pageSettings.currentPage = $scope.pageSettings.loadingNextPage ? $scope.pageSettings.currentPage : 1;
            quotes.search({
                keyword: filter.keyword,
                sort: uiGridHelper.getSortExpression($scope),
                start: ($scope.pageSettings.currentPage - ($scope.pageSettings.loadingNextPage ? 0 : 1)) * $scope.pageSettings.itemsPerPageCount,
                count: $scope.pageSettings.itemsPerPageCount + 1
            }, function (data) {
                blade.currentEntities = blade.currentEntities || [];
                uiGridHelper.setGridData($scope, blade.currentEntities, data.quoteRequests);
                blade.isLoading = false;
            }, function (error) {
                $scope.gridApi.infiniteScroll.dataLoaded();
                bladeNavigationService.setError('Error ' + error.status, blade);
            });
        }

        $scope.selectNode = function (node) {
            $scope.selectedNodeId = node.id;

            var newBlade = {
                id: 'quoteDetails',
                currentEntityId: node.id,
                title: node.number,
                subtitle: 'quotes.blades.quote-detail.subtitle',
                controller: 'virtoCommerce.quoteModule.quoteDetailController',
                template: 'Modules/$(VirtoCommerce.Quote)/Scripts/blades/quote-detail.tpl.html'
            };

            bladeNavigationService.showBlade(newBlade, blade);
        };

        $scope.deleteList = function (list) {
            var dialog = {
                id: "confirmDeleteItem",
                title: "quotes.dialogs.quote-requests-delete.title",
                message: "quotes.dialogs.quote-requests-delete.message",
                callback: function (remove) {
                    if (remove) {
                        bladeNavigationService.closeChildrenBlades(blade, function () {
                            var itemIds = _.pluck(list, 'id');
                            quotes.remove({ ids: itemIds },
                                blade.refresh,
                                function (error) { bladeNavigationService.setError('Error ' + error.status, blade); }
                                );
                        });
                    }
                }
            }
            dialogService.showConfirmationDialog(dialog);
        }

        blade.headIcon = 'fa-file-text-o';

        blade.toolbarCommands = [
            {
                name: "platform.commands.refresh", icon: 'fa fa-refresh',
                executeMethod: blade.refresh,
                canExecuteMethod: function () {
                    return true;
                }
            },
            //{
            //    name: "Add", icon: 'fa fa-plus',
            //    executeMethod: function () {
            //        openBladeNew();
            //    },
            //    canExecuteMethod: function () {
            //        return true;
            //    },
            //    permission: 'quote:create'
            //}
            {
                name: "platform.commands.delete", icon: 'fa fa-trash-o',
                executeMethod: function () {
                    $scope.deleteList($scope.gridApi.selection.getSelectedRows());
                },
                canExecuteMethod: function () {
                    return $scope.gridApi && _.any($scope.gridApi.selection.getSelectedRows());
                },
                permission: 'quote:delete'
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


        // blade.refresh() is called in bladeUtils.initializePaginationAndRefresh()
    }]);
