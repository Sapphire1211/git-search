'use strict';
// angular.module('commonLib', ['ngResource']);
angular.module('commonLib', ['ngResource']).config(['$httpProvider', '$locationProvider', function ($httpProvider,$locationProvider) {
    $httpProvider.defaults.headers.common['Accept'] = 'application/vnd.github.v3+json';
}]);