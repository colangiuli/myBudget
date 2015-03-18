 // Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $rootScope, $ionicLoading,DB) {
  $rootScope.$on('loading:show', function() {
    $ionicLoading.show({template: 'Loading...',duration: 3000});
  })

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide();
  })
  //DB.init();
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
	//
    //intialize parse
    //Parse.initialize("WbAXovOrZQo9Mxr7TtPOXsxPuofZ0R8FEaW7qrTt", "iuRiAFBNVw7aCA7tHQRszUsgjXhnHiDubag4ZCRn");
  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  /*
  
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        $rootScope.$broadcast('loading:show')
        return config
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide')
        return response
      }
    }
  })
  */
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    .state('signin', {
	  cache: false,
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'SignInCtrl'
    })
    .state('forgotpassword', {
	  cache: false,
      url: '/forgot-password',
      templateUrl: 'templates/forgot-password.html'
    })
  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html",
	controller: 'MainCtrl'
  })
  // Each tab has its own nav history stack:
  .state('tab.categories', {
    cache: false,
    url: '/categories',
    views: {
      'tab-categories': {
        templateUrl: 'templates/tab-categories.html',
        controller: 'CategoriesCtrl'
      }
    }
  })
  
   .state('tab.category-detail', {
      url: '/categories/:categoryId',
      views: {
        'tab-categories': {
          templateUrl: 'templates/category-detail.html',
          controller: 'CategoryDetailCtrl'
        }
      }
    })

  .state('tab.expenses', {
      url: '/expenses',
      views: {
        'tab-expenses': {
          templateUrl: 'templates/tab-expenses.html',
          controller: 'ExpensesCtrl'
        }
      }
    })
    .state('tab.expense-detail', {
      url: '/expenses/:expenseId',
      views: {
        'tab-expenses': {
          templateUrl: 'templates/expense-detail.html',
          controller: 'ExpenseDetailCtrl'
        }
      }
    })
  .state('tab.friends', {
      url: '/friends',
      views: {
        'tab-friends': {
          templateUrl: 'templates/tab-friends.html',
          controller: 'FriendsCtrl'
        }
      }
    })
    .state('tab.friend-detail', {
      url: '/friend/:friendId',
      views: {
        'tab-friends': {
          templateUrl: 'templates/friend-detail.html',
          controller: 'FriendDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/sign-in');

})
.constant('DB_CONFIG', {
    name: 'myBudget',
    tables: [
      {
            name: 'expense',
            columns: [
                {name: 'objectId', type: 'text primary key'},
                {name: 'categoryId', type: 'text'},
                {name: 'date', type: 'text'},
			         	{name: 'note', type: 'text'},
                {name: 'photo', type: 'text'},
                {name: 'value', type: 'text'},
                {name: 'createdAt', type: 'text'},
                {name: 'updatedAt', type: 'text'},
                {name: 'owner', type: 'text'},
                {name: 'owner_img', type: 'text'},
                {name: 'owner_username', type: 'text'},
                {name: 'owner_email', type: 'text'},
                {name: 'status', type: 'text'},
                {name: 'deleted', type: 'text'}
            ]
        },
		    {
            name: 'users',
            columns: [
                {name: 'objectId', type: 'text primary key'},
                {name: 'username', type: 'text'},
                {name: 'icon', type: 'text'},
				        {name: 'email', type: 'text'},
                {name: 'img', type: 'text'},
                {name: 'createdAt', type: 'text'},
                {name: 'updatedAt', type: 'text'},
                {name: 'status', type: 'text'},
                {name: 'deleted', type: 'text'}
            ]
        },
        {
            name: 'categories',
            columns: [
                {name: 'objectId', type: 'text primary key'},
                {name: 'budget', type: 'text'},
                {name: 'icon', type: 'text'},
                {name: 'name', type: 'text'},
                {name: 'shared', type: 'text'},
                {name: 'createdAt', type: 'text'},
                {name: 'updatedAt', type: 'text'},
                {name: 'owner', type: 'text'},
                {name: 'status', type: 'text'},
                {name: 'deleted', type: 'text'}
            ]
        }
    ]
});
