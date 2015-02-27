(function() {
        "use strict";
        angular.module("app.page.expense.ctrls", [])
        .controller("expenseCtrl", ["$scope", "$filter","Expenses","$modal","$localstorage", "dialogs","logger",function($scope, $filter,Expenses,$modal,$localstorage, dialogs, logger) {
            var init;

            $scope.dateOptions = {
                "year-format": "'yy'",
                "starting-day": 1
            }
            $scope.open = function($event) {
                return $event.preventDefault(), $event.stopPropagation(), $scope.opened = !0
            }
            $scope.formats = ["dd-MMMM-yyyy", "yyyy/MM/dd", "shortDate"];
            $scope.format = $scope.formats[0];

            Expenses.getAll().success(function(data){
			      $scope.expenses=data.results?data.results:[];
			      return $scope.search(), $scope.select($scope.currentPage);
			});
           
            $scope.searchKeywords = "";
            $scope.filteredexpenses = [];
            $scope.row = "";
            $scope.select = function(page) {
                var end, start;
                start = (page - 1) * $scope.numPerPage;
                end = start + $scope.numPerPage; 
                $scope.currentPageexpenses = $scope.filteredexpenses.slice(start, end);
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
                return $scope.filteredexpenses = $filter("filter")($scope.expenses, $scope.searchKeywords), 
                $scope.onFilterChange()
            }; 
            $scope.order = function(rowName) {
                return $scope.row !== rowName ? ($scope.row = rowName, $scope.filteredexpenses = $filter("orderBy")($scope.expenses, rowName), $scope.onOrderChange()) : void 0
            }; 
            $scope.numPerPageOpt = [3, 5, 10, 20]; 
            $scope.numPerPage = $scope.numPerPageOpt[2];
            $scope.currentPage = 1;
            $scope.currentPageexpenses = [];


            $scope.editBudget = function(expense){
                $scope.expense = expense;
                $scope.expensePos = $scope.expenses.indexOf(expense);
                var modalInstance;
                $scope.editBudgetModalInstance = $modal.open({
                    templateUrl: "editBudget.html",
                   // controller: "ModalInstanceCtrl",
                   scope: $scope
                })
            }
            $scope.newBudget = function(){
                $scope.expense = {};
                $scope.expense.owner = {
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

            $scope.saveBudget = function(expense){
				$scope.expense.ACL = {};
                $scope.expense.shared = $scope.expense.shared?$scope.expense.shared:false;
				$scope.expense.ACL[$localstorage.get('objectId')] = { "read": true, "write": true};
				if ($scope.expense.shared == true){
					$scope.expense.ACL["role:friendsOf_" + $localstorage.get('objectId')] = { "read": true};
				}
				if(!!$scope.expense.objectId){
					Expenses.edit($scope.expense.objectId, $scope.expense).success(function(data){	
						$scope.expenses[$scope.expensePos] = $scope.expense;
						$scope.search();
						$scope.select($scope.currentPage);
						$scope.editBudgetModalInstance.close();
						//$scope.expense.objectId = data.objectId;
						//$scope.expenses.push($scope.expense);
					    //$scope.closeExpenseModalPage();
					    //$scope.expenseModified = ($scope.expenseModified == 0)?1:0;
					});
				}else{
					Expenses.create($scope.expense).success(function(data){
						$scope.expense.objectId = data.objectId;
						$scope.expenses.push($scope.expense);
						$scope.search();
						$scope.select($scope.currentPage);
						$scope.editBudgetModalInstance.close();
					   //$scope.closeExpenseModalPage();
					   //$scope.expenseModified = ($scope.expenseModified == 0)?1:0;
					});
				}
            }
            $scope.deleteBudget = function(expense){
            	var dlg = dialogs.confirm('Delete category?','Are you sure you want to delete ' + expense.name + "?");
		        dlg.result.then(function(btn){
	     		 	Expenses.delete(expense.objectId);
	        		$scope.expenses.splice($scope.expenses.indexOf(expense),1);
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