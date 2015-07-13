angular.module('starter.services', [])

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

.factory('Camera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, { quality: 50, destinationType: Camera.DestinationType.DATA_URL});

      return q.promise;
    }
  }
}])

.factory('Categories',['$http','PARSE_CREDENTIALS','$window', 'DB','$rootScope',function($http,PARSE_CREDENTIALS,$window, DB,$rootScope){
    var self = this;
    //self.lastSync = '2013-03-07T11:35:46.622Z';

    //if (!$window.localStorage['lastCategoriesSync']){
       $window.localStorage['lastCategoriesSync'] = '2013-03-07T11:35:46.622Z';
    //}
    self.syncing = 0;



        self.remoteSync = function(){
            console.log("entering categories remote Sync");
            if (self.syncing == 1){
                console.log("already syncing categories: exiting..");
                return;
            }

            self.syncing = 1;
            console.log("getting data from remote");
            console.log("cat sync 1");


             DB.query("SELECT max(updatedAt) as lastSync from categories").then(function(result){
                if ( (result.rows.length == 0) || (result.rows.item(0).lastSync == null) ){
                   console.log("cat sync: lastSync is empty, init");
                   $window.localStorage['lastCategoriesSync'] = '2013-03-07T11:35:46.622Z';
                }else{
                    $window.localStorage['lastCategoriesSync'] = result.rows.item(0).lastSync;
                    console.log("cat sync: lastSync is " + $window.localStorage['lastCategoriesSync'] );
                }


                $http.get('https://api.parse.com/1/classes/categories',{
                    headers:{
                        'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                        'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                        'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                    },
                    params:  { 
                        where: '{"updatedAt":{"$gte":{"__type":"Date","iso":"' + $window.localStorage['lastCategoriesSync'] + '"}}}',
                        order: '-date',
                        //limit: 2,
                        // count: 1
                        //'include': 'categoryID, owner'
                    }
                }).success(function(data){
                    console.log("cat: received data from remote");
                    var queryD = "delete from categories where objectId = '?'";
                    var queryI = "insert or replace into categories (objectId,budget,icon,name,shared,createdAt,updatedAt,status,deleted) values (?,?,?,?,?,?,?,'S',?)";
                    if (!!data.results)
                        data = data.results;
                    var tmpData = [];
                    for(var idx = 0; idx < data.length; idx++){
                        tmpData.push([data[idx].objectId, data[idx].budget, data[idx].icon, data[idx].name, data[idx].shared, data[idx].createdAt, data[idx].updatedAt,data[idx].deleted]);
                    }
                                
                    var bindingsArray = typeof tmpData !== 'undefined' ? tmpData : [];
             
                    DB.db.transaction(
                        function(innertransaction) {
                            for (var idx=0; idx<bindingsArray.length; idx++){ 
                                innertransaction.executeSql(queryI, bindingsArray[idx]);
                            };
                        },
                        function(error){
                            self.syncing = 0;
                            console.log("cat sync 0");
                            console.log("error inserting categories:");
                            console.log(error);
                        },
                        function(){
                            var d = new Date();
                            //$window.localStorage['lastCategoriesSync'] = d.toISOString();
                            console.log("successfully synced Categories at " + $window.localStorage['lastCategoriesSync']);
                            console.log("cat sync 0");
                            $rootScope.$broadcast("syncFinished");
                            self.syncing = 0;
                        }
                    )

                }).error(function() {
                    console.log("error fetching category data from remote");
                    console.log("cat sync 0");
                    self.syncing = 0;
                });
            });
        };



       self.getAll=function(){
            return DB.query("SELECT * FROM categories").then(function(result){
                return DB.fetchAll(result);
            });
        };
        self.getFull=function(){
            return DB.query("SELECT categories.objectId, categories.budget, categories.icon, categories.NAME, categories.shared, categories.createdAt, categories.updatedAt, categories.OWNER, ifnull(SUM(expense.value),0) AS used FROM categories LEFT JOIN expense ON (expense.categoryId = categories.objectId and strftime('%Y-%m', expense.date) = strftime('%Y-%m','now') and expense.deleted != '1') GROUP BY categories.objectId, categories.budget, categories.icon, categories.NAME, categories.shared, categories.createdAt, categories.updatedAt, categories.owner").then(function(result){
                return DB.fetchAll(result);
            });
            /*return $http.post('https://api.parse.com/1/functions/categoriesFull',{},{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                }
            });*/
        };
        self.get=function(id){
            return DB.query("SELECT * FROM categories where objectId = '" + id + "'").then(function(result){
                return DB.fetchAll(result);
            });
        };
        self.create=function(data){
            return $http.post('https://api.parse.com/1/classes/categories',data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        };
        self.edit=function(id,data){
            return $http.put('https://api.parse.com/1/classes/categories/'+id,data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        };
        self.delete=function(id){
            return $http.delete('https://api.parse.com/1/classes/categories/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        }
    
    return self;

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
})

.factory('DB', function($q, DB_CONFIG) {
    var self = this;
    self.db = null;
 
    self.init = function() {
        // Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
        self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', 655367);
        var deferred = $q.defer();

        self.db.transaction(
            function(transaction) {
                /*for (var i=0; i<bindingsArray.length; i++){ 
                    queryD = "delete from expense where objectId = '" + bindingsArray[i][0] + "'";
                    console.log(queryD);
                    transaction.executeSql(queryD);
                };*/
                angular.forEach(DB_CONFIG.tables, function(table) {
                    var columns = [];
         
                    angular.forEach(table.columns, function(column) {
                        columns.push(column.name + ' ' + column.type);
                    });
         
                    var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
                    self.query(query);
                    transaction.executeSql(query);
                    console.log (query);
                    console.log('Table ' + table.name + ' initialized');
                });



            },
            function(error){
                console.log("init error");
                console.log(error);
                deferred.reject();
            },
            function(){
                console.log("init ok");
                deferred.resolve();

            }
        );

        return deferred.promise;
    
    };


    self.reset = function() {
        // Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
        self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', 655367);
        var deferred = $q.defer();

        self.db.transaction(
            function(transaction) {
                /*for (var i=0; i<bindingsArray.length; i++){ 
                    queryD = "delete from expense where objectId = '" + bindingsArray[i][0] + "'";
                    console.log(queryD);
                    transaction.executeSql(queryD);
                };*/
                angular.forEach(DB_CONFIG.tables, function(table) {
         
                    var query = 'DROP TABLE IF EXISTS ' + table.name;
                    //self.query(query);
                    transaction.executeSql(query);
                    console.log (query);
                    console.log('Table ' + table.name + ' erased');
                });



            },
            function(error){
                console.log("init error");
                console.log(error);
                deferred.reject();
            },
            function(){
                console.log("init ok");
                deferred.resolve();

            }
        );

        return deferred.promise;
    };

  /*  self.reset = function() {
        // Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
        self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', 655367);

        angular.forEach(DB_CONFIG.tables, function(table) {
            var columns = [];
 
            angular.forEach(table.columns, function(column) {
                columns.push(column.name + ' ' + column.type);
            });
 
            var query = 'DROP TABLE IF EXISTS ' + table.name + '; CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            self.query(query);
            console.log (query);
            console.log('Table ' + table.name + ' initialized');
        });
    };
*/

 
    self.query = function(query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();
 
        self.db.transaction(function(transaction) {
            transaction.executeSql(query, bindings, function(transaction, result) {
                deferred.resolve(result);
            }, function(transaction, error) {
                console.log("error executing: " + query);
                console.log(error);
                deferred.reject(error);
            });
        });
 
        return deferred.promise;
    };
	
	self.insert = function(query, bindingsArray) {
        bindingsArray = typeof bindingsArray !== 'undefined' ? bindingsArray : [];
        var deferred = $q.defer();
 
        self.db.transaction(
			function(transaction) {
				for (var i=0; i<bindingsArray.length; i++){  
					transaction.executeSql(query, bindingsArray[i]);
				};
			},
			function(error){
                console.log(query);
				console.log(error);
			},
			function(){
				console.log("transaction ok")
			}
		);
        return deferred.promise;
    };
 
    self.fetchAll = function(result) {
        var output = [];
 
        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }
        
        return output;
    };
 
    self.fetch = function(result) {
        return result.rows.item(0);
    };
 
    return self;
})
// Resource service example
.factory('Document', function(DB) {
    var self = this;
    
    self.all = function() {
        return DB.query('SELECT * FROM documents')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };
    
    self.getById = function(id) {
        return DB.query('SELECT * FROM documents WHERE id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };
    
    return self;
})
.factory('Expenses',['$http','PARSE_CREDENTIALS','$window','DB','$rootScope',function($http,PARSE_CREDENTIALS,$window,DB,$rootScope){
	var self = this;

	self.syncing = 0;


        self.localSync = function(){

            console.log("exp LOC: entering localSync");
            if(self.syncing != 0){
                console.log("exp LOC: already syncing - exityng localsync current state: " + self.syncing);
                return;
            }else{
                self.syncing = 1;
                console.log("exp LOC: sync 1");
            }
            console.log("exp LOC: getting modified local data");
            DB.query("SELECT expense.*, categories.shared FROM expense inner join categories on expense.categoryId = categories.objectId where expense.status != 'S'").then(function(result){
                if (result.rows.length == 0){
                   console.log("exp LOC: no local data to sync");
                   console.log("exp LOC: sync 2");
                   self.syncing = 2;
                   self.remoteSync();
                   return; 
                }
                console.log("exp LOC: " + result.rows.length + " rows to sync");
                
                var Requests = [];
                for (var idx = 0;idx < result.rows.length; idx++)
                {    
                        var riga = result.rows.item(idx);
                        var newExpense = {};
                        if(riga.objectId.substr(0,4) == "FAKE"){
                            newExpense.method = "POST";
                            newExpense.path = "/1/classes/expenses";
                        }else{
                            newExpense.method = "PUT";
                            newExpense.path = "/1/classes/expenses/"+riga.objectId;
                        }
                        newExpense.body = {};
                        newExpense.body.date = riga.date;
                        newExpense.body.note = riga.note;
                        newExpense.body.photo = riga.photo;
                        newExpense.body.value = riga.value;
                        newExpense.body.deleted = riga.deleted;
                        newExpense.body.shared = false;
                        //-----------ACL
                        newExpense.body.ACL = {};
                        newExpense.body.ACL[$window.localStorage['objectId']] = { "read": true, "write": true};
                        if (riga.shared == 'true'){
                            newExpense.body.shared = true;
                            newExpense.body.ACL["role:friendsOf_" + $window.localStorage['objectId']] = { "read": true};
                        }
                        newExpense.body.categoryID = {"__type": "Pointer", "className":"categories", "objectId": riga.categoryId};
                        newExpense.body.owner = {"__type": "Pointer", "className":"_User", "objectId": $window.localStorage['objectId'] };

                        //console.log (newExpense);
                        Requests.push(newExpense);
                }  
                console.log("exp LOC: sending batch data ");
                console.log(Requests);

                $http.post('https://api.parse.com/1/batch',{"requests": Requests},{
                    headers:{
                        'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                        'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                        'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                        'Content-Type':'application/json'
                    }
                }).success(function(data){
                    //[
                    //{"success":{"updatedAt":"2015-07-08T09:55:20.538Z"}},
                    //{"success":{"createdAt":"2015-07-08T09:55:20.536Z","objectId":"x0IO6X7Nx6"}}]
                    console.log("exp LOC: received response");
                    console.log(data);
                    console.log("exp LOC: updating sent data in db");
                    var  queryInsert = "update expense set status = 'S', objectId = ? where objectId = ?";
                    var queryUpdate = "update expense set status = 'S' where objectId = ?";
                    DB.db.transaction(
                        function(updatetransaction) {
                            for (var idx=0; idx<data.length; idx++){ 
                                if (!data[idx].success){
                                    console.log ("Exp LOC: failed sending " +result.rows.item(idx));
                                    if (!!data[idx].error)
                                        console.log (data[idx].error);
                                    continue; 
                                }
                                if (Requests[idx].method == "PUT"){
                                    updatetransaction.executeSql(queryUpdate, [result.rows.item(idx).objectId]);
                                }else{
                                    updatetransaction.executeSql(queryInsert, [ data[idx].success.objectId, result.rows.item(idx).objectId]);
                                }
                            };
                        },
                        function(error){
                            console.log("exp LOC: error updating remote data in db");
                            console.log("exp LOC: sync 0");
                            console.log(error);
                        },
                        function(){
                            var d = new Date();
                            //$window.localStorage['lastExpenseSync']  = d.toISOString();
                            console.log("exp LOC: succesfully synced remote data in db");
                            console.log("exp LOC: sync 0");
                            console.log("exp LOC: successfully synced expenses at " + $window.localStorage['lastExpenseSync'] );
                        }
                    )
                    console.log("exp LOC: finished sync");
                    self.syncing = 0;
                    self.localSync();

                }).error(function() {
                    console.log("exp LOC: error sending new expense " + riga.objectId + " to remote");
                    self.syncing = 0;
                    return;
                });
                 
            });
            
        }

        self.remoteSync = function(){

            //if (!$window.localStorage['lastExpenseSync']){
               $window.localStorage['lastExpenseSync'] = '2013-03-07T11:35:46.622Z';
            //}
            console.log("exp Rem: entering remote sync");
            if (self.syncing != 2){
                console.log("exp Rem: status not = 2, it is " + self.syncing + " exiting");
                return;
            }else{
                console.log("exp Rem: sync 3");
    			self.syncing = 3;
            }
           
            DB.query("SELECT max(updatedAt) as lastSync from expense").then(function(result){
            if ( (result.rows.length == 0) || (result.rows.item(0).lastSync == null) ){
               console.log("exp sync: lastSync is empty, init");
               $window.localStorage['lastExpenseSync'] = '2013-03-07T11:35:46.622Z';
            }else{
                $window.localStorage['lastExpenseSync'] = result.rows.item(0).lastSync;
                console.log("cat sync: lastSync is " + $window.localStorage['lastExpenseSync'] );
            }
             console.log("exp Rem: getting remote data");


                return $http.get('https://api.parse.com/1/classes/expenses',{
                    headers:{
                        'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                        'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
    					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                    },
    				params:  { 
    		            where: '{"updatedAt":{"$gte":{"__type":"Date","iso":"' + $window.localStorage['lastExpenseSync']  + '"}}}',
    					order: '-date',
    		            //limit: 2,
    		            // count: 1
    			   		'include': 'owner'
    	            }
                }).success(function(data){
                    console.log("exp Rem: succesfully received remote data");
    				var queryD = "delete from expense where objectId = '?'";
    				var queryI = "insert or replace into expense (objectId,categoryId,date,note,photo,value,createdAt,updatedAt,owner, owner_img, owner_username, owner_email, status, deleted) values (?,?,?,?,?,?,?,?,?,?,?,?,'S',?)"
    				if (!!data.results)
    					data = data.results;
    				var tmpData = [];
    				for(var idx = 0; idx < data.length; idx++){
    					tmpData.push([data[idx].objectId, data[idx].categoryID.objectId, data[idx].date, data[idx].note, data[idx].photo, data[idx].value, data[idx].createdAt, data[idx].updatedAt, data[idx].owner.objectId, data[idx].owner.img, data[idx].owner.username, data[idx].owner.email,data[idx].deleted]);
    				}


    				var bindingsArray = typeof tmpData !== 'undefined' ? tmpData : [];
    		        
                            console.log("exp Rem: inserting remote data in db");
                            DB.db.transaction(
                                function(innertransaction) {
                                    for (var idx=0; idx<bindingsArray.length; idx++){ 
                                        innertransaction.executeSql(queryI, bindingsArray[idx]);
                                    };
                                },
                                function(error){
                                    console.log("exp Rem: error inserting remote data in db");
                                    console.log("exp Rem: sync 0");
                                    self.syncing = 0;
                                    console.log(error);
                                },
                                function(){
                                    var d = new Date();
                                    //$window.localStorage['lastExpenseSync']  = d.toISOString();
                                    console.log("exp Rem: succesfully inserted remote data in db");
                                    console.log("exp Rem: sync 0");
                                    console.log("exp Rem: successfully synced expenses at " + $window.localStorage['lastExpenseSync'] );
                                    $rootScope.$broadcast("syncFinished");
                                    self.syncing = 0;
                                }
                            )


    			}).error(function() {
                    console.log("exp Rem: error fetching expense data from remote");
                    console.log("exp Rem: sync 0");
                    self.syncing = 0;
                });
            });    
        };
        self.getAll = function(date){
            return DB.query("SELECT expense.*,categories.objectId AS categoryID_objectId,categories.budget AS categoryID_budget, categories.icon AS categoryID_icon, categories.name AS categoryID_name, categories.shared AS categoryID_shared, categories.createdAt AS categoryID_createdAt, categories.updatedAt AS categoryID_updatedAt FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId where  strftime('%Y-%m', expense.date) = '"+date+"' and expense.deleted != '1'").then(function(result){
                return DB.fetchAll(result);
            });
        };		
        self.getMine = function(date){
            return DB.query("SELECT expense.*,categories.objectId AS categoryID_objectId,categories.budget AS categoryID_budget, categories.icon AS categoryID_icon, categories.name AS categoryID_name, categories.shared AS categoryID_shared, categories.createdAt AS categoryID_createdAt, categories.updatedAt AS categoryID_updatedAt FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId where  strftime('%Y-%m', expense.date) >= '"+date+"' and expense.deleted != '1' AND expense.owner = '" + $window.localStorage['objectId'] + "' order by expense.date desc").then(function(result){
				return DB.fetchAll(result);
			});
        };		
		
        self.getAllByCatId = function(categoryId,date){
            return DB.query("SELECT expense.*,categories.objectId AS categoryID_objectId,categories.budget AS categoryID_budget, categories.icon AS categoryID_icon, categories.name AS categoryID_name, categories.shared AS categoryID_shared, categories.createdAt AS categoryID_createdAt, categories.updatedAt AS categoryID_updatedAt FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId where  strftime('%Y-%m', expense.date) = '"+date+"' and expense.deleted != '1' AND expense.categoryID = '" + categoryId + "'").then(function(result){
                return DB.fetchAll(result);
            });
        };

        self.get = function(id){
            return DB.query("SELECT expense.*,categories.objectId AS categoryID_objectId,categories.budget AS categoryID_budget, categories.icon AS categoryID_icon, categories.name AS categoryID_name, categories.shared AS categoryID_shared, categories.createdAt AS categoryID_createdAt, categories.updatedAt AS categoryID_updatedAt FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId where expense.deleted != '1' AND expense.objectId = '" + id + "'").then(function(result){
                return DB.fetchAll(result);
            });
        };
        self.create = function(data){
            console.log("Create: sync 0");
            self.syncing = 0;
            var d = new Date();
            var tmpDate = d.toISOString();
            return DB.query(
                 "insert into expense (objectId,categoryId,date,note,photo,value,createdAt,updatedAt,owner, owner_img, owner_username, owner_email, status, deleted) values (?,?,?,?,?,?,?,?,?,?,?,?,'N','0')",
                ["FAKE_" + Date.now().toString() , data.categoryID_objectId, data.date.toISOString(), data.note, data.photo, data.value, tmpDate, tmpDate, $window.localStorage['objectId'], $window.localStorage['img'], $window.localStorage['username'], $window.localStorage['email']]
                ).then(function(result){
                console.log("Create: OK sync 0");
                self.syncing = 0;     
                return DB.fetchAll(result);
            });

            /*
            return $http.post('https://api.parse.com/1/classes/expenses',data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
             */
        };
        self.edit = function(id,data){
            console.log("Edit: sync 0");
            self.syncing = 0;
            return DB.query(
                 'update expense set categoryId = ?, date = ?, note = ?, photo = ?, value = ?, createdAt = ?, updatedAt = ?, status = "M" where objectId = ?',
                [data.categoryID.objectId, data.date.toISOString(), data.note, data.photo, data.value, data.createdAt, data.updatedAt, id]
                ).then(function(result){
                console.log("Edit: OK sync 0");
                self.syncing = 0;    
                return DB.fetchAll(result);
            });

                /*

            return $http.put('https://api.parse.com/1/classes/expenses/'+id,data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
*/
        };
        self.delete = function(id){
            console.log("Delete: sync 0");
            self.syncing = 0; 
            return DB.query(
                 "update expense set deleted = '1', status = 'M' where objectId = ?",
                [id]
                ).then(function(result){
                console.log("Delete: OK sync 0");
                self.syncing = 0; 
                return DB.fetchAll(result);
            });
            /*
            return $http.delete('https://api.parse.com/1/classes/expenses/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
            */
        };
		
		return self;
    
}]).value('PARSE_CREDENTIALS',{
    APP_ID: "WbAXovOrZQo9Mxr7TtPOXsxPuofZ0R8FEaW7qrTt",
    REST_API_KEY:"ZKeAoTzFyB7pa5Ar0PLhMrQXK3ynqw1ThXOh5Zzn"

});

