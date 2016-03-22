angular
    .module('mhIntro', []);
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
/**
 * @license AngularJS v1.5.2
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {'use strict';

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *     Any commits to this file should be reviewed with security in mind.  *
 *   Changes to this file can potentially create security vulnerabilities. *
 *          An approval from 2 Core members with history of modifying      *
 *                         this file is required.                          *
 *                                                                         *
 *  Does the change somehow allow for arbitrary javascript to be executed? *
 *    Or allows for someone to change the prototype of built-in objects?   *
 *     Or gives undesired access to variables likes document or window?    *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var $sanitizeMinErr = angular.$$minErr('$sanitize');

/**
 * @ngdoc module
 * @name ngSanitize
 * @description
 *
 * # ngSanitize
 *
 * The `ngSanitize` module provides functionality to sanitize HTML.
 *
 *
 * <div doc-module-components="ngSanitize"></div>
 *
 * See {@link ngSanitize.$sanitize `$sanitize`} for usage.
 */

/**
 * @ngdoc service
 * @name $sanitize
 * @kind function
 *
 * @description
 *   Sanitizes an html string by stripping all potentially dangerous tokens.
 *
 *   The input is sanitized by parsing the HTML into tokens. All safe tokens (from a whitelist) are
 *   then serialized back to properly escaped html string. This means that no unsafe input can make
 *   it into the returned string.
 *
 *   The whitelist for URL sanitization of attribute values is configured using the functions
 *   `aHrefSanitizationWhitelist` and `imgSrcSanitizationWhitelist` of {@link ng.$compileProvider
 *   `$compileProvider`}.
 *
 *   The input may also contain SVG markup if this is enabled via {@link $sanitizeProvider}.
 *
 * @param {string} html HTML input.
 * @returns {string} Sanitized HTML.
 *
 * @example
   <example module="sanitizeExample" deps="angular-sanitize.js">
   <file name="index.html">
     <script>
         angular.module('sanitizeExample', ['ngSanitize'])
           .controller('ExampleController', ['$scope', '$sce', function($scope, $sce) {
             $scope.snippet =
               '<p style="color:blue">an html\n' +
               '<em onmouseover="this.textContent=\'PWN3D!\'">click here</em>\n' +
               'snippet</p>';
             $scope.deliberatelyTrustDangerousSnippet = function() {
               return $sce.trustAsHtml($scope.snippet);
             };
           }]);
     </script>
     <div ng-controller="ExampleController">
        Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <td>Directive</td>
           <td>How</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="bind-html-with-sanitize">
           <td>ng-bind-html</td>
           <td>Automatically uses $sanitize</td>
           <td><pre>&lt;div ng-bind-html="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng-bind-html="snippet"></div></td>
         </tr>
         <tr id="bind-html-with-trust">
           <td>ng-bind-html</td>
           <td>Bypass $sanitize by explicitly trusting the dangerous value</td>
           <td>
           <pre>&lt;div ng-bind-html="deliberatelyTrustDangerousSnippet()"&gt;
&lt;/div&gt;</pre>
           </td>
           <td><div ng-bind-html="deliberatelyTrustDangerousSnippet()"></div></td>
         </tr>
         <tr id="bind-default">
           <td>ng-bind</td>
           <td>Automatically escapes</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
       </div>
   </file>
   <file name="protractor.js" type="protractor">
     it('should sanitize the html snippet by default', function() {
       expect(element(by.css('#bind-html-with-sanitize div')).getInnerHtml()).
         toBe('<p>an html\n<em>click here</em>\nsnippet</p>');
     });

     it('should inline raw snippet if bound to a trusted value', function() {
       expect(element(by.css('#bind-html-with-trust div')).getInnerHtml()).
         toBe("<p style=\"color:blue\">an html\n" +
              "<em onmouseover=\"this.textContent='PWN3D!'\">click here</em>\n" +
              "snippet</p>");
     });

     it('should escape snippet without any filter', function() {
       expect(element(by.css('#bind-default div')).getInnerHtml()).
         toBe("&lt;p style=\"color:blue\"&gt;an html\n" +
              "&lt;em onmouseover=\"this.textContent='PWN3D!'\"&gt;click here&lt;/em&gt;\n" +
              "snippet&lt;/p&gt;");
     });

     it('should update', function() {
       element(by.model('snippet')).clear();
       element(by.model('snippet')).sendKeys('new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-html-with-sanitize div')).getInnerHtml()).
         toBe('new <b>text</b>');
       expect(element(by.css('#bind-html-with-trust div')).getInnerHtml()).toBe(
         'new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-default div')).getInnerHtml()).toBe(
         "new &lt;b onclick=\"alert(1)\"&gt;text&lt;/b&gt;");
     });
   </file>
   </example>
 */


/**
 * @ngdoc provider
 * @name $sanitizeProvider
 *
 * @description
 * Creates and configures {@link $sanitize} instance.
 */
function $SanitizeProvider() {
  var svgEnabled = false;

  this.$get = ['$$sanitizeUri', function($$sanitizeUri) {
    if (svgEnabled) {
      angular.extend(validElements, svgElements);
    }
    return function(html) {
      var buf = [];
      htmlParser(html, htmlSanitizeWriter(buf, function(uri, isImage) {
        return !/^unsafe:/.test($$sanitizeUri(uri, isImage));
      }));
      return buf.join('');
    };
  }];


  /**
   * @ngdoc method
   * @name $sanitizeProvider#enableSvg
   * @kind function
   *
   * @description
   * Enables a subset of svg to be supported by the sanitizer.
   *
   * <div class="alert alert-warning">
   *   <p>By enabling this setting without taking other precautions, you might expose your
   *   application to click-hijacking attacks. In these attacks, sanitized svg elements could be positioned
   *   outside of the containing element and be rendered over other elements on the page (e.g. a login
   *   link). Such behavior can then result in phishing incidents.</p>
   *
   *   <p>To protect against these, explicitly setup `overflow: hidden` css rule for all potential svg
   *   tags within the sanitized content:</p>
   *
   *   <br>
   *
   *   <pre><code>
   *   .rootOfTheIncludedContent svg {
   *     overflow: hidden !important;
   *   }
   *   </code></pre>
   * </div>
   *
   * @param {boolean=} regexp New regexp to whitelist urls with.
   * @returns {boolean|ng.$sanitizeProvider} Returns the currently configured value if called
   *    without an argument or self for chaining otherwise.
   */
  this.enableSvg = function(enableSvg) {
    if (angular.isDefined(enableSvg)) {
      svgEnabled = enableSvg;
      return this;
    } else {
      return svgEnabled;
    }
  };
}

function sanitizeText(chars) {
  var buf = [];
  var writer = htmlSanitizeWriter(buf, angular.noop);
  writer.chars(chars);
  return buf.join('');
}


// Regular Expressions for parsing tags and attributes
var SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
  // Match everything outside of normal chars and " (quote character)
  NON_ALPHANUMERIC_REGEXP = /([^\#-~ |!])/g;


// Good source of info about elements and attributes
// http://dev.w3.org/html5/spec/Overview.html#semantics
// http://simon.html5.org/html-elements

// Safe Void Elements - HTML5
// http://dev.w3.org/html5/spec/Overview.html#void-elements
var voidElements = toMap("area,br,col,hr,img,wbr");

// Elements that you can, intentionally, leave open (and which close themselves)
// http://dev.w3.org/html5/spec/Overview.html#optional-tags
var optionalEndTagBlockElements = toMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),
    optionalEndTagInlineElements = toMap("rp,rt"),
    optionalEndTagElements = angular.extend({},
                                            optionalEndTagInlineElements,
                                            optionalEndTagBlockElements);

// Safe Block Elements - HTML5
var blockElements = angular.extend({}, optionalEndTagBlockElements, toMap("address,article," +
        "aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5," +
        "h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,section,table,ul"));

// Inline Elements - HTML5
var inlineElements = angular.extend({}, optionalEndTagInlineElements, toMap("a,abbr,acronym,b," +
        "bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s," +
        "samp,small,span,strike,strong,sub,sup,time,tt,u,var"));

// SVG Elements
// https://wiki.whatwg.org/wiki/Sanitization_rules#svg_Elements
// Note: the elements animate,animateColor,animateMotion,animateTransform,set are intentionally omitted.
// They can potentially allow for arbitrary javascript to be executed. See #11290
var svgElements = toMap("circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph," +
        "hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline," +
        "radialGradient,rect,stop,svg,switch,text,title,tspan");

// Blocked Elements (will be stripped)
var blockedElements = toMap("script,style");

var validElements = angular.extend({},
                                   voidElements,
                                   blockElements,
                                   inlineElements,
                                   optionalEndTagElements);

//Attributes that have href and hence need to be sanitized
var uriAttrs = toMap("background,cite,href,longdesc,src,xlink:href");

var htmlAttrs = toMap('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' +
    'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' +
    'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' +
    'scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,' +
    'valign,value,vspace,width');

// SVG attributes (without "id" and "name" attributes)
// https://wiki.whatwg.org/wiki/Sanitization_rules#svg_Attributes
var svgAttrs = toMap('accent-height,accumulate,additive,alphabetic,arabic-form,ascent,' +
    'baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,' +
    'cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,' +
    'font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,' +
    'height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,' +
    'marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,' +
    'max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,' +
    'path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,' +
    'requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,' +
    'stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,' +
    'stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,' +
    'stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,' +
    'underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,' +
    'width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,' +
    'xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan', true);

var validAttrs = angular.extend({},
                                uriAttrs,
                                svgAttrs,
                                htmlAttrs);

function toMap(str, lowercaseKeys) {
  var obj = {}, items = str.split(','), i;
  for (i = 0; i < items.length; i++) {
    obj[lowercaseKeys ? angular.lowercase(items[i]) : items[i]] = true;
  }
  return obj;
}

var inertBodyElement;
(function(window) {
  var doc;
  if (window.document && window.document.implementation) {
    doc = window.document.implementation.createHTMLDocument("inert");
  } else {
    throw $sanitizeMinErr('noinert', "Can't create an inert html document");
  }
  var docElement = doc.documentElement || doc.getDocumentElement();
  var bodyElements = docElement.getElementsByTagName('body');

  // usually there should be only one body element in the document, but IE doesn't have any, so we need to create one
  if (bodyElements.length === 1) {
    inertBodyElement = bodyElements[0];
  } else {
    var html = doc.createElement('html');
    inertBodyElement = doc.createElement('body');
    html.appendChild(inertBodyElement);
    doc.appendChild(html);
  }
})(window);

/**
 * @example
 * htmlParser(htmlString, {
 *     start: function(tag, attrs) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * @param {string} html string
 * @param {object} handler
 */
function htmlParser(html, handler) {
  if (html === null || html === undefined) {
    html = '';
  } else if (typeof html !== 'string') {
    html = '' + html;
  }
  inertBodyElement.innerHTML = html;

  //mXSS protection
  var mXSSAttempts = 5;
  do {
    if (mXSSAttempts === 0) {
      throw $sanitizeMinErr('uinput', "Failed to sanitize html because the input is unstable");
    }
    mXSSAttempts--;

    // strip custom-namespaced attributes on IE<=11
    if (document.documentMode <= 11) {
      stripCustomNsAttrs(inertBodyElement);
    }
    html = inertBodyElement.innerHTML; //trigger mXSS
    inertBodyElement.innerHTML = html;
  } while (html !== inertBodyElement.innerHTML);

  var node = inertBodyElement.firstChild;
  while (node) {
    switch (node.nodeType) {
      case 1: // ELEMENT_NODE
        handler.start(node.nodeName.toLowerCase(), attrToMap(node.attributes));
        break;
      case 3: // TEXT NODE
        handler.chars(node.textContent);
        break;
    }

    var nextNode;
    if (!(nextNode = node.firstChild)) {
      if (node.nodeType == 1) {
        handler.end(node.nodeName.toLowerCase());
      }
      nextNode = node.nextSibling;
      if (!nextNode) {
        while (nextNode == null) {
          node = node.parentNode;
          if (node === inertBodyElement) break;
          nextNode = node.nextSibling;
          if (node.nodeType == 1) {
            handler.end(node.nodeName.toLowerCase());
          }
        }
      }
    }
    node = nextNode;
  }

  while (node = inertBodyElement.firstChild) {
    inertBodyElement.removeChild(node);
  }
}

function attrToMap(attrs) {
  var map = {};
  for (var i = 0, ii = attrs.length; i < ii; i++) {
    var attr = attrs[i];
    map[attr.name] = attr.value;
  }
  return map;
}


/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param value
 * @returns {string} escaped text
 */
function encodeEntities(value) {
  return value.
    replace(/&/g, '&amp;').
    replace(SURROGATE_PAIR_REGEXP, function(value) {
      var hi = value.charCodeAt(0);
      var low = value.charCodeAt(1);
      return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
    }).
    replace(NON_ALPHANUMERIC_REGEXP, function(value) {
      return '&#' + value.charCodeAt(0) + ';';
    }).
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;');
}

/**
 * create an HTML/XML writer which writes to buffer
 * @param {Array} buf use buf.join('') to get out sanitized html string
 * @returns {object} in the form of {
 *     start: function(tag, attrs) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * }
 */
function htmlSanitizeWriter(buf, uriValidator) {
  var ignoreCurrentElement = false;
  var out = angular.bind(buf, buf.push);
  return {
    start: function(tag, attrs) {
      tag = angular.lowercase(tag);
      if (!ignoreCurrentElement && blockedElements[tag]) {
        ignoreCurrentElement = tag;
      }
      if (!ignoreCurrentElement && validElements[tag] === true) {
        out('<');
        out(tag);
        angular.forEach(attrs, function(value, key) {
          var lkey=angular.lowercase(key);
          var isImage = (tag === 'img' && lkey === 'src') || (lkey === 'background');
          if (validAttrs[lkey] === true &&
            (uriAttrs[lkey] !== true || uriValidator(value, isImage))) {
            out(' ');
            out(key);
            out('="');
            out(encodeEntities(value));
            out('"');
          }
        });
        out('>');
      }
    },
    end: function(tag) {
      tag = angular.lowercase(tag);
      if (!ignoreCurrentElement && validElements[tag] === true && voidElements[tag] !== true) {
        out('</');
        out(tag);
        out('>');
      }
      if (tag == ignoreCurrentElement) {
        ignoreCurrentElement = false;
      }
    },
    chars: function(chars) {
      if (!ignoreCurrentElement) {
        out(encodeEntities(chars));
      }
    }
  };
}


/**
 * When IE9-11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1' attribute to declare
 * ns1 namespace and prefixes the attribute with 'ns1' (e.g. 'ns1:xlink:foo'). This is undesirable since we don't want
 * to allow any of these custom attributes. This method strips them all.
 *
 * @param node Root element to process
 */
function stripCustomNsAttrs(node) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    var attrs = node.attributes;
    for (var i = 0, l = attrs.length; i < l; i++) {
      var attrNode = attrs[i];
      var attrName = attrNode.name.toLowerCase();
      if (attrName === 'xmlns:ns1' || attrName.indexOf('ns1:') === 0) {
        node.removeAttributeNode(attrNode);
        i--;
        l--;
      }
    }
  }

  var nextNode = node.firstChild;
  if (nextNode) {
    stripCustomNsAttrs(nextNode);
  }

  nextNode = node.nextSibling;
  if (nextNode) {
    stripCustomNsAttrs(nextNode);
  }
}



// define ngSanitize module and register $sanitize service
angular.module('ngSanitize', []).provider('$sanitize', $SanitizeProvider);

/* global sanitizeText: false */

/**
 * @ngdoc filter
 * @name linky
 * @kind function
 *
 * @description
 * Finds links in text input and turns them into html links. Supports `http/https/ftp/mailto` and
 * plain email address links.
 *
 * Requires the {@link ngSanitize `ngSanitize`} module to be installed.
 *
 * @param {string} text Input text.
 * @param {string} target Window (`_blank|_self|_parent|_top`) or named frame to open links in.
 * @param {object|function(url)} [attributes] Add custom attributes to the link element.
 *
 *    Can be one of:
 *
 *    - `object`: A map of attributes
 *    - `function`: Takes the url as a parameter and returns a map of attributes
 *
 *    If the map of attributes contains a value for `target`, it overrides the value of
 *    the target parameter.
 *
 *
 * @returns {string} Html-linkified and {@link $sanitize sanitized} text.
 *
 * @usage
   <span ng-bind-html="linky_expression | linky"></span>
 *
 * @example
   <example module="linkyExample" deps="angular-sanitize.js">
     <file name="index.html">
       <div ng-controller="ExampleController">
       Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <th>Filter</th>
           <th>Source</th>
           <th>Rendered</th>
         </tr>
         <tr id="linky-filter">
           <td>linky filter</td>
           <td>
             <pre>&lt;div ng-bind-html="snippet | linky"&gt;<br>&lt;/div&gt;</pre>
           </td>
           <td>
             <div ng-bind-html="snippet | linky"></div>
           </td>
         </tr>
         <tr id="linky-target">
          <td>linky target</td>
          <td>
            <pre>&lt;div ng-bind-html="snippetWithSingleURL | linky:'_blank'"&gt;<br>&lt;/div&gt;</pre>
          </td>
          <td>
            <div ng-bind-html="snippetWithSingleURL | linky:'_blank'"></div>
          </td>
         </tr>
         <tr id="linky-custom-attributes">
          <td>linky custom attributes</td>
          <td>
            <pre>&lt;div ng-bind-html="snippetWithSingleURL | linky:'_self':{rel: 'nofollow'}"&gt;<br>&lt;/div&gt;</pre>
          </td>
          <td>
            <div ng-bind-html="snippetWithSingleURL | linky:'_self':{rel: 'nofollow'}"></div>
          </td>
         </tr>
         <tr id="escaped-html">
           <td>no filter</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
     </file>
     <file name="script.js">
       angular.module('linkyExample', ['ngSanitize'])
         .controller('ExampleController', ['$scope', function($scope) {
           $scope.snippet =
             'Pretty text with some links:\n'+
             'http://angularjs.org/,\n'+
             'mailto:us@somewhere.org,\n'+
             'another@somewhere.org,\n'+
             'and one more: ftp://127.0.0.1/.';
           $scope.snippetWithSingleURL = 'http://angularjs.org/';
         }]);
     </file>
     <file name="protractor.js" type="protractor">
       it('should linkify the snippet with urls', function() {
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(4);
       });

       it('should not linkify snippet without the linky filter', function() {
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, mailto:us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#escaped-html a')).count()).toEqual(0);
       });

       it('should update', function() {
         element(by.model('snippet')).clear();
         element(by.model('snippet')).sendKeys('new http://link.');
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('new http://link.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(1);
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText())
             .toBe('new http://link.');
       });

       it('should work with the target property', function() {
        expect(element(by.id('linky-target')).
            element(by.binding("snippetWithSingleURL | linky:'_blank'")).getText()).
            toBe('http://angularjs.org/');
        expect(element(by.css('#linky-target a')).getAttribute('target')).toEqual('_blank');
       });

       it('should optionally add custom attributes', function() {
        expect(element(by.id('linky-custom-attributes')).
            element(by.binding("snippetWithSingleURL | linky:'_self':{rel: 'nofollow'}")).getText()).
            toBe('http://angularjs.org/');
        expect(element(by.css('#linky-custom-attributes a')).getAttribute('rel')).toEqual('nofollow');
       });
     </file>
   </example>
 */
angular.module('ngSanitize').filter('linky', ['$sanitize', function($sanitize) {
  var LINKY_URL_REGEXP =
        /((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,
      MAILTO_REGEXP = /^mailto:/i;

  var linkyMinErr = angular.$$minErr('linky');
  var isString = angular.isString;

  return function(text, target, attributes) {
    if (text == null || text === '') return text;
    if (!isString(text)) throw linkyMinErr('notstring', 'Expected string but received: {0}', text);

    var match;
    var raw = text;
    var html = [];
    var url;
    var i;
    while ((match = raw.match(LINKY_URL_REGEXP))) {
      // We can not end in these as they are sometimes found at the end of the sentence
      url = match[0];
      // if we did not match ftp/http/www/mailto then assume mailto
      if (!match[2] && !match[4]) {
        url = (match[3] ? 'http://' : 'mailto:') + url;
      }
      i = match.index;
      addText(raw.substr(0, i));
      addLink(url, match[0].replace(MAILTO_REGEXP, ''));
      raw = raw.substring(i + match[0].length);
    }
    addText(raw);
    return $sanitize(html.join(''));

    function addText(text) {
      if (!text) {
        return;
      }
      html.push(sanitizeText(text));
    }

    function addLink(url, text) {
      var key;
      html.push('<a ');
      if (angular.isFunction(attributes)) {
        attributes = attributes(url);
      }
      if (angular.isObject(attributes)) {
        for (key in attributes) {
          html.push(key + '="' + attributes[key] + '" ');
        }
      } else {
        attributes = {};
      }
      if (angular.isDefined(target) && !('target' in attributes)) {
        html.push('target="',
                  target,
                  '" ');
      }
      html.push('href="',
                url.replace(/"/g, '&quot;'),
                '">');
      addText(text);
      html.push('</a>');
    }
  };
}]);


})(window, window.angular);

angular
    .module('app', [
        'ngSanitize',
        'mhIntro'
    ]);
angular
    .module('app')
    .factory('confirmService', function(win) {
        var confirmations = {};

        var serviceApi = {
            setConfirm : setConfirm,
            getConfirmations: getConfirmations
        };
        return serviceApi;

        function setConfirm(key, value){
            confirmations[key] = value;
        }

        function setConfirmations(){

        }

        function getConfirmations(){
            return confirmations;
        }
    });
angular
    .module('app')
    .controller('test', function($scope){
        console.log('INIT test controller');
        $scope.naam='marien';

        console.log('current step', $scope.intro.getCurrentStep());
        console.log('options naam', $scope.options.name);



        $scope.intro.onbeforechange(function(){
            console.log('CHANGED!');
        });

        $scope.intro.onchange(function(){
            console.log('CHANGED!');
        });
    })
    .controller('mainController', function($scope, $timeout){

        //Instead of sub directives mhIntro also supports a array of steps. So it's compatible with intro.js
        $scope.introOptions = {
            /*
            steps: [
                {
                    element: '#marien',
                    intro: "First tooltip"
                },
                {
                    element: '#marien2',
                    intro: "Second tooltip",
                    position: 'right'
                }
            ]
            */
        };

        //mhIntro will link the his API to this variable
        $scope.introApi = {};

        //The intro API will be linked on the next digest, so we place it in a $timeout
        $timeout(function () {
            $scope.introApi.onchange(function(){
                console.log('mainController detect change');
            });
            //$scope.startIntro();
            console.log($scope.introApi);
            $scope.introApi.start(1);
            //$scope.introApi.hideOverlay();
        });

    });




