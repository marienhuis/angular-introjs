/**
 * @ngdoc directive
 * @module mhIntro
 * @name mhIntro
 * @restrict A
 * @param {string} mhIntro an angular expression evaluating to a key/value object. This will be used to pass in
 *                  the settings
 * @param {string} mhIntroApi an scope variable. This object will be filled
 *                  with API options. This can be used to control the mhIntro.
 */
angular
    .module('mhIntro')
    .directive('mhIntro', function($compile){
        return {
            restrict: 'A',
            //transclude: true,
            //template: '<b>Dit is intro</b>',
            scope: {
                mhIntro: '=',
                mhStartIntro: '=',
                mhIntroApi: '='
            },
            link: function(scope, element, attrs){

            },
            //All functions that start with 'this' will be the public API other sub directives and templates can use
            controller: function($scope, $element, $window){
                //TODO: intergrate with ui-router /include $route (use $injector to get $route)
                //TODO: emit events
                //TODO: check for window resize
                var items = []; //Init items, this will be filled with intro items
                var overlayDirective = "<mh-intro-overlay show='showOverlay'></mh-intro-overlay>";
                var helperLayerDirective = "<mh-intro-helper-layer mh-intro-helper-layer-options='helperLayerOptions'></mh-intro-helper-layer>";
                var introToolTipDirective = "<mh-intro-tooltip mh-intro-tooltip-options='tooltipOptions'></mh-intro-tooltip>";
                var currentStep = 0; //Init current step
                var bodyEl = angular.element(document).find('body');
                var callbacks = {}; //Object because we are going to use it as a hashmap

                //Add the overlayDirective to the DOM
                var el = $compile(overlayDirective)($scope);
                bodyEl.append(el);

                //Add the helperLayerDirective to the DOM
                el = $compile(helperLayerDirective)($scope);
                bodyEl.append(el);

                //Add the introToolTipDirective to the DOM
                el = $compile(introToolTipDirective)($scope);
                $element.append(el);

                function registerCallback(type, callback){
                    //Check if callback type is allready in the object otherwise create it
                    callbacks[type] = callbacks[type] || [];
                    //Add the callback
                    callbacks[type].push(callback);
                }

                //Loop over all the callbacks of a certain type and call them
                function notifyCallbacks(type){
                    angular.forEach(callbacks[type], function(callback){
                        callback();
                    })
                }

                function getOffset(el){
                    return {
                        top : parseInt(el.offsetTop),
                        left : parseInt(el.offsetLeft),
                        height : parseInt(el.offsetHeight),
                        width : parseInt(el.offsetWidth)
                    }
                }

                //TODO: debounce for performance
                //Recalculate on resize
                angular.element($window).bind('resize', function() {
                    var item = items[currentStep];
                    $scope.$apply(function(){
                        $scope.helperLayerOptions = getOffset(item[0]);
                        $scope.tooltipOptions = angular.extend($scope.helperLayerOptions,item.options);
                    })
                });

                //Start the intro
                this.startIntro = function(step){
                    console.log('items', items);
                    step = step || 0;
                    showOverlay();
                    this.goToStep(step);
                };

                //Register onchange callback so we can call it later
                this.onchange = function(providedCallback){
                    registerCallback('onchange', providedCallback);
                };

                //Register onbeforechange callback so we can call it later
                this.onbeforechange = function(providedCallback){
                    registerCallback('onbeforechange', providedCallback);
                };



                this.goToStep = function(step){
                    var item = items[step];

                    //Notify onchange callbacks
                    notifyCallbacks('onbeforechange');

                    //Make sure the element is high-lighted and prev is un-high-lighted
                    items[currentStep].removeClass('introjs-showElement introjs-relativePosition');
                    item.addClass('introjs-showElement introjs-relativePosition');

                    //Set options
                    item.options = item.options || {};

                    //Update current step
                    currentStep = step;

                    //Set the options for the helper layer
                    $scope.helperLayerOptions = getOffset(item[0]);

                    //Merge helperLayerOptions object with step options object
                    $scope.tooltipOptions = angular.extend($scope.helperLayerOptions,item.options);

                    //Notify onchange callbacks
                    notifyCallbacks('onchange');
                };

                var showOverlay = function(){
                    $scope.showOverlay = true;
                };

                this.getCurrentStep = function(){
                    return currentStep;
                };

                this.hideOverlay = function(){
                    $scope.showOverlay = false;
                };

                this.addItem = function (element) {
                    items.push(element)
                };

                this.next = function (element) {
                    this.goToStep(currentStep + 1);
                };

                this.prev = function (element) {
                    this.goToStep(currentStep - 1);
                };

                this.setTooltipText = function(text){
                    $scope.tooltipOptions.text = text;
                };

                //Reset the intro
                this.finish = function(){
                    currentStep = 0;
                    this.hideOverlay();
                    this.setTooltipText();
                    $scope.tooltipOptions.show = false;
                };

                this.getCurrentItem = function(){
                    return items[currentStep];
                };

                this.exit = function(){
                    this.finish();
                };

                //Way to stay compatible with the original. In stead of using the mhIntroItem directive
                // the use can create JS object with steps and selectors
                if($scope.mhIntro && $scope.mhIntro.steps){
                    var that = this;
                    angular.forEach($scope.mhIntro.steps, function(step){
                        that.addItem(angular.element(document.querySelector(step.element)));
                    })
                }

                $scope.tooltipOptions = {
                    show: true,
                    text: 'test 12343'
                };

                //API for controlling the intro directive (this will be passed back to the controller who initiated this directive)
                $scope.mhIntroApi = {
                    start: this.startIntro,
                    next: this.next,
                    prev: this.prev,
                    goToStep: this.goToStep,
                    showOverlay: showOverlay,
                    hideOverlay: this.hideOverlay,
                    getCurrentStep: this.getCurrentStep,
                    addItem: this.addItem,
                    finish: this.finish,
                    getCurrentItem: this.getCurrentItem,
                    onchange: this.onchange
                };
            }
        }
    });