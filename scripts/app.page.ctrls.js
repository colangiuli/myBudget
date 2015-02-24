(function() {
        "use strict";
        angular.module("app.page.ctrls", []).controller("invoiceCtrl", ["$scope", "$window", function($scope) {
            return $scope.printInvoice = function() {
                var originalContents, popupWin, printContents;
                return printContents = document.getElementById("invoice").innerHTML, originalContents = document.body.innerHTML, popupWin = window.open(), popupWin.document.open(), popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="styles/main.css" /></head><body onload="window.print()">' + printContents + "</html>"), popupWin.document.close()
            }
        }]).controller("budgetCtrl", ["$scope", "$filter","Categories","$modal", function($scope, $filter,Categories,$modal) {
            var init;

            Categories.getFull().success(function(data){
			      $scope.budgets=data.result;
			      return $scope.search(), $scope.select($scope.currentPage);
			});
            /*$scope.budgets = [{
                name: "Nijiya Market",
                price: "$$",
                sales: 292,
                rating: 4
            }, {
                name: "Eat On Monday Truck",
                price: "$",
                sales: 119,
                rating: 4.3
            }, {
                name: "Tea Era",
                price: "$",
                sales: 874,
                rating: 4
            }, {
                name: "Rogers Deli",
                price: "$",
                sales: 347,
                rating: 4.2
            }, {
                name: "MoBowl",
                price: "$$$",
                sales: 24,
                rating: 4.6
            }, {
                name: "The Milk Pail Market",
                price: "$",
                sales: 543,
                rating: 4.5
            }]; */
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

            $scope.open = function() {
                var modalInstance;
                modalInstance = $modal.open({
                    templateUrl: "editBudget.html"//,
                   // controller: "ModalInstanceCtrl",
                })
            }

            $scope.editBudget = function(objectId){
                $scope.budget = {"name": "ciao"};
                                var modalInstance;
                modalInstance = $modal.open({
                    templateUrl: "editBudget.html",
                   // controller: "ModalInstanceCtrl",
                   scope: $scope
                })
            }
            $scope.deleteBudget = function(objectId){
                
            }
            $scope.newBudget = function(){
                
            }
            /*(init = function() {
                return $scope.search(), $scope.select($scope.currentPage)
            })();*/
        }]).controller('SignInCtrl', function($scope, Users, $window, $http) {
	$scope.user = {"username": $window.localStorage['username']};
	if ((!!$window.localStorage['SESSION_TOKEN']) && ($window.localStorage['SESSION_TOKEN'] !="") ){
		$state.go('tab.categories');
	}
	
	$scope.signIn = function(user) {
		Users.login(user).
				success(function(data){
					// this callback will be called asynchronously
					// when the response is available
					$window.localStorage['SESSION_TOKEN'] = data.sessionToken;
					$window.localStorage['objectId'] = data.objectId;
					$window.localStorage['username'] = data.username;
					$window.localStorage['icon'] = data.icon;
					$window.localStorage['email'] = data.email;
					$window.localStorage['img'] = data.img;
					//$state.go('tab.categories');
					Users.getFriendsRole().success(function(data){
						// this callback will be called asynchronously
						// when the response is available
						$window.localStorage['FRIENDS_ROLE_ID'] = data.results[0].objectId;
					});
				}).error(function() {
					alert("login error!");
				});
    };
  
  
})
    }).call(this)