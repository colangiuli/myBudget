angular.module('app.services', [])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])

.factory('Categories',['$http','PARSE_CREDENTIALS','$window',function($http,PARSE_CREDENTIALS,$window){
    return {
        getAll:function(){
            return $http.get('https://api.parse.com/1/classes/categories',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                }
            });
        },
        getFull:function(){
            return $http.post('https://api.parse.com/1/functions/categoriesFull',{},{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                }
            });
        },
        get:function(id){
            return $http.get('https://api.parse.com/1/classes/categories/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                }
            });
        },
        create:function(data){
            return $http.post('https://api.parse.com/1/classes/categories',data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        },
        edit:function(id,data){
            return $http.put('https://api.parse.com/1/classes/categories/'+id,data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        },
        delete:function(id){
            return $http.delete('https://api.parse.com/1/classes/categories/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        }
    }
}]).value('PARSE_CREDENTIALS',{
    APP_ID: "WbAXovOrZQo9Mxr7TtPOXsxPuofZ0R8FEaW7qrTt",
    REST_API_KEY:"ZKeAoTzFyB7pa5Ar0PLhMrQXK3ynqw1ThXOh5Zzn"
})


.factory('Expenses',['$http','PARSE_CREDENTIALS','$window',function($http,PARSE_CREDENTIALS,$window){
    return {
        getAll:function(){
            return $http.get('https://api.parse.com/1/classes/expenses',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
		            //where: whereQuery,
					order: '-date',
		            //limit: 2,
		            // count: 1
			   		'include': 'categoryID, owner'
	            }
            });
        },
		
        getMine:function(){
            return $http.get('https://api.parse.com/1/classes/expenses',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
		            where: {"owner":{"__type":"Pointer","className":"_User","objectId":$window.localStorage['objectId']}},
					order: '-date',
		            //limit: 2,
		            // count: 1
			   		'include': 'categoryID'
	            }
            });
        },		
		
        getAllByCatId:function(categoryId){
            return $http.get('https://api.parse.com/1/classes/expenses',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
		            where: {"categoryID":{"__type":"Pointer","className":"categories","objectId":categoryId}},
					order: '-date',
		            //limit: 2,
		            // count: 1
			   		'include': 'owner'
	            }
            });
        },

        get:function(id){
            return $http.get('https://api.parse.com/1/classes/expenses/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
	                 //where: whereQuery,
	                 //limit: 2,
	                 // count: 1
					'include': 'categoryID, owner'
              }
            });
        },
        create:function(data){
            return $http.post('https://api.parse.com/1/classes/expenses',data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        },
        edit:function(id,data){
            return $http.put('https://api.parse.com/1/classes/expenses/'+id,data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        },
        delete:function(id){
            return $http.delete('https://api.parse.com/1/classes/expenses/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        }
    }
}]).value('PARSE_CREDENTIALS',{
    APP_ID: "WbAXovOrZQo9Mxr7TtPOXsxPuofZ0R8FEaW7qrTt",
    REST_API_KEY:"ZKeAoTzFyB7pa5Ar0PLhMrQXK3ynqw1ThXOh5Zzn"

})


.factory('Savings',['$http','PARSE_CREDENTIALS','$window',function($http,PARSE_CREDENTIALS,$window){
    return {
        getAll:function(){
            return $http.get('https://api.parse.com/1/classes/savings',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
                params:  { 
                    //where: whereQuery,
                    order: '-date',
                    //limit: 2,
                    // count: 1
                    'include': 'owner'
                }
            });
        },
        
        getMine:function(){
            return $http.get('https://api.parse.com/1/classes/savings',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
                params:  { 
                    where: {"owner":{"__type":"Pointer","className":"_User","objectId":$window.localStorage['objectId']}},
                    order: '-date',
                    //limit: 2,
                    // count: 1
                    //'include': 'categoryID'
                }
            });
        },      
        

        get:function(id){
            return $http.get('https://api.parse.com/1/classes/savings/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
                params:  { 
                     //where: whereQuery,
                     //limit: 2,
                     // count: 1
                    'include': 'categoryID, owner'
              }
            });
        },
        create:function(data){
            return $http.post('https://api.parse.com/1/classes/savings',data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        },
        edit:function(id,data){
            return $http.put('https://api.parse.com/1/classes/savings/'+id,data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        },
        delete:function(id){
            return $http.delete('https://api.parse.com/1/classes/savings/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        }
    }
}]).value('PARSE_CREDENTIALS',{
    APP_ID: "WbAXovOrZQo9Mxr7TtPOXsxPuofZ0R8FEaW7qrTt",
    REST_API_KEY:"ZKeAoTzFyB7pa5Ar0PLhMrQXK3ynqw1ThXOh5Zzn"

})



.factory('Incomes',['$http','PARSE_CREDENTIALS','$window',function($http,PARSE_CREDENTIALS,$window){
    return {
        getAll:function(){
            return $http.get('https://api.parse.com/1/classes/incomes',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
                params:  { 
                    //where: whereQuery,
                    order: '-date',
                    //limit: 2,
                    // count: 1
                    'include': 'owner'
                }
            });
        },
        
        getMine:function(){
            return $http.get('https://api.parse.com/1/classes/incomes',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
                params:  { 
                    where: {"owner":{"__type":"Pointer","className":"_User","objectId":$window.localStorage['objectId']}},
                    order: '-date',
                    //limit: 2,
                    // count: 1
                    //'include': 'categoryID'
                }
            });
        },      
        

        get:function(id){
            return $http.get('https://api.parse.com/1/classes/incomes/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
                params:  { 
                     //where: whereQuery,
                     //limit: 2,
                     // count: 1
                    'include': 'categoryID, owner'
              }
            });
        },
        create:function(data){
            return $http.post('https://api.parse.com/1/classes/incomes',data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        },
        edit:function(id,data){
            return $http.put('https://api.parse.com/1/classes/incomes/'+id,data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        },
        delete:function(id){
            return $http.delete('https://api.parse.com/1/classes/incomes/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        }
    }
}]).value('PARSE_CREDENTIALS',{
    APP_ID: "WbAXovOrZQo9Mxr7TtPOXsxPuofZ0R8FEaW7qrTt",
    REST_API_KEY:"ZKeAoTzFyB7pa5Ar0PLhMrQXK3ynqw1ThXOh5Zzn"

})


.factory('RecurringExpenses',['$http','PARSE_CREDENTIALS','$window',function($http,PARSE_CREDENTIALS,$window){
    return {
        getAll:function(){
            return $http.get('https://api.parse.com/1/classes/recurringExpenses',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
                params:  { 
                    //where: whereQuery,
                    order: '-date',
                    //limit: 2,
                    // count: 1
                    'include': 'owner'
                }
            });
        },
        
        getMine:function(){
            return $http.get('https://api.parse.com/1/classes/recurringExpenses',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
                params:  { 
                    where: {"owner":{"__type":"Pointer","className":"_User","objectId":$window.localStorage['objectId']}},
                    order: '-date',
                    //limit: 2,
                    // count: 1
                    //'include': 'categoryID'
                }
            });
        },      
        

        get:function(id){
            return $http.get('https://api.parse.com/1/classes/recurringExpenses/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
                params:  { 
                     //where: whereQuery,
                     //limit: 2,
                     // count: 1
                    'include': 'categoryID, owner'
              }
            });
        },
        create:function(data){
            return $http.post('https://api.parse.com/1/classes/recurringExpenses',data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        },
        edit:function(id,data){
            return $http.put('https://api.parse.com/1/classes/recurringExpenses/'+id,data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        },
        delete:function(id){
            return $http.delete('https://api.parse.com/1/classes/recurringExpenses/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        }
    }
}]).value('PARSE_CREDENTIALS',{
    APP_ID: "WbAXovOrZQo9Mxr7TtPOXsxPuofZ0R8FEaW7qrTt",
    REST_API_KEY:"ZKeAoTzFyB7pa5Ar0PLhMrQXK3ynqw1ThXOh5Zzn"

})


.factory('Users',['$http','PARSE_CREDENTIALS','$window',function($http,PARSE_CREDENTIALS,$window){
    return {
        login:function(user){
            return $http.get('https://api.parse.com/1/login',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                },	params:  {"username":user.username,"password":user.password}
            });
        },

		getFriendsRole:function(){
			return $http.get('https://api.parse.com/1/roles',{
				headers:{
					'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
					'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
				},
				params:  { 
					 where: {"name":"friendsOf_"+$window.localStorage['objectId']}
				}
			});
		},
		
		
		get:function(id){
			return $http.get('https://api.parse.com/1/users/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
	                 //where: {"$relatedTo":{"object":{"__type":"Pointer","className":"_Role","objectId":$window.localStorage['FRIENDS_ROLE_ID']},"key":"users"}}
	                 //limit: 2,
	                 // count: 1
					//'include': 'categoryID, owner'
              }
            });
		},
		
		getFriends:function(){
			return $http.get('https://api.parse.com/1/users',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
	                 where: {"$relatedTo":{"object":{"__type":"Pointer","className":"_Role","objectId":$window.localStorage['FRIENDS_ROLE_ID']},"key":"users"}}
	                 //limit: 2,
	                 // count: 1
					//'include': 'categoryID, owner'
              }
            });
		}
		
    }
}]).value('PARSE_CREDENTIALS',{
    APP_ID: "WbAXovOrZQo9Mxr7TtPOXsxPuofZ0R8FEaW7qrTt",
    REST_API_KEY:"ZKeAoTzFyB7pa5Ar0PLhMrQXK3ynqw1ThXOh5Zzn"
});

