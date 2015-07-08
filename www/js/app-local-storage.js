angular.module('appLocalStorage', [])

.factory('FeedStorage', function() {
  return {
    get: function() {
      var feeds = window.localStorage[feeds.feed.title];
      if(feeds) {
        return angular.fromJson(feeds);
      }
      return {};
    },
    save: function(feeds) {
      window.localStorage[feeds.feed.title] = angular.toJson(feeds);
    },
    clear: function() {
      window.localStorage.removeItem(feeds.feed.title);
    }
  }
})