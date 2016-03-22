/**
 * @ngdoc directive
 * @module mhIntro
 * @name mhIntroTooltip
 * @restrict EA
 * @param {string} mhIntroTooltipOptions an angular expression evaluating to a key/value object. This will be used to pass in
 *                  the settings
 */
angular
    .module('mhIntro')
    .directive('mhIntroTooltip', function(){
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                mhIntroTooltipOptions: '='
            },
            templateUrl: 'app/components/mh-intro-tooltip.tpl.html',
            require: '^mhIntro',
            link: function(scope, element, attrs, mhIntro){
                var options = {
                    top: 0,
                    left: 0,
                    height: document.documentElement.clientHeight-50,
                    //width: document.documentElement.clientWidth,
                    width: 200,
                    show: true,
                    position: 'bottom'
                };
                var item = mhIntro.getCurrentItem()[0];
                var itemHeight = item.offsetHeight;
                var itemWidth = item.offsetWidth;

                //Set the intro object on the scope so the view can use it
                scope.intro = mhIntro;

                scope.$watch('mhIntroTooltipOptions', function(){
                    //Extend the default options, we use copy so we don't change the original options object
                    scope.options = angular.extend(angular.copy(options), scope.mhIntroTooltipOptions);

                    //scope.options.width = 200;

                    //Position the tooltip
                    switch (scope.options.position) {
                        case 'left':
                            scope.options.top = scope.options.top + (scope.options.height / 2);
                            scope.options.left = scope.options.left - 200;
                            break;
                        case 'right':
                            scope.options.top = scope.options.top + (scope.options.height / 2);
                            scope.options.left = scope.options.left + scope.options.width;
                            break;
                        case 'bottom':
                            scope.options.top = scope.options.top + scope.options.height;
                            break;
                        default:
                            scope.options.top = scope.options.top + scope.options.height;
                    }

                }, true);
            }
        }
    });