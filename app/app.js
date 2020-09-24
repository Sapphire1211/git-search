'use strict';

// Declare app level module which depends on views, and core components
var gitSearchApp = angular.module('gitSearchApp', ['ngResource', 'commonLib']);

gitSearchApp.controller('GitSearchPageController', function GitSearchPageController($scope, apiresource) {
  //Configs
  var queryPageSize = 30;
  $scope.viewPageSize = 10;
  var cacheExpiration = 60 * 60 * 1000;//One hour

  //Globals
  $scope.viewItems = undefined;
  $scope.viewPageIndex = 0;
  $scope.formMessageClass = undefined;
  $scope.formMessage = undefined;
  var repoDetails = {};
  var queryString = "";
  var queryPageIndex = 0;
  var viewPageItemCache = {};//{viewPageIndex: {items, timestamp}}
  var repoDetailsCache = {};//{itemId: {repoDetails, timestamp}}
  var showAlert = false;

  /**
   * Execute search with given input query string
   */
  $scope.searchNew = function(input){
    $scope.viewItems = undefined;
    $scope.viewPageIndex = 0;
    $scope.formMessageClass = undefined;
    $scope.formMessage = undefined;
    queryPageIndex = 0;
    viewPageItemCache = {};//{viewPageIndex: {items, timestamp}}
    queryString = input;
    $scope.getSearchPage(1);
  };

  /**
   * Get the search result based on next(+1) or prev(-1) button
   */
  $scope.getSearchPage = function(delta){
     $scope.viewPageIndex += delta;
     if(viewPageItemCache[$scope.viewPageIndex] !== undefined && viewPageItemCache[$scope.viewPageIndex].timestamp - new Date().getTime() < cacheExpiration){
        $scope.viewItems = viewPageItemCache[$scope.viewPageIndex].items;
        return;
     }
     queryPageIndex += delta > 0 ? 1 : -1;
     changeUIbeforeHttpCall();
     apiresource.search(
       {
          q: queryString,
          sort: "stars",
          order: "desc",
          page: queryPageIndex,
          per_page: queryPageSize,
       },
       function(data) {
          changeUIAfterHttpCall();
          if(data.items.length != 0){
             //Put the query result into the cache
             var count = 1;
             var viewPageIndex = (queryPageIndex  -  1) * queryPageSize / $scope.viewPageSize + 1;
             viewPageItemCache[viewPageIndex] = {'items' : [], timestamp: new Date().getTime()};
             for(var item of data.items){
                 if(count <= $scope.viewPageSize){
                    viewPageItemCache[viewPageIndex].items.push(item);
                    count++;
                 }else{
                    viewPageIndex++;
                    viewPageItemCache[viewPageIndex] = {'items' : [], timestamp: new Date().getTime()};
                    viewPageItemCache[viewPageIndex].items.push(item);
                    count = 2;
                 }
             }
             $scope.viewItems = viewPageItemCache[$scope.viewPageIndex].items;
          }else{
            $scope.formMessageClass = 'alert-warning';
            $scope.formMessage = "We couldn’t find any repositories matching \"" + queryString + "\".";
            $('.alert').removeClass('ng-hide');
          }
       },
       function(err) {
         changeUIAfterHttpCall();
         $scope.formMessageClass = 'alert-danger';
         $scope.formMessage = err;
         $('.alert').removeClass('ng-hide');
      });
  };
  
  /**
   * Get details for a given repo
   */
  $scope.getDetails = function(item){
      repoDetails = {}; 
      if(repoDetailsCache[item.id] !== undefined && repoDetailsCache[item.id].timestamp - new Date().getTime() < cacheExpiration){
         repoDetails = repoDetailsCache[item.id].repoDetails;
         setShowAlertFlag();
         showRepoDetails(item.id);
         return;
      }
      changeUIbeforeHttpCall();
      getCommits(item.owner.login, item.name, item.id);
      getForks(item.owner.login, item.name, item.id);
  };

  /**
   * Get recent commits for a given user for a given repo
   */
  var getCommits = function(ownerLogin, repoName, itemId){
    apiresource.getCommits(
      {
        owner: ownerLogin,
        repo: repoName
      },
      function(data) {
        var lastThreeCommitters = [];
        for(var i = 0; i < Math.min(3, data.length); i++){
            lastThreeCommitters.push(data[i].committer.login);
        }
        repoDetails.lastThreeCommits = {'content': lastThreeCommitters};
        setShowAlertFlag();
        showRepoDetails(itemId);
      },
      function(err) {
        repoDetails.lastThreeCommits = {'errorMessage': "Error in getting last 3 committers"};
        setShowAlertFlag();
        showRepoDetails(itemId);
      }); 
  };

  /**
   * Get recent forks for a given user for a given repo
   */
  var getForks = function(ownerLogin, repoName, itemId){
    apiresource.getForks(
      {
        owner: ownerLogin,
        repo: repoName
      },
      function(data) {
        if(data.length != 0){
           repoDetails.lastForkCreator = {'content': data[0].owner.login};
           getForkOwnerBio(data[0].owner.login, itemId);
        }else{
           repoDetails.lastForkCreator = {'content': "No fork has been created."};
        }
      },
      function(err) {
        repoDetails.lastForkCreator = {'errorMessage': "Error in getting fork creators"};
        setShowAlertFlag();
        showRepoDetails(itemId);
      });
  };

  /**
   * Get the owner's biography
   */
  var getForkOwnerBio = function(ownerLogin, itemId){
    apiresource.getOwner(
      {
        username: ownerLogin,
      },
      function(data) {
        repoDetails.lastForkCreatorBio = {'content': data.bio};
        setShowAlertFlag();
        showRepoDetails(itemId);
      },
      function(err) {
        repoDetails.lastForkCreatorBio = {'errorMessage': "Error in getting fork creator biography"};
        setShowAlertFlag();
        showRepoDetails(itemId);
      });
  };

  /**
   * Show repo details in an alert
   */
  var showRepoDetails = function(itemId){
      if(showAlert){
         changeUIAfterHttpCall();
         var alertMessage = "";
         if(repoDetails.lastThreeCommits.errorMessage !== undefined){
            alertMessage += repoDetails.lastThreeCommits.errorMessage + ".\n";
         }else{
            alertMessage += "Last 3 commits by " + repoDetails.lastThreeCommits.content + ".\n";
         }

         if(repoDetails.lastForkCreator.errorMessage !== undefined){
            alertMessage += repoDetails.lastForkCreator.errorMessage + ".\n";
         }else{
            alertMessage += "The last fork was created by " + repoDetails.lastForkCreator.content + ".\n";
         }

         if(repoDetails.lastForkCreatorBio.errorMessage !== undefined){
            alertMessage += repoDetails.lastForkCreatorBio.errorMessage + ".\n";
         }else{
            alertMessage += repoDetails.lastForkCreatorBio.content ? "The owner has this in their biography: " + repoDetails.lastForkCreatorBio.content
                            : "The owner has nothing in the biography.";
         }

         if(repoDetailsCache[itemId] === undefined && repoDetails.lastThreeCommits.content !== undefined && repoDetails.lastForkCreator.content !== undefined && repoDetails.lastForkCreatorBio.content !== undefined){
            repoDetailsCache[itemId] = {"repoDetails" : repoDetails, "timestamp": new Date().getTime()};
         }
         setTimeout(function() {
            alert(alertMessage);
            showAlert = false;
         },100);
      }
  };

  /**
   * Determine if repo details alert is ready to show
   */
  var setShowAlertFlag = function() {
      showAlert = repoDetails.lastThreeCommits !== undefined && repoDetails.lastForkCreator !== undefined && repoDetails.lastForkCreatorBio !== undefined;
  };
});
