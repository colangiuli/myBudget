(function() {
        "use strict";
        angular.module("app.page.recurringExpense.ctrls", [])
        .controller("recurringexpenseCtrl", ["$scope", "$filter","RecurringExpenses","$modal","$localstorage", "dialogs","logger",function($scope, $filter,RecurringExpenses,$modal,$localstorage, dialogs, logger) {
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

            RecurringExpenses.getMine().success(function(data){
			      $scope.recurringexpenses=data.results?data.results:[];
			      return $scope.search(), $scope.select($scope.currentPage);
			});
           
            $scope.searchKeywords = "";
            $scope.filteredrecurringexpenses = [];
            $scope.row = "";
            $scope.select = function(page) {
                var end, start;
                start = (page - 1) * $scope.numPerPage;
                end = start + $scope.numPerPage; 
                $scope.currentPagerecurringexpenses = $scope.filteredrecurringexpenses.slice(start, end);
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
                return $scope.filteredrecurringexpenses = $filter("filter")($scope.recurringexpenses, $scope.searchKeywords), 
                $scope.onFilterChange()
            }; 
            $scope.order = function(rowName) {
                return $scope.row !== rowName ? ($scope.row = rowName, $scope.filteredrecurringexpenses = $filter("orderBy")($scope.recurringexpenses, rowName), $scope.onOrderChange()) : void 0
            }; 
            $scope.numPerPageOpt = [3, 5, 10, 20]; 
            $scope.numPerPage = $scope.numPerPageOpt[2];
            $scope.currentPage = 1;
            $scope.currentPagerecurringexpenses = [];


            $scope.editBudget = function(recurringexpense){
                $scope.recurringexpense = recurringexpense;
                $scope.recurringexpensePos = $scope.recurringexpenses.indexOf(recurringexpense);
                var modalInstance;
                $scope.editBudgetModalInstance = $modal.open({
                    templateUrl: "editBudget.html",
                   // controller: "ModalInstanceCtrl",
                   scope: $scope
                })
            }
            $scope.newBudget = function(){
                $scope.recurringexpense = {};
                $scope.recurringexpense.owner = {
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

            $scope.saveBudget = function(recurringexpense){
				$scope.recurringexpense.ACL = {};
                $scope.recurringexpense.shared = $scope.recurringexpense.shared?$scope.recurringexpense.shared:false;
				$scope.recurringexpense.ACL[$localstorage.get('objectId')] = { "read": true, "write": true};
				if ($scope.recurringexpense.shared == true){
					$scope.recurringexpense.ACL["role:friendsOf_" + $localstorage.get('objectId')] = { "read": true};
				}
				if(!!$scope.recurringexpense.objectId){
					RecurringExpenses.edit($scope.recurringexpense.objectId, $scope.recurringexpense).success(function(data){	
						$scope.recurringexpenses[$scope.recurringexpensePos] = $scope.recurringexpense;
						$scope.search();
						$scope.select($scope.currentPage);
						$scope.editBudgetModalInstance.close();
						//$scope.recurringexpense.objectId = data.objectId;
						//$scope.recurringexpenses.push($scope.recurringexpense);
					    //$scope.closeExpenseModalPage();
					    //$scope.expenseModified = ($scope.expenseModified == 0)?1:0;
					});
				}else{
					RecurringExpenses.create($scope.recurringexpense).success(function(data){
						$scope.recurringexpense.objectId = data.objectId;
						$scope.recurringexpenses.push($scope.recurringexpense);
						$scope.search();
						$scope.select($scope.currentPage);
						$scope.editBudgetModalInstance.close();
					   //$scope.closeExpenseModalPage();
					   //$scope.expenseModified = ($scope.expenseModified == 0)?1:0;
					});
				}
            }
            $scope.deleteBudget = function(recurringexpense){
            	var dlg = dialogs.confirm('Delete category?','Are you sure you want to delete ' + recurringexpense.name + "?");
		        dlg.result.then(function(btn){
	     		 	RecurringExpenses.delete(recurringexpense.objectId);
	        		$scope.recurringexpenses.splice($scope.recurringexpenses.indexOf(recurringexpense),1);
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