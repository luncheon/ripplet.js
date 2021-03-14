(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ripplet = factory());
}(this, (function () { 'use strict';

  var defaultOptions = {
      className: '',
      color: 'currentcolor',
      opacity: 0.1,
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
          ? Object.keys(defaultOptions).reduce(function (merged, field) { return ((merged[field] = _options.hasOwnProperty(field) ? _options[field] : defaultOptions[field]), merged); }, {})
          : defaultOptions;
      var targetRect = currentTarget.getBoundingClientRect();
      if (options.centered && options.centered !== 'false') {
          clientX = targetRect.left + targetRect.width * 0.5;
          clientY = targetRect.top + targetRect.height * 0.5;
      }
      else if (typeof clientX !== 'number' || typeof clientY !== 'number') {
          return;
      }
      var targetStyle = getComputedStyle(currentTarget);
      var applyCssVariable = function (value) {
          var match = value && /^var\((--.+)\)$/.exec(value);
          return match ? targetStyle.getPropertyValue(match[1]) : value;
      };
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
              copyStyles(containerStyle, targetStyle, [
                  'position',
                  'left',
                  'top',
                  'right',
                  'bottom',
                  'marginLeft',
                  'marginTop',
                  'marginRight',
                  'marginBottom',
              ]);
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
                  var containerContainer = (removingElement = currentTarget.parentElement.insertBefore(document.createElement('div'), currentTarget));
                  var containerContainerStyle = containerContainer.style;
                  containerContainerStyle.cssFloat = 'left';
                  containerContainerStyle.position = 'relative';
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
          containerStyle.zIndex = ((+targetStyle.zIndex || 0) + 1);
          containerStyle.opacity = applyCssVariable(options.opacity);
          copyStyles(containerStyle, targetStyle, [
              'borderTopLeftRadius',
              'borderTopRightRadius',
              'borderBottomLeftRadius',
              'borderBottomRightRadius',
              'webkitClipPath',
              'clipPath',
          ]);
      }
      {
          var distanceX = Math.max(clientX - targetRect.left, targetRect.right - clientX);
          var distanceY = Math.max(clientY - targetRect.top, targetRect.bottom - clientY);
          var radius = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          var rippletElement = document.createElement('div');
          var rippletStyle = rippletElement.style;
          var color = applyCssVariable(options.color);
          rippletStyle.backgroundColor = /^currentcolor$/i.test(color) ? targetStyle.color : color;
          rippletElement.className = options.className;
          rippletStyle.width = rippletStyle.height = radius * 2 + "px";
          if (getComputedStyle(appendToParent ? currentTarget.parentElement : body).direction === 'rtl') {
              rippletStyle.marginRight = targetRect.right - clientX - radius + "px";
          }
          else {
              rippletStyle.marginLeft = clientX - targetRect.left - radius + "px";
          }
          rippletStyle.marginTop = clientY - targetRect.top - radius + "px";
          rippletStyle.borderRadius = '50%';
          rippletStyle.transition = "transform " + applyCssVariable(options.spreadingDuration) + " " + applyCssVariable(options.spreadingTimingFunction) + " " + applyCssVariable(options.spreadingDelay) + ",opacity " + applyCssVariable(options.clearingDuration) + " " + applyCssVariable(options.clearingTimingFunction) + " " + applyCssVariable(options.clearingDelay);
          rippletStyle.transform = 'scale(0)';
          containerElement.appendChild(rippletElement);
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
                  target2container2ripplet.set(currentTarget, (container2ripplet = new Map()));
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
                  container2ripplet.forEach(function (r) { return (r.style.opacity = '0'); });
                  target2container2ripplet.delete(targetElement);
              }
          }
      }
      else {
          target2container2ripplet.forEach(function (container2ripplet) { return container2ripplet.forEach(function (r) { return (r.style.opacity = '0'); }); });
          target2container2ripplet.clear();
      }
  };
  ripplet.defaultOptions = defaultOptions;
  ripplet._ripplets = target2container2ripplet;

  var named = /*#__PURE__*/Object.freeze({
    __proto__: null,
    defaultOptions: defaultOptions,
    'default': ripplet
  });

  Object.keys(named).forEach(function (name) { ripplet[name] = named[name]; });

  return ripplet;

})));
