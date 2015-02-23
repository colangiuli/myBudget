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

/**
 * A simple example service that returns some data.
 */
/*
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [{
    id: 0,
    name: 'Ben Sparrow',
    notes: 'Enjoys drawing things',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    notes: 'Odd obsession with everything',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlen',
    notes: 'Wears a sweet leather Jacket. I\'m a bit jealous',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    notes: 'I think he needs to buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    notes: 'Just the nicest guy',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];


  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
})
*/
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

