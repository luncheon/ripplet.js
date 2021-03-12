(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ripplet = factory());
}(this, (function () { 'use strict';

  var defaultOptions = {
      className: '',
      color: 'currentcolor',
      opacity: .1,
      spreadingDuration: '.4s',
      spreadingDelay: '0s',
      spreadingTimingFunction: 'linear',
      clearing: true,
      clearingDuration: '1s',
      clearingDelay: '0s',
      clearingTimingFunction: 'ease-in-out',
      centered: false,
      appendTo: 'body',
  };
  var target2container2ripplet = new Map();
  var copyStyles = function (destination, source, properties) {
      for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
          var property = properties_1[_i];
          destination[property] = source[property];
      }
  };
  function ripplet(_a, _options) {
      var currentTarget = _a.currentTarget, clientX = _a.clientX, clientY = _a.clientY;
      if (!(currentTarget instanceof Element)) {
          return;
      }
      var options = _options
          ? Object.keys(defaultOptions).reduce(function (merged, field) { return (merged[field] = _options.hasOwnProperty(field) ? _options[field] : defaultOptions[field], merged); }, {})
          : defaultOptions;
      var targetRect = currentTarget.getBoundingClientRect();
      if (options.centered && options.centered !== 'false') {
          clientX = targetRect.left + targetRect.width * .5;
          clientY = targetRect.top + targetRect.height * .5;
      }
      else if (typeof clientX !== 'number' || typeof clientY !== 'number') {
          return;
      }
      var targetStyle = getComputedStyle(currentTarget);
      var documentElement = document.documentElement, body = document.body;
      var containerElement = document.createElement('div');
      var appendToParent = options.appendTo === 'parent';
      var removingElement = containerElement;
      {
          var containerStyle = containerElement.style;
          if (targetStyle.position === 'fixed' || (targetStyle.position === 'absolute' && appendToParent)) {
              if (appendToParent) {
                  currentTarget.parentElement.insertBefore(containerElement, currentTarget);
              }
              else {
                  body.appendChild(containerElement);
              }
              copyStyles(containerStyle, targetStyle, ['position', 'left', 'top', 'right', 'bottom', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom']);
          }
          else if (appendToParent) {
              var parentStyle = getComputedStyle(currentTarget.parentElement);
              if (parentStyle.display === 'flex' || parentStyle.display === 'inline-flex') {
                  currentTarget.parentElement.insertBefore(containerElement, currentTarget);
                  containerStyle.position = 'absolute';
                  containerStyle.left = currentTarget.offsetLeft + "px";
                  containerStyle.top = currentTarget.offsetTop + "px";
              }
              else {
                  var containerContainer = removingElement
                      = currentTarget.parentElement.insertBefore(document.createElement('div'), currentTarget);
                  var containerContainerStyle = containerContainer.style;
                  containerContainerStyle.display = 'inline-block';
                  containerContainerStyle.position = 'relative';
                  containerContainerStyle.width = containerContainerStyle.height
                      = '0';
                  containerContainerStyle.cssFloat = targetStyle.cssFloat;
                  var containerContainerRect = containerContainer.getBoundingClientRect(); // this may be a slow operation...
                  containerContainer.appendChild(containerElement);
                  containerStyle.position = 'absolute';
                  containerStyle.top = targetRect.top - containerContainerRect.top + "px";
                  containerStyle.left = targetRect.left - containerContainerRect.left + "px";
              }
          }
          else {
              body.appendChild(containerElement);
              containerStyle.position = 'absolute';
              containerStyle.left = targetRect.left + documentElement.scrollLeft + body.scrollLeft + "px";
              containerStyle.top = targetRect.top + documentElement.scrollTop + body.scrollTop + "px";
          }
          containerStyle.overflow = 'hidden';
          containerStyle.pointerEvents = 'none';
          containerStyle.width = targetRect.width + "px";
          containerStyle.height = targetRect.height + "px";
          containerStyle.zIndex = (+targetStyle.zIndex || 0) + 1;
          containerStyle.opacity = options.opacity;
          copyStyles(containerStyle, targetStyle, ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'webkitClipPath', 'clipPath']);
      }
      {
          var distanceX = Math.max(clientX - targetRect.left, targetRect.right - clientX);
          var distanceY = Math.max(clientY - targetRect.top, targetRect.bottom - clientY);
          var radius = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          var rippletElement = containerElement.appendChild(document.createElement('div'));
          var rippletStyle = rippletElement.style;
          var matchColorVariable = options.color && options.color.match(/^var\((--.+)\)$/);
          rippletStyle.backgroundColor =
              matchColorVariable
                  ? targetStyle.getPropertyValue(matchColorVariable[1])
                  : /^currentcolor$/i.test(options.color)
                      ? targetStyle.color
                      : options.color;
          rippletElement.className = options.className;
          rippletStyle.width = rippletStyle.height
              = radius * 2 + "px";
          if (getComputedStyle(appendToParent ? currentTarget.parentElement : body).direction === 'rtl') {
              rippletStyle.marginRight = targetRect.right - clientX - radius + "px";
          }
          else {
              rippletStyle.marginLeft = clientX - targetRect.left - radius + "px";
          }
          rippletStyle.marginTop = clientY - targetRect.top - radius + "px";
          rippletStyle.borderRadius = '50%';
          rippletStyle.transition =
              "transform " + options.spreadingDuration + " " + options.spreadingTimingFunction + " " + options.spreadingDelay + ",opacity " + options.clearingDuration + " " + options.clearingTimingFunction + " " + options.clearingDelay;
          rippletStyle.transform = 'scale(0)';
          // reflect styles by force layout
          // tslint:disable-next-line:no-unused-expression
          rippletElement.offsetTop;
          rippletStyle.transform = '';
          rippletElement.addEventListener('transitionend', function (event) {
              if (event.propertyName === 'opacity' && removingElement.parentElement) {
                  removingElement.parentElement.removeChild(removingElement);
              }
          });
          if (options.clearing && options.clearing !== 'false') {
              rippletStyle.opacity = '0';
          }
          else {
              var container2ripplet = target2container2ripplet.get(currentTarget);
              if (!container2ripplet) {
                  target2container2ripplet.set(currentTarget, container2ripplet = new Map());
              }
              container2ripplet.set(containerElement, rippletElement);
          }
      }
      return containerElement;
  }
  ripplet.clear = function (targetElement, rippletContainerElement) {
      if (targetElement) {
          var container2ripplet = target2container2ripplet.get(targetElement);
          if (container2ripplet) {
              if (rippletContainerElement) {
                  var rippletElement = container2ripplet.get(rippletContainerElement);
                  rippletElement && (rippletElement.style.opacity = '0');
                  container2ripplet.delete(rippletContainerElement);
                  container2ripplet.size === 0 && target2container2ripplet.delete(targetElement);
              }
              else {
                  container2ripplet.forEach(function (r) { return r.style.opacity = '0'; });
                  target2container2ripplet.delete(targetElement);
              }
          }
      }
      else {
          target2container2ripplet.forEach(function (container2ripplet) { return container2ripplet.forEach(function (r) { return r.style.opacity = '0'; }); });
          target2container2ripplet.clear();
      }
  };
  ripplet.defaultOptions = defaultOptions;
  ripplet._ripplets = target2container2ripplet;

  // Element.prototype.closest is not implemented in IE
  // https://caniuse.com/#feat=element-closest
  var findRippletTarget = function (element) {
      while (element && !element.hasAttribute('data-ripplet')) {
          element = element.parentElement;
      }
      return element;
  };
  var parseOptions = function (optionsString) {
      var options = {};
      if (optionsString) {
          for (var _i = 0, _a = optionsString.split(';'); _i < _a.length; _i++) {
              var s = _a[_i];
              var index = s.indexOf(':');
              options[s.slice(0, index).trim().replace(/[a-zA-Z0-9_]-[a-z]/g, function ($0) { return $0[0] + $0[2].toUpperCase(); })] = s.slice(index + 1).trim();
          }
      }
      return options;
  };
  addEventListener('pointerdown', function (event) {
      if (event.button !== 0) {
          return;
      }
      var currentTarget = findRippletTarget(event.target);
      if (!currentTarget) {
          return;
      }
      var options = parseOptions(currentTarget.getAttribute('data-ripplet'));
      if (options.clearing !== 'true') {
          options.clearing = 'false';
          var clear_1 = function () {
              ripplet.clear(currentTarget, container);
              currentTarget.removeEventListener('pointerup', clear_1);
              currentTarget.removeEventListener('pointerleave', clear_1);
          };
          currentTarget.addEventListener('pointerup', clear_1);
          currentTarget.addEventListener('pointerleave', clear_1);
      }
      var container = ripplet({ currentTarget: currentTarget, clientX: event.clientX, clientY: event.clientY }, options);
  }, true);

  var named = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': ripplet,
    defaultOptions: defaultOptions
  });

  Object.keys(named).forEach(function (name) { ripplet[name] = named[name]; });

  return ripplet;

})));
