/**
 * @ngdoc directive
 * @module mhIntro
 * @name mhIntroItem
 * @restrict EA
 * @param {string} options an angular expression evaluating to a key/value object. This will be used to pass in
 *                  the options. The options will be put on the element object and can be used to override
 *                  existing options.
 */
angular
    .module('mhIntro')
    .directive('mhIntroItem', function(){
        return {
            restrict: 'EA',
            require: '^mhIntro',
            scope: {
                options: '=mhIntroItem'
            },
            link: function(scope, element, attrs, mhIntro){
                //Set the options on the element object
                element.options = scope.options;
                //Make the element knowt to the intro controller
                mhIntro.addItem(element);
            }
        }
    });