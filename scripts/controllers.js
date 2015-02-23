angular.module('starter.controllers', [])

.controller('SignInCtrl', function($scope, $state, Users, $window, $http) {
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
					$state.go('tab.categories');
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


.controller('MainCtrl', function($scope, $localstorage, $stateParams, Expenses, Categories, $state, $ionicSlideBoxDelegate, $ionicModal, Users) {
	$scope.dateFormat = 'dd/MM/yyyy';
	$scope.expenseModified=0;
	//first we have to login
	//Users.login();
	
///////////////////////////////////////////////////////
/////////      new expense handling
///////////////////////////////////////////////////////   	
	$ionicModal.fromTemplateUrl('templates/expense-add-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.editExpenseModalPage = modal
	})  

    $scope.createNewExpense = function(catID) {
		$scope.newExpense={};

		$scope.newExpense.date = new Date();
		
		$scope.newExpense.categoryID = {
			"__type": "Pointer",
			"className":"categories",
			"objectId": catID?catID:""
		};
		$scope.newExpense.owner = {
			"__type": "Pointer",
			"className":"_User",
			"objectId": $localstorage.get('objectId')
		};
		$scope.newExpense.value = 0;
		$scope.fullString="000";
		$scope.strDotted = "0,00";
		$scope.show = "calc";
		
		Categories.getAll().success(function(data){
			var tmpArray = data.results;
			var elementXpage = 2;
			$scope.allCategories = data.results;
			if(!catID){
				$scope.newExpense.categoryID.objectId = tmpArray[0].objectId?tmpArray[0].objectId:0;
			}
			var outputArray = Array();
			for (var idx = 0; idx < tmpArray.length; idx+=elementXpage){
				outputArray.push(tmpArray.slice(idx, idx+elementXpage));
			}
			$scope.categories = outputArray;
			$scope.editExpenseModalPage.show();
			$ionicSlideBoxDelegate.update();
		});
		
		
    }
  
    $scope.editExpense= function(expense) {
		$scope.newExpense = angular.copy(expense);
		$scope.strDotted = $scope.newExpense.value;
		$scope.newExpense.date = new Date($scope.newExpense.date);
	
		leftString = parseInt(expense.value.substr(0,expense.value.length-3)).toString();
		rightString = expense.value.substr(expense.value.length-2,2);
		$scope.fullString = leftString + rightString;
		$scope.newExpense.categoryID = {
		    "__type": "Pointer",
		    "className":"categories",
		    "objectId": $scope.newExpense.categoryID.objectId
		};
		$scope.newExpense.owner = {
			"__type": "Pointer",
			"className":"_User",
			"objectId": $localstorage.get('objectId')
		};
		//devo anche andare alla slide giusta!!!!!!!!!!

		$scope.show = "calc";
		
		Categories.getAll().success(function(data){
			var tmpArray = data.results;
			var elementXpage = 2;
			$scope.allCategories = data.results;
			var outputArray = Array();
			var pageTmp = 0;
			$scope.pageToShow = 0;
			var elementTmp = Array();
			var idx2 = 0;
			for (var idx = 0; idx < tmpArray.length; idx+=elementXpage){
				elementTmp = tmpArray.slice(idx, idx+elementXpage);
				for (idx2 = 0; idx2 < elementTmp.length; idx2++){
					if (elementTmp.objectId == $scope.newExpense.categoryID.objectId){
						$scope.pageToShow = pageTmp;
					}
				}
				pageTmp++;
				outputArray.push(elementTmp);
			}
			$scope.categories = outputArray;
			$ionicSlideBoxDelegate.update();
			$scope.editExpenseModalPage.show();
			//$ionicSlideBoxDelegate.slide($scope.pageToShow, 500);
		});
    }


	$scope.closeExpenseModalPage = function() {
		$scope.editExpenseModalPage.hide();
	};

    $scope.$on('$destroy', function() {
		$scope.editExpenseModalPage.remove();
	});	

	$scope.checkSelected = function(categoryToCheck){
        if($scope.newExpense.categoryID.objectId == categoryToCheck){
			return "redCat";
		}
    }

	$scope.navSlide = function(index) {
        $ionicSlideBoxDelegate.slide(index, 500);
    }
	
	$scope.showTab = function(tabToShow) {
        $scope.show = tabToShow;
    }
	
	$scope.setCategory = function(categorySelected) {
        $scope.newExpense.categoryID.objectId = categorySelected;
    }
	
	$scope.createExpense = function(){
		$scope.newExpense.value = $scope.strDotted;
		selectedCat = $scope.allCategories.filter(function(item){if (item.objectId == $scope.newExpense.categoryID.objectId) return item;});
		selectedCat = selectedCat[0];
		$scope.newExpense.ACL = {};
		$scope.newExpense.ACL[$localstorage.get('objectId')] = { "read": true, "write": true};
		if (selectedCat.shared == true){
			$scope.newExpense.ACL["role:friendsOf_" + $localstorage.get('objectId')] = { "read": true};
		}
		if(!!$scope.newExpense.objectId){
			Expenses.edit($scope.newExpense.objectId, $scope.newExpense).success(function(data){
			   $scope.closeExpenseModalPage();
			   $scope.expenseModified = ($scope.expenseModified == 0)?1:0;
			});
		}else{
			Expenses.create($scope.newExpense).success(function(data){
			   $scope.closeExpenseModalPage();
			   $scope.expenseModified = ($scope.expenseModified == 0)?1:0;
			});
		}
	}
	
	$scope.addNumber=function(buttonPressed){
        str = $scope.fullString;
		if (buttonPressed == "D"){
			str = str.substr(0,str.length-1);
			if (str.length < 3){
				str = "0"+str;
			}
		}else{
			str += buttonPressed;
		}
		leftString = parseInt(str.substr(0,str.length-2)).toString();
		rightString = str.substr(str.length-2,2);
		$scope.strDotted = leftString + "," + rightString;
		$scope.fullString = leftString + rightString;
	}
//////////////////////////////////////////////////////
/////////      end expense handling functions
///////////////////////////////////////////////////////   
	
})


.controller('ExpenseDetailCtrl', function($scope, $stateParams, Expenses, Categories) {
	$scope.$watch('expenseModified', function(newVal, oldVal) {
		console.log("Updating ExpenseDetailCtrl");
		Expenses.get($stateParams.expenseId).success(function(data){
				$scope.expense=data;
				$scope.category = data.categoryID;
	    }); 
	});
	$scope.dateFormat = 'dd/MM/yyyy';
		Expenses.get($stateParams.expenseId).success(function(data){
				$scope.expense=data;
				$scope.category = data.categoryID;
	    }); 
})

.controller('ExpensesCtrl', function($scope, $stateParams, Expenses, Categories, $state, $ionicSlideBoxDelegate) {

	$scope.$watch('expenseModified', function(newVal, oldVal) {
		console.log("Updating ExpensesCtrl");
		Expenses.getMine().success(function(data){
			$scope.expenses=data.results;
		});
	});

	Expenses.getMine().success(function(data){
        $scope.expenses=data.results;
    });
	
	$scope.removeExpense=function(item){
        Expenses.delete(item.objectId);
        $scope.expenses.splice($scope.expenses.indexOf(item),1);
    }

})

.controller('FriendsCtrl', function($scope, Users) {
	Users.getFriends().success(function(data){
	  $scope.friends = data.results;
	});
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Users) {
	Users.get($stateParams.friendId).success(function(data){
	  $scope.friend  = data;
	});
})

.controller('CategoriesCtrl', function($scope, Categories) {
	Categories.getFull().success(function(data){
      $scope.categories=data.result;
  });
  
  	$scope.$watch('expenseModified', function(newVal, oldVal) {
		console.log("Updating CategoriesCtrl");
		Categories.getFull().success(function(data){
		  $scope.categories=data.result;
		});
	});
  
})

.controller('CategoryDetailCtrl', function($scope, $stateParams, Expenses, Categories) {
	
	$scope.used = '0,00';	
	
	Categories.get($stateParams.categoryId).success(function(data){
		$scope.category = data;
		$scope.category.budget = $scope.category.budget.toFixed(2);
		
		Expenses.getAllByCatId($stateParams.categoryId).success(function(data){
			$scope.expenses = data.results;
			var sum = 0;
			for (var idx = 0;idx < data.results.length; idx++){
				sum += parseFloat(data.results[idx].value);
			}
			$scope.used = 	sum.toFixed(2);
			budgetFlt = parseFloat($scope.category.budget);
			if (sum > budgetFlt){
				$scope.budgetColor = "assertive";
			}else if(sum/budgetFlt > 0.8){
				$scope.budgetColor = "energized";
			}else{
				$scope.budgetColor = "balanced";
			}
		});
		
	});
	
	$scope.$watch('expenseModified', function(newVal, oldVal) {
		console.log("Updating CategoryDetailCtrl");
		
		Expenses.getAllByCatId($stateParams.categoryId).success(function(data){
			$scope.expenses = data.results;
			var sum = 0;
			for (var idx = 0;idx < data.results.length; idx++){
				sum += parseFloat(data.results[idx].value);
			}
			$scope.used = 	sum.toFixed(2);
			budgetFlt = (!!$scope.category && !!$scope.category.budget)?parseFloat($scope.category.budget):0;
			if (sum > budgetFlt){
				$scope.budgetColor = "assertive";
			}else if(sum/budgetFlt > 0.8){
				$scope.budgetColor = "energized";
			}else{
				$scope.budgetColor = "balanced";
			}
		});
		
	});
	   
	 $scope.removeExpense=function(item){
        Expenses.delete(item.objectId);
        $scope.expenses.splice($scope.expenses.indexOf(item),1);
    }
})


.controller('AccountCtrl', function($scope, $state, $localstorage) {
  $scope.username =  $localstorage.get('username');
  $scope.email =  $localstorage.get('email');
  $scope.img =  $localstorage.get('img');
  $scope.signOut= function() {
		$localstorage.set('SESSION_TOKEN',"");
		$state.go('signin');
	};
});
