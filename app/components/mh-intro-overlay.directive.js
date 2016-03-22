/**
 * @ngdoc directive
 * @module mhIntro
 * @name mhIntroOverlay
 * @restrict EA
 * @param {boolean} show hide or show the overlay
 */
angular
    .module('mhIntro')
    .directive('mhIntroOverlay', function(){
        return {
            restrict: 'EA',
            require: '^?mhIntro',
            replace: true,
            scope: {
                show: '='
            },
            template: '<div class="introjs-overlay" style="top: 0;bottom: 0; left: 0;right: 0;position: fixed;opacity: 0.8;display: {{show ? \'block\' : \'none\'}}"></div>',
            link: function(scope, element, attrs, mhIntro){
                element.on('click', function () {
                    console.log('KLIK!', scope.show);
                    scope.$apply(function(){
                        scope.show = false;
                        mhIntro.exit();
                    })
                })
            }
        }
    });