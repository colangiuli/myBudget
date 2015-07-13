angular.module('starter.controllers', [])

.controller('SignInCtrl', function($scope, $state, Users, $window, $http, DB,Expenses, Categories) {

	$scope.user = {"username": $window.localStorage['username']};
	if ((!!$window.localStorage['SESSION_TOKEN']) && ($window.localStorage['SESSION_TOKEN'] !="") ){
		DB.init().then(function(){
			$state.go('tab.categories');
		});

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
						DB.init().then(function(){
							console.log("Syncing");
							Expenses.localSync();
							//Expenses.remoteSync();
							//Categories.localSync();
							Categories.remoteSync();
							$state.go('tab.categories');
						});
					});
				}).error(function() {
					alert("login error!");
				});
    };
  
  
})


.controller('MainCtrl', function($scope, $rootScope, $localstorage, $stateParams, Expenses, Categories, $state, Camera, $ionicSlideBoxDelegate, $ionicModal, Users,Categories,Expenses) {
	$scope.dateFormat = 'dd/MM/yyyy';
	$scope.expenseModified=0;
	$scope.needSync = 0;

	//first we have to login
	//Users.login();
	
	/*$scope.$on("syncFinished",function(){
		console.log("received event syncFinished");
		$scope.expenseModified = ($scope.expenseModified == 0)?1:0;
	});*/
	$scope.$watch('needSync', function(newVal, oldVal) {
		console.log("Syncing");
		Expenses.localSync();
		//Expenses.remoteSync();
		//Categories.localSync();
		Categories.remoteSync();
		
		//$scope.needSync = ($scope.needSync == 0)?1:0;
	});

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
    	console.log("creating new expense");
		$scope.newExpense={};
		$scope.newExpense.date = new Date();
		
		$scope.newExpense.categoryID = {
			"__type": "Pointer",
			"className":"categories",
			"objectId": catID?catID:""
		};
		$scope.newExpense.categoryID_objectId = catID;
		$scope.newExpense.owner = {
			"__type": "Pointer",
			"className":"_User",
			"objectId": $localstorage.get('objectId')
		};
		$scope.newExpense.value = 0;
		$scope.fullString="000";
		$scope.strDotted = "0,00";
		$scope.show = "calc";
		
		Categories.getAll().then(function(data){
			var tmpArray = data;
			var elementXpage = 2;
			$scope.allCategories = data;
			if(!catID){
				$scope.newExpense.categoryID_objectId = tmpArray[0].objectId?tmpArray[0].objectId:0;
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
    	console.log("editing existing expense");
		$scope.newExpense = angular.copy(expense);
		$scope.strDotted = $scope.newExpense.value;
		$scope.newExpense.date = new Date($scope.newExpense.date);
	
		leftString = parseInt(expense.value.substr(0,expense.value.length-3)).toString();
		rightString = expense.value.substr(expense.value.length-2,2);
		$scope.fullString = leftString + rightString;
		$scope.newExpense.categoryID = {
		    "__type": "Pointer",
		    "className":"categories",
		    "objectId": $scope.newExpense.categoryID_objectId
		};
		$scope.newExpense.owner = {
			"__type": "Pointer",
			"className":"_User",
			"objectId": $localstorage.get('objectId')
		};
		//devo anche andare alla slide giusta!!!!!!!!!!

		$scope.show = "calc";
		
		Categories.getAll().then(function(data){
			var tmpArray = data;
			var elementXpage = 2;
			$scope.allCategories = data;
			var outputArray = Array();
			var pageTmp = 0;
			$scope.pageToShow = 0;
			var elementTmp = Array();
			var idx2 = 0;
			for (var idx = 0; idx < tmpArray.length; idx+=elementXpage){
				elementTmp = tmpArray.slice(idx, idx+elementXpage);
				for (var idx2 = 0; idx2 < elementTmp.length; idx2++){
					if (elementTmp[idx2].objectId == $scope.newExpense.categoryID_objectId){
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
        if($scope.newExpense.categoryID_objectId == categoryToCheck){
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
        $scope.newExpense.categoryID_objectId = categorySelected;
    }
	
	$scope.createExpense = function(){
		$scope.newExpense.value = $scope.strDotted;
		selectedCat = $scope.allCategories.filter(function(item){if (item.objectId == $scope.newExpense.categoryID_objectId) return item;});
		selectedCat = selectedCat[0];
		$scope.newExpense.ACL = {};
		$scope.newExpense.ACL[$localstorage.get('objectId')] = { "read": true, "write": true};
		if (selectedCat.shared == true){
			$scope.newExpense.ACL["role:friendsOf_" + $localstorage.get('objectId')] = { "read": true};
		}
		//$scope.newExpense.photo = $scope.photo;

		if(!!$scope.newExpense.objectId){
			Expenses.edit($scope.newExpense.objectId, $scope.newExpense).then(function(data){
			   $scope.closeExpenseModalPage();
			   $scope.expenseModified = ($scope.expenseModified == 0)?1:0;
			   $scope.needSync = ($scope.needSync == 0)?1:0;
			});
		}else{
			Expenses.create($scope.newExpense).then(function(data){
			   $scope.closeExpenseModalPage();
			   $scope.expenseModified = ($scope.expenseModified == 0)?1:0;
			   $scope.needSync = ($scope.needSync == 0)?1:0;
			});
		}
	}

	$scope.removeExpense=function(item){
        Expenses.delete(item.objectId).then(function(data){
			   //$scope.expenses.splice($scope.expenses.indexOf(item),1);
        	   $scope.expenseModified = ($scope.expenseModified == 0)?1:0;
        	   $scope.needSync = ($scope.needSync == 0)?1:0;
		});
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


	 $scope.getPhoto = function() {
    Camera.getPicture().then(function(imageData) {
      $scope.photo = "data:image/jpeg;base64," + imageData;	
      //console.log(imageURI);
    }, function(err) {
      console.err(err);
    });
  };

//////////////////////////////////////////////////////
/////////      end expense handling functions
///////////////////////////////////////////////////////   
	
})


.controller('ExpenseDetailCtrl', function($scope, $stateParams, Expenses, Categories) {

	$scope.dateFormat = 'dd/MM/yyyy';
	
	$scope.refreshView = function(){
		console.log("Updating ExpenseDetailCtrl");
		Expenses.get($stateParams.expenseId).then(function(data){
				$scope.expense=data[0];
				$scope.category = data.categoryID;
	    }); 
	}
	$scope.$watch('expenseModified', $scope.refreshView);

	$scope.$on("syncFinished",$scope.refreshView);
})

.controller('ExpensesCtrl', function($scope, $stateParams, Expenses, Expenses, Categories, $state, $ionicSlideBoxDelegate) {

	var d = new Date();
	var month = d.getMonth();
	month++;
	month = month.toString(); 
	if (month.length == 1)
		month = '0'+ month;
	var year = d.getFullYear();
	$scope.monthSelected = year + '-' + month;

	$scope.doRefresh = function() {
		var year = parseInt($scope.monthSelected.substr(0, 4));
		var month = parseInt($scope.monthSelected.substr(5, 2));
		if (month == 1){
			month = 12;
			year--;
		} else{
			month--;
		}
		month = month.toString();
		if (month.length == 1)
		month = '0'+ month;
		$scope.monthSelected = year.toString() + '-' + month.toString();
	    //$scope.todos.unshift({name: 'Incoming todo ' + Date.now()})
	    $scope.$broadcast('scroll.refreshComplete');
	    $scope.$apply();
	    $scope.refreshView();
  	};

	$scope.refreshView = function(){
		console.log("Updating ExpensesCtrl");
		Expenses.getMine($scope.monthSelected).then(function(data){
			$scope.expenses=data;
		});
	}
	$scope.$watch('expenseModified', $scope.refreshView);

	$scope.$on("syncFinished",$scope.refreshView);
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

	$scope.refreshView = function(){
		console.log("Updating CategoriesCtrl");
		Categories.getFull().then(function(data){
		  $scope.categories=data;
		});
	}
	$scope.$watch('expenseModified', $scope.refreshView);

	$scope.$on("syncFinished",$scope.refreshView);
  
})

.controller('CategoryDetailCtrl', function($scope, $stateParams, Expenses, Categories) {
	
	$scope.used = '0,00';	
	$scope.budgetFlt = 0,00;
	var d = new Date();
	var month = d.getMonth();
	month++;
	month = month.toString(); 
	if (month.length == 1)
		month = '0'+ month;
	var year = d.getFullYear();
	$scope.monthSelected = year + '-' + month;

	$scope.refreshView = function(){
		console.log("Updating CategoryDetailCtrl");
		Expenses.getAllByCatId($stateParams.categoryId, $scope.monthSelected).then(function(data){
			$scope.expenses = data;
			var sum = 0;
			for (var idx = 0;idx < data.length; idx++){
				sum += parseFloat(data[idx].value);
			}
			$scope.used = 	sum.toFixed(2);
			
			if (sum > $scope.budgetFlt){
				$scope.budgetColor = "assertive";
			}else if(sum/$scope.budgetFlt > 0.8){
				$scope.budgetColor = "energized";
			}else{
				$scope.budgetColor = "balanced";
			}
		});
	}
	$scope.$watch('expenseModified', $scope.refreshView);

	$scope.monthChanged = function(monthSelected){
		$scope.monthSelected = monthSelected;
		$scope.refreshView();
		console.log("month now is :" + monthSelected);
	};

	$scope.$on("syncFinished",$scope.refreshView);
	//$scope.refreshView();

	
	Categories.get($stateParams.categoryId).then(function(data){
		$scope.category = data[0];
		$scope.category.shareLabel = $scope.category.shared == 'true'? 'shared':''; 
		$scope.category.budget = parseFloat($scope.category.budget).toFixed(2);
		$scope.budgetFlt = (!!$scope.category && !!$scope.category.budget)?parseFloat($scope.category.budget):0;
		//$scope.refreshView();
	}); 
})


.controller('AccountCtrl', function($scope, $state, $localstorage, DB) {
  $scope.username =  $localstorage.get('username');
  $scope.email =  $localstorage.get('email');
  $scope.img =  $localstorage.get('img');
  $scope.signOut= function() {
		$localstorage.set('SESSION_TOKEN',"");

		$localstorage.set('lastExpenseSync', "2013-03-07T11:35:46.622Z");
		$localstorage.set('lastCategoriesSync', "2013-03-07T11:35:46.622Z");
		
		DB.reset().then(function(){
			$state.go('signin');
		});

	};
})

.controller('DebugCtrl', function($scope, $state, $localstorage, DB) {
  //$scope.debugs = "ddddd"
  $scope.test = $localstorage.get('log');
  $scope.flushDebugLog= function() {
  	$localstorage.set('log',"");
  	$scope.test = "";
  }
  $scope.refreshDebugLog= function() {
  $scope.test = $localstorage.get('log');
  }
});
