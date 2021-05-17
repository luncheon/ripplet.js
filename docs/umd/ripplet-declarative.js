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
      appendTo: 'auto',
  };
  var target2container2ripplet = new Map();
  var containerContainerTemplate;
  var findElementAppendTo = function (target, appendTo) {
      if (appendTo && appendTo !== 'auto') {
          return appendTo === 'target' ? target : appendTo === 'parent' ? target.parentElement : document.querySelector(appendTo);
      }
      while (target &&
          (target instanceof SVGElement ||
              target instanceof HTMLInputElement ||
              target instanceof HTMLSelectElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLImageElement ||
              target instanceof HTMLHRElement)) {
          target = target.parentElement;
      }
      return target;
  };
  function ripplet(_a, _options) {
      var currentTarget = _a.currentTarget, clientX = _a.clientX, clientY = _a.clientY;
      if (!(currentTarget instanceof Element)) {
          return;
      }
      var options = _options
          ? Object.keys(defaultOptions).reduce(function (merged, field) { return ((merged[field] = _options.hasOwnProperty(field) ? _options[field] : defaultOptions[field]), merged); }, {})
          : defaultOptions;
      if (!containerContainerTemplate) {
          var _containerContainerTemplate = document.createElement('div');
          _containerContainerTemplate.innerHTML =
              '<div style="float:left;position:relative;isolation:isolate;pointer-events:none"><div style="position:absolute;overflow:hidden;transform-origin:0 0"><div style="border-radius:50%;transform:scale(0)"></div></div></div>';
          containerContainerTemplate = _containerContainerTemplate.firstChild;
      }
      var targetRect = currentTarget.getBoundingClientRect();
      if (options.centered && options.centered !== 'false') {
          clientX = targetRect.left + targetRect.width * 0.5;
          clientY = targetRect.top + targetRect.height * 0.5;
      }
      else if (typeof clientX !== 'number' || typeof clientY !== 'number') {
          return;
      }
      else {
          var zoomReciprocal = 1 / (+getComputedStyle(document.body).zoom || 1);
          clientX = clientX * zoomReciprocal;
          clientY = clientY * zoomReciprocal;
      }
      var targetStyle = getComputedStyle(currentTarget);
      var applyCssVariable = function (value) {
          var match = value && /^var\((--.+)\)$/.exec(value);
          return match ? targetStyle.getPropertyValue(match[1]) : value;
      };
      var elementAppendTo = findElementAppendTo(currentTarget, options.appendTo);
      var containerContainerElement = elementAppendTo.appendChild(containerContainerTemplate.cloneNode(true));
      containerContainerElement.style.zIndex = ((+targetStyle.zIndex || 0) + 1);
      var containerElement = containerContainerElement.firstChild;
      {
          var containerRect = containerElement.getBoundingClientRect();
          var containerStyle = containerElement.style;
          containerStyle.top = targetRect.top - containerRect.top + "px";
          containerStyle.left = targetRect.left - containerRect.left + "px";
          containerStyle.width = targetRect.width + "px";
          containerStyle.height = targetRect.height + "px";
          containerStyle.opacity = applyCssVariable(options.opacity);
          containerStyle.borderTopLeftRadius = targetStyle.borderTopLeftRadius;
          containerStyle.borderTopRightRadius = targetStyle.borderTopRightRadius;
          containerStyle.borderBottomLeftRadius = targetStyle.borderBottomLeftRadius;
          containerStyle.borderBottomRightRadius = targetStyle.borderBottomRightRadius;
          containerStyle.clipPath = targetStyle.clipPath;
          containerRect = containerElement.getBoundingClientRect();
          var scaleX = targetRect.width / containerRect.width;
          var scaleY = targetRect.height / containerRect.height;
          containerStyle.transform = "scale(" + scaleX + "," + scaleY + ") translate(" + (targetRect.left - containerRect.left) + "px," + (targetRect.top - containerRect.top) + "px)";
      }
      {
          var distanceX = Math.max(clientX - targetRect.left, targetRect.right - clientX);
          var distanceY = Math.max(clientY - targetRect.top, targetRect.bottom - clientY);
          var radius = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          var rippletElement = containerElement.firstChild;
          var rippletStyle = rippletElement.style;
          var color = applyCssVariable(options.color);
          rippletStyle.backgroundColor = /^currentcolor$/i.test(color) ? targetStyle.color : color;
          rippletElement.className = options.className;
          rippletStyle.width = rippletStyle.height = radius + radius + "px";
          if (getComputedStyle(elementAppendTo).direction === 'rtl') {
              rippletStyle.marginRight = targetRect.right - clientX - radius + "px";
          }
          else {
              rippletStyle.marginLeft = clientX - targetRect.left - radius + "px";
          }
          rippletStyle.marginTop = clientY - targetRect.top - radius + "px";
          rippletStyle.transition = "transform " + applyCssVariable(options.spreadingDuration) + " " + applyCssVariable(options.spreadingTimingFunction) + " " + applyCssVariable(options.spreadingDelay) + ",opacity " + applyCssVariable(options.clearingDuration) + " " + applyCssVariable(options.clearingTimingFunction) + " " + applyCssVariable(options.clearingDelay);
          rippletElement.addEventListener('transitionend', function (event) {
              if (event.propertyName === 'opacity' && containerContainerElement.parentElement) {
                  containerContainerElement.parentElement.removeChild(containerContainerElement);
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
              container2ripplet.set(containerContainerElement, rippletElement);
          }
          // reflect styles by force layout and start transition
          rippletElement.offsetWidth; // tslint:disable-line:no-unused-expression
          rippletStyle.transform = '';
      }
      return containerContainerElement;
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
              options[s
                  .slice(0, index)
                  .trim()
                  .replace(/[a-zA-Z0-9_]-[a-z]/g, function ($0) { return $0[0] + $0[2].toUpperCase(); })] = s.slice(index + 1).trim();
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
      if (options.clearing !== 'false') {
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
