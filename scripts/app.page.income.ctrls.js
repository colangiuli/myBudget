(function() {
        "use strict";
        angular.module("app.page.income.ctrls", [])
        .controller("incomeCtrl", ["$scope", "$filter","Incomes","$modal","$localstorage", "dialogs","logger",function($scope, $filter,Incomes,$modal,$localstorage, dialogs, logger) {
            var init;

            Incomes.getAll().success(function(data){
			      $scope.incomes=data.results?data.results:[];
			      return $scope.search(), $scope.select($scope.currentPage);
			});
           
            $scope.searchKeywords = "";
            $scope.filteredincomes = [];
            $scope.row = "";
            $scope.select = function(page) {
                var end, start;
                start = (page - 1) * $scope.numPerPage;
                end = start + $scope.numPerPage; 
                $scope.currentPageincomes = $scope.filteredincomes.slice(start, end);
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
                return $scope.filteredincomes = $filter("filter")($scope.incomes, $scope.searchKeywords), 
                $scope.onFilterChange()
            }; 
            $scope.order = function(rowName) {
                return $scope.row !== rowName ? ($scope.row = rowName, $scope.filteredincomes = $filter("orderBy")($scope.incomes, rowName), $scope.onOrderChange()) : void 0
            }; 
            $scope.numPerPageOpt = [3, 5, 10, 20]; 
            $scope.numPerPage = $scope.numPerPageOpt[2];
            $scope.currentPage = 1;
            $scope.currentPageincomes = [];


            $scope.editBudget = function(income){
                $scope.income = income;
                $scope.incomePos = $scope.incomes.indexOf(income);
                var modalInstance;
                $scope.editBudgetModalInstance = $modal.open({
                    templateUrl: "editBudget.html",
                   // controller: "ModalInstanceCtrl",
                   scope: $scope
                })
            }
            $scope.newBudget = function(){
                $scope.income = {};
                $scope.income.owner = {
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

            $scope.saveBudget = function(income){
				$scope.income.ACL = {};
                $scope.income.shared = $scope.income.shared?$scope.income.shared:false;
				$scope.income.ACL[$localstorage.get('objectId')] = { "read": true, "write": true};
				if ($scope.income.shared == true){
					$scope.income.ACL["role:friendsOf_" + $localstorage.get('objectId')] = { "read": true};
				}
				if(!!$scope.income.objectId){
					Incomes.edit($scope.income.objectId, $scope.income).success(function(data){	
						$scope.incomes[$scope.incomePos] = $scope.income;
						$scope.search();
						$scope.select($scope.currentPage);
						$scope.editBudgetModalInstance.close();
						//$scope.income.objectId = data.objectId;
						//$scope.incomes.push($scope.income);
					    //$scope.closeExpenseModalPage();
					    //$scope.expenseModified = ($scope.expenseModified == 0)?1:0;
					});
				}else{
					Incomes.create($scope.income).success(function(data){
						$scope.income.objectId = data.objectId;
						$scope.incomes.push($scope.income);
						$scope.search();
						$scope.select($scope.currentPage);
						$scope.editBudgetModalInstance.close();
					   //$scope.closeExpenseModalPage();
					   //$scope.expenseModified = ($scope.expenseModified == 0)?1:0;
					});
				}
            }
            $scope.deleteBudget = function(income){
            	var dlg = dialogs.confirm('Delete category?','Are you sure you want to delete ' + income.name + "?");
		        dlg.result.then(function(btn){
	     		 	Incomes.delete(income.objectId);
	        		$scope.incomes.splice($scope.incomes.indexOf(income),1);
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