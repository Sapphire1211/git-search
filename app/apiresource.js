'use strict';
angular.module('commonLib').factory('apiresource', ['$resource', function ($resource) {
    var resource = $resource({}, {}, {
        search: { method: 'GET', url: 'https://api.github.com/search/repositories' },
        getCommits: { method: 'GET', isArray:true, url: 'https://api.github.com/repos/:owner/:repo/commits' },
        getForks: { method: 'GET', isArray:true, url: 'https://api.github.com/repos/:owner/:repo/forks' },
        getOwner: { method: 'GET', url: 'https://api.github.com/users/:username' },
    });
    return resource;
}]);