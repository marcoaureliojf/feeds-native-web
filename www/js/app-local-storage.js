angular.module('appLocalStorage', [])

.factory('FeedStorage', function() {
  return {
    get: function(title) {
      var feeds = window.localStorage[title];
      if(feeds) {
        return angular.fromJson(feeds);
      }
      return {};
    },
    save: function(feeds, title) {
      window.localStorage[title] = angular.toJson(feeds);
    },
    clear: function(feeds, title) {
      window.localStorage.removeItem(title);
    }
  }
})