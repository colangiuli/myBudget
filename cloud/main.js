// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});
 
Parse.Cloud.define("categoriesFull", function(request, response) {
    var query = new Parse.Query("expenses");
      query.ascending("categoryID");
      query.include(["categoryID"]);
      query.find({
        success: function(results) {
         //first reorder the array;
        function compare(a,b) {
          if (a.get("categoryID").id < b.get("categoryID").id)
             return -1;
          if (a.get("categoryID").id > b.get("categoryID").id)
            return 1;
          return 0;
        }
 
        results.sort(compare);
 
          var tmpResult = [];
          var parsedObj = [];
          var sum = 0
          var currentCategory = results[0].get("categoryID").id;
          parsedObj.push(currentCategory);
          for (var i = 0; i < results.length; i++) {
            if (results[i].get("categoryID").id == currentCategory){
                sum += parseFloat(results[i].get("value"));
            }else{
                tmpCat = results[i-1].get("categoryID");
                tmpResult.push({
                    "objectId": currentCategory, 
                    "name":tmpCat.get("name"),
                    "budget":tmpCat.get("budget"),
                    "icon":tmpCat.get("icon"),
                    "shared":tmpCat.get("shared"),
                    "used":sum.toFixed(2),
                    "createdAt":tmpCat.createdAt,
                    "updatedAt":tmpCat.updatedAt
                });
                sum = parseFloat(results[i].get("value"));
                currentCategory = results[i].get("categoryID").id;
                parsedObj.push(currentCategory);
            }
          }//fine for
            tmpCat = results[i-1].get("categoryID");
            tmpResult.push({
                "objectId": currentCategory, 
                "name":tmpCat.get("name"),
                "budget":tmpCat.get("budget"),
                "icon":tmpCat.get("icon"),
                "shared":tmpCat.get("shared"),
                "used":sum.toFixed(2),
                "createdAt":tmpCat.createdAt,
                "updatedAt":tmpCat.updatedAt
            });
            parsedObj.push(currentCategory);
            //console.log(tmpResult); 
 
            var query2 = new Parse.Query("categories");
            query2.ascending("name");
            query2.notContainedIn("objectId",parsedObj);
            query2.find({
            success: function(tmpResult, results2) {
                for (var idx = 0; idx < results2.length; idx++) {
                    tmpCat = results2[idx];
                    tmpResult.push({
                        "objectId": tmpCat.id, 
                        "name":tmpCat.get("name"),
                        "budget":tmpCat.get("budget"),
                        "icon":tmpCat.get("icon"),
                        "shared":tmpCat.get("shared"),
                        "used":"0,00",
                        "createdAt":tmpCat.createdAt,
                        "updatedAt":tmpCat.updatedAt
                    });
                }   
                //console.log(results2); 
                //console.log(tmpResult);   
                response.success(tmpResult);
            }.bind(this, tmpResult),    
            error: function() {
                  response.error("categories lookup failed");
            }
          }); 
 
        },
        error: function() {
          response.error("categories lookup failed");
        }
      });
 
 
});
 
Parse.Cloud.define("friend", function(request, response) {
    var userToFriend = new Parse.User();
    userToFriend.id = request.params.friendId;
  
    var roleName = "friendsOf_" + request.user.id;
    var roleQuery = new Parse.Query("_Role");
    roleQuery.equalTo("name", roleName);
    roleQuery.first().then(function(role) {
        role.getUsers().add(userToFriend);
        return role.save();
  
    }).then(function() {
        response.success("Success!");    
    });
});
 
Parse.Cloud.afterSave(Parse.User, function(request, response) {
    var user = request.object;
    if (user.existed()) { return; }
    var roleName = "friendsOf_" + user.id;
    var friendRole = new Parse.Role(roleName, new Parse.ACL(user));
    return friendRole.save().then(function(friendRole) {
        var acl = new Parse.ACL();
        acl.setReadAccess(friendRole, true);
        acl.setReadAccess(user, true);
        acl.setWriteAccess(user, true);
        var friendData = new Parse.Object("FriendData", {
          user: user,
          ACL: acl,
          profile: "my friend profile"
        });
        return friendData.save();
    });
});