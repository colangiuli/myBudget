(function() {
        "use strict";
        angular.module("app.page.budget.ctrls", [])
        .controller("budgetCtrl", ["$scope", "$filter","Categories","$modal","$localstorage", "dialogs","logger",function($scope, $filter,Categories,$modal,$localstorage, dialogs, logger) {
            var init;

            Categories.getFull().success(function(data){
			      $scope.budgets=data.result?data.result:[];
			      return $scope.search(), $scope.select($scope.currentPage);
			});
           
            $scope.searchKeywords = "";
            $scope.filteredbudgets = [];
            $scope.row = "";
            $scope.select = function(page) {
                var end, start;
                start = (page - 1) * $scope.numPerPage;
                end = start + $scope.numPerPage; 
                $scope.currentPagebudgets = $scope.filteredbudgets.slice(start, end);
            };
            $scope.onFilterChange = function() {
                return $scope.select(1),
                $scope.currentPage = 1, 
                $scope.row = ""
            };
            $scope.onNumPerPageChange = function() {
                return $scope.select(1), 
                $scope.currentPage = 1
            };
            $scope.onOrderChange = function() {
                return $scope.select(1), $scope.currentPage = 1
            }; 
            $scope.search = function() {
                return $scope.filteredbudgets = $filter("filter")($scope.budgets, $scope.searchKeywords), 
                $scope.onFilterChange()
            }; 
            $scope.order = function(rowName) {
                return $scope.row !== rowName ? ($scope.row = rowName, $scope.filteredbudgets = $filter("orderBy")($scope.budgets, rowName), $scope.onOrderChange()) : void 0
            }; 
            $scope.numPerPageOpt = [3, 5, 10, 20]; 
            $scope.numPerPage = $scope.numPerPageOpt[2];
            $scope.currentPage = 1;
            $scope.currentPagebudgets = [];


            $scope.editBudget = function(budget){
                $scope.budget = budget;
                $scope.budgetPos = $scope.budgets.indexOf(budget);
                var modalInstance;
                $scope.editBudgetModalInstance = $modal.open({
                    templateUrl: "editBudget.html",
                   // controller: "ModalInstanceCtrl",
                   scope: $scope
                })
            }
            $scope.newBudget = function(){
                $scope.budget = {};
                $scope.budget.owner = {
					"__type": "Pointer",
					"className":"_User",
					"objectId": $localstorage.get('objectId')
				};
                //var modalInstance;
                $scope.editBudgetModalInstance = $modal.open({
                    templateUrl: "editBudget.html",
                   // controller: "ModalInstanceCtrl",
                   scope: $scope
                })  
            }

            $scope.saveBudget = function(budget){
				$scope.budget.ACL = {};
                $scope.budget.shared = $scope.budget.shared?$scope.budget.shared:false;
				$scope.budget.ACL[$localstorage.get('objectId')] = { "read": true, "write": true};
				if ($scope.budget.shared == true){
					$scope.budget.ACL["role:friendsOf_" + $localstorage.get('objectId')] = { "read": true};
				}
				if(!!$scope.budget.objectId){
					Categories.edit($scope.budget.objectId, $scope.budget).success(function(data){	
						$scope.budgets[$scope.budgetPos] = $scope.budget;
						$scope.search();
						$scope.select($scope.currentPage);
						$scope.editBudgetModalInstance.close();
						//$scope.budget.objectId = data.objectId;
						//$scope.budgets.push($scope.budget);
					    //$scope.closeExpenseModalPage();
					    //$scope.expenseModified = ($scope.expenseModified == 0)?1:0;
					});
				}else{
					Categories.create($scope.budget).success(function(data){
						$scope.budget.objectId = data.objectId;
						$scope.budgets.push($scope.budget);
						$scope.search();
						$scope.select($scope.currentPage);
						$scope.editBudgetModalInstance.close();
					   //$scope.closeExpenseModalPage();
					   //$scope.expenseModified = ($scope.expenseModified == 0)?1:0;
					});
				}
            }
            $scope.deleteBudget = function(budget){
            	var dlg = dialogs.confirm('Delete category?','Are you sure you want to delete ' + budget.name + "?");
		        dlg.result.then(function(btn){
	     		 	Categories.delete(budget.objectId);
	        		$scope.budgets.splice($scope.budgets.indexOf(budget),1);
	        		$scope.search();
					$scope.select($scope.currentPage);
					logger.logSuccess("Category deleted.");
		        },function(btn){
		          
		        });


            }
            $scope.cancel = function() {
                $scope.editBudgetModalInstance.dismiss("cancel")
            }
            /*(init = function() {
                return $scope.search(), $scope.select($scope.currentPage)
            })();*/
}])




    }).call(this)