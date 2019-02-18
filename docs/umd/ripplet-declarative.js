(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.ripplet = factory());
}(this, function () { 'use strict';

  var defaultOptions = {
      className: '',
      color: 'rgba(0,0,0,.1)',
      opacity: null,
      spreadingDuration: '.4s',
      spreadingDelay: '0s',
      spreadingTimingFunction: 'linear',
      clearingDuration: '1s',
      clearingDelay: '0s',
      clearingTimingFunction: 'ease-in-out',
      centered: false,
      appendTo: 'body',
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
      var documentElement = document.documentElement, body = document.body;
      var containerElement = document.createElement('div');
      var removingElement = containerElement;
      {
          var appendToParent = options.appendTo === 'parent';
          var targetStyle = getComputedStyle(currentTarget);
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
          containerStyle.zIndex = "" + ((parseInt(targetStyle.zIndex, 10) || 0) + 1);
          containerStyle.opacity = options.opacity;
          copyStyles(containerStyle, targetStyle, ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'webkitClipPath', 'clipPath']);
      }
      {
          var distanceX = Math.max(clientX - targetRect.left, targetRect.right - clientX);
          var distanceY = Math.max(clientY - targetRect.top, targetRect.bottom - clientY);
          var radius = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          var rippletElement = containerElement.appendChild(document.createElement('div'));
          var rippletStyle = rippletElement.style;
          rippletElement.className = options.className;
          rippletStyle.backgroundColor = options.color;
          rippletStyle.width = rippletStyle.height
              = radius * 2 + "px";
          rippletStyle.marginLeft = clientX - targetRect.left - radius + "px";
          rippletStyle.marginTop = clientY - targetRect.top - radius + "px";
          rippletStyle.borderRadius = '50%';
          rippletStyle.transition =
              "transform " + options.spreadingDuration + " " + options.spreadingTimingFunction + " " + options.spreadingDelay +
                  (",opacity " + options.clearingDuration + " " + options.clearingTimingFunction + " " + options.clearingDelay);
          rippletStyle.transform = 'scale(0)';
          // reflect styles by force layout
          // tslint:disable-next-line:no-unused-expression
          rippletElement.offsetTop;
          rippletElement.addEventListener('transitionend', function (event) {
              if (event.propertyName === 'opacity' && removingElement.parentElement) {
                  removingElement.parentElement.removeChild(removingElement);
              }
          });
          rippletStyle.transform = '';
          rippletStyle.opacity = '0';
      }
      return containerElement;
  }
  function copyStyles(destination, source, properties) {
      for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
          var property = properties_1[_i];
          destination[property] = source[property];
      }
  }

  // use passive event listener if possible
  var eventListenerOptions = true;
  {
      var testOptions = {
          get passive() {
              eventListenerOptions = { passive: true, capture: true };
              return true;
          },
      };
      var noop = function () { };
      addEventListener('test', noop, testOptions);
      removeEventListener('test', noop, testOptions);
  }
  addEventListener('mousedown', function (event) {
      if (event.button !== 0) {
          return;
      }
      var currentTarget = findRippletTarget(event.target);
      if (currentTarget) {
          ripplet({ currentTarget: currentTarget, clientX: event.clientX, clientY: event.clientY }, parseOptions(currentTarget.getAttribute('data-ripplet')));
      }
  }, eventListenerOptions);
  function parseOptions(optionsString) {
      if (!optionsString) {
          return;
      }
      var options = {};
      for (var _i = 0, _a = optionsString.split(';'); _i < _a.length; _i++) {
          var s = _a[_i];
          var index = s.indexOf(':');
          options[s.slice(0, index).trim().replace(/[a-zA-Z0-9_]-[a-z]/g, function ($0) { return $0[0] + $0[2].toUpperCase(); })] = s.slice(index + 1).trim();
      }
      return options;
  }
  // Element.prototype.closest is not implemented in IE
  // https://caniuse.com/#feat=element-closest
  function findRippletTarget(element) {
      while (element && !element.hasAttribute('data-ripplet')) {
          element = element.parentElement;
      }
      return element;
  }

  var named = /*#__PURE__*/Object.freeze({
    default: ripplet,
    defaultOptions: defaultOptions
  });

  Object.keys(named).forEach(function (name) { ripplet[name] = named[name]; });

  return ripplet;

}));
