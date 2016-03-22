/**
 * @ngdoc directive
 * @module mhIntro
 * @name mhIntroHelperLayer
 * @restrict EA
 * @param {string} mhIntroHelperLayerOptions
 */
angular
    .module('mhIntro')
    .directive('mhIntroHelperLayer', function(){
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                mhIntroHelperLayerOptions: '='
            },
            template: '<div class="introjs-helperLayer " style="width: {{options.width}}px; height:{{options.height}}px; top:{{options.top}}px;left: {{options.left}}px;"></div>',
            link: function(scope, element, attrs){
                var options = {
                    top: 0,
                    left: 0,
                    height: document.documentElement.clientHeight-50,
                    width: document.documentElement.clientWidth
                };

                scope.$watch('mhIntroHelperLayerOptions', function(){
                    scope.options = angular.extend(options, scope.mhIntroHelperLayerOptions);
                });
            }
        }
    });