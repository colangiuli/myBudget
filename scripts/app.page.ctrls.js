(function() {
        "use strict";
        angular.module("app.page.ctrls", []).controller("invoiceCtrl", ["$scope", "$window", function($scope) {
            return $scope.printInvoice = function() {
                var originalContents, popupWin, printContents;
                return printContents = document.getElementById("invoice").innerHTML, originalContents = document.body.innerHTML, popupWin = window.open(), popupWin.document.open(), popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="styles/main.css" /></head><body onload="window.print()">' + printContents + "</html>"), popupWin.document.close()
            }
        }])

.controller('SignInCtrl', function($scope, Users, $window, $http) {
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