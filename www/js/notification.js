            scheduleMultiple = function () {
                cordova.plugins.notification.local.schedule([{
                    id: 1,
                    text: 'Multi Message 1'
                }, {
                    id: 2,
                    text: 'Multi Message 2'
                }, {
                    id: 3,
                    text: 'Multi Message 3'
                }]);
            };