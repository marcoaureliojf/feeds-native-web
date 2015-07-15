var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        
        ons.setDefaultDeviceBackButtonListener(function() {
            if (navigator.notification.confirm("Confirmar saida?", 
                function(index) {
                    if (index == 1) { // OK button
                        navigator.app.exitApp(); // Close the app
                    }
                }
            ));
        });
        
        // Open any external link with InAppBrowser Plugin
        $(document).on('click', 'a[href^=http], a[href^=https]', function(e){

            e.preventDefault();
            var $this = $(this); 
            var target = /*$this.data('inAppBrowser') ||*/ '_system';

            window.open($this.attr('href'), target);

        });

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
    
};

(function(){
    'use strict';
    var module = angular.module('sensationFeedPlugin', ['onsen', 'sensationFeedPlugin.data', 'ngSanitize','appLocalStorage', 'LocalStorageModule'])
    .service('isRefresh', function () {
        var refresh = false;
        return {
            getRefresh: function () {
                return refresh;
            },
            setRefresh: function(value) {
                refresh = value;
            }
        };
    }).service('CanalTitleIndex', function () {
        var index = "";
        return {
            getIndex: function () {
                return index;
            },
            setIndex: function(value) {
                index = value;
            }
        };
    });
    
    document.addEventListener('deviceready', function() {
        angular.bootstrap(document, ['sensationFeedPlugin']);       
    }, false);


    
    // Feed Plugin: Categories Controller
    module.controller('FeedPluginCategoriesController', function($scope, $http, FeedPluginData) {

        $http({method: 'GET', url: FeedPluginData.url}).
        success(function(data, status, headers, config) {
            $scope.categories = data.categories; 
        }).
        error(function(data, status, headers, config) {

        });

        $scope.showDetail = function(index) {
        var selectedItem = $scope.categories[index];
        FeedPluginData.selectedItem = selectedItem;
        $scope.ons.navigator.pushPage('feed-category.html', {title : selectedItem.title});
        }

    });
    
    // Feed Plugin: Category Controller
    module.controller('FeedPluginCategoryController', function($scope, $timeout, $http, FeedPluginData, FeedStorage, isRefresh, CanalTitleIndex) {


        $http({method: 'GET', url: FeedPluginData.url}).
        success(function(data, status, headers, config) {
        $scope.items = data.items;
        }).
        error(function(data, status, headers, config) {

        });        

        $scope.autoUpdate = function() {
           $timeout(function() {
                    $http({method: 'JSONP', url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=2.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent("http://avozdaserra.com.br/rss")}).
                    success(function(data, status, headers, config) {
                    $scope.title = data.responseData.feed.title;
                    $scope.description = data.responseData.feed.description;
                    $scope.link = data.responseData.feed.link;
                    $scope.feeds = data.responseData.feed.entries;
                    // Save feeds to the local storage
                    FeedStorage.save(data.responseData, CanalTitleIndex.getIndex());
                    window.plugins.toast.showShortTop('Hello there!', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
                    console.log('Recarregou!!');
                    $scope.autoUpdate();
                    }).
                    error(function(data) {   
                    console.log('Erro');
                    $scope.autoUpdate(); 
                    });
          }, 60000);
        };

        $scope.showDetail = function(index) {
        var selectedItem = $scope.items[index];
        FeedPluginData.selectedItem = selectedItem;
        isRefresh.setRefresh(false);
        CanalTitleIndex.setIndex(selectedItem.title);
        var paginaAtual = $scope.ons.navigator.getCurrentPage();
            if (paginaAtual.name =='feed-master.html') {
                //$scope.ons.navigator.popPage();
                $scope.ons.navigator.resetToPage('feed-master.html', {title : selectedItem.title, animation: "lift"});
            }else{
                $scope.ons.navigator.pushPage('feed-master.html', {title : selectedItem.title});
            }
        }; 



    });
    
    // Feed Plugin: Master Controller
    module.controller('FeedPluginMasterController', function($scope, $http, $timeout, FeedPluginData, FeedStorage, isRefresh, CanalTitleIndex) {
        
        $scope.badges = "";
        $scope.msg = "Carregando...";
        $scope.feeds = "";

        if (isRefresh.getRefresh()) {

        $http({method: 'JSONP', url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=2.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(FeedPluginData.selectedItem.url)}).
        success(function(data, status, headers, config) {
            
            if (!data.responseData) {
                $scope.data = FeedStorage.get(CanalTitleIndex.getIndex());
                $scope.msg = "Não foi possível obter dados. Visualizando feeds Off-Line";
                // Carrega dados para leitura offline
                $scope.title = $scope.data.feed.title;
                $scope.description = $scope.data.feed.description;
                $scope.link = $scope.data.feed.link;
                $scope.feeds = $scope.data.feed.entries;
            } else {
                $scope.title = data.responseData.feed.title;
                $scope.description = data.responseData.feed.description;
                $scope.link = data.responseData.feed.link;
                $scope.feeds = data.responseData.feed.entries;
                // Save feeds to the local storage
                FeedStorage.save(data.responseData, CanalTitleIndex.getIndex());
                $scope.msg = "";
            }

        }).
        error(function(data, status, headers, config) {
        $scope.msg = 'Poxa, aconteceu algo de errado:' + status; 
        });

        }else{
                $scope.data = FeedStorage.get(CanalTitleIndex.getIndex());
                if (!$scope.data.feed) {
                    $http({method: 'JSONP', url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=2.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(FeedPluginData.selectedItem.url)}).
                    success(function(data, status, headers, config) {
                    $scope.title = data.responseData.feed.title;
                    $scope.description = data.responseData.feed.description;
                    $scope.link = data.responseData.feed.link;
                    $scope.feeds = data.responseData.feed.entries;
                    // Save feeds to the local storage
                    FeedStorage.save(data.responseData, CanalTitleIndex.getIndex());
                    $scope.msg = "";
                    }).
                    error(function(data, status, headers, config) {
                    $scope.msg = 'Poxa, aconteceu algo de errado:' + status; 
                    });
                    }else{
                    // Carrega dados para leitura offline
                    $scope.title = $scope.data.feed.title;
                    $scope.description = $scope.data.feed.description;
                    $scope.link = $scope.data.feed.link;
                    $scope.feeds = $scope.data.feed.entries;
                    $scope.msg = "";
                }
        };

        var paginaSelecionada = FeedPluginData.selectedItem;

        var page = 1;
        // Define the number of the feed results in the page
        var pageSize = 20;


        $scope.paginationLimit = function(data) {
        return pageSize * page;
        };
        
        $scope.hasMoreItems = function() {
        return page < ($scope.feeds.length / pageSize);
        };

        $scope.showMoreItems = function() {
        page = page + 1;       
        }; 
        
        $scope.showDetail = function(index) {
        var selectedItem = $scope.feeds[index];
        FeedPluginData.selectedItem = selectedItem;
        isRefresh.setRefresh(false);
        CanalTitleIndex.setIndex(selectedItem.title);
        $scope.ons.navigator.pushPage('feed-detail.html', selectedItem);
        };
        
        $scope.loadFeed = function(index, action) {
        var selectedItem = $scope.feeds[index];
        FeedPluginData.selectedItem = selectedItem;
        isRefresh.setRefresh(false);
        CanalTitleIndex.setIndex(selectedItem.title);
        $scope.ons.navigator.pushPage('feed-detail.html', selectedItem);
        };
        
		$scope.mediaObject = function(item) {
			return (item && item.mediaGroups) ? item.mediaGroups[0].contents[0] : {url:''};
		};

		$scope.hasVideo = function(item) {
			var media = $scope.mediaObject(item);
            
            //JAVASCRIPT: condition ? val1 : val2
            //return media.type ? (media.type == "video/mp4") : (media.url ? (media.url.indexOf(".mp4") != -1) : false);
			return media.type ? (media.type == "video/mp4") : false;
		};
        
		$scope.hasAudio = function(item) {
			var media = $scope.mediaObject(item);
            
            //JAVASCRIPT: condition ? val1 : val2
			return media.type ? (media.type == "audio/mp3") : false;
		};


        $scope.load = function($done) {
          $timeout(function() {
                    $http({method: 'JSONP', url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=2.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(paginaSelecionada.url)}).
                    success(function(data, status, headers, config) {
                    $scope.title = data.responseData.feed.title;
                    $scope.description = data.responseData.feed.description;
                    $scope.link = data.responseData.feed.link;
                    $scope.feeds = data.responseData.feed.entries;
                    // Save feeds to the local storage
                    FeedStorage.save(data.responseData, CanalTitleIndex.getIndex());
                    $scope.msg = "";
                    }).
                    error(function(data, status, headers, config) {
                    $scope.msg = 'Poxa, aconteceu algo de errado:' + status; 
                    })
              .finally(function() {
                $scope.showAlert();
                $done();
              });
          }, 1000);
        };

        $scope.refresh = function(index) {
        var selectedItem = $scope.items[index];
        FeedPluginData.selectedItem = selectedItem;
        isRefresh.setRefresh(true);
        CanalTitleIndex.setIndex(selectedItem.title);
        $scope.ons.navigator.pushPage('feed-master.html', {title : selectedItem.title});
        };

        $scope.showAlert = function() {
        navigator.notification.alert(
            'You are the winner!',  // message
                        '',         // callback
            'Game Over',            // title
            'Done'                  // buttonName
            );
        };
        
    });

    // Feed Plugin: Detail Controller
    module.controller('FeedPluginDetailController', function($scope, $sce, FeedPluginData) {
        $scope.item = FeedPluginData.selectedItem;
        
		$scope.mediaObject = function(item) {
			return (item && item.mediaGroups) ? item.mediaGroups[0].contents[0] : {url:''};
		}

		$scope.hasVideo = function(item) {
			var media = $scope.mediaObject(item);
            
            //JAVASCRIPT: condition ? val1 : val2
            //return media.type ? (media.type == "video/mp4") : (media.url ? (media.url.indexOf(".mp4") != -1) : false);
			return media.type ? (media.type == "video/mp4") : false;
		}
        
		$scope.hasAudio = function(item) {
			var media = $scope.mediaObject(item);
            
            //JAVASCRIPT: condition ? val1 : val2
			return media.type ? (media.type == "audio/mp3") : false;
		}
        
        $scope.getTrustedResourceUrl = function(src) {
            return $sce.trustAsResourceUrl(src);
        }
        
        $scope.loadURL = function () {
            //target: The target in which to load the URL, an optional parameter that defaults to _self. (String)
            //_self: Opens in the Cordova WebView if the URL is in the white list, otherwise it opens in the InAppBrowser.
            //_blank: Opens in the InAppBrowser.
            //_system: Opens in the system's web browser.
            window.open($scope.item.link,'_system');
        }
        
        $scope.shareFeed = function () {
            
            var subject = $scope.item.title;
            var message = $scope.item.content;
            message = message.replace(/(<([^>]+)>)/ig,"");

            var link = $scope.item.link;
            
            //Documentation: https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
            //window.plugins.socialsharing.share('Message', 'Subject', 'Image', 'Link');
            window.plugins.socialsharing.share(message, subject, null, link);
        }
        
     });
    
    // Contact Controller
    module.controller('ContactController', function($scope) {

        $scope.submitForm = function() {
            
            window.plugin.email.open({
                to:      ['contato@m2arkiweb.com'],
                cc:      [''],
                bcc:     [''],
                subject: $scope.subject,
                body:    $scope.message
            });

        };

    });

})();

