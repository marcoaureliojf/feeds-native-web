angular.module('sensationFeedPlugin.data', [])

// Data Structure: JSON Data Structure configuration
.factory('FeedPluginData', function(){
    
    var data = { url: 'json/structure.json' };
    
    return data;
})