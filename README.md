# ripplet.js

Most lightweight material design ripple effect generator with no dependencies.

[Demo](https://luncheon.github.io/ripplet.js/demo/)  


## Installation

### npm

```bash
$ npm install ripplet.js
```

```javascript
import ripplet from 'ripplet.js';

element.addEventListener('mousedown', ripplet);
```

### cdn

```html
<script src="https://cdn.jsdelivr.net/npm/ripplet.js"></script>
<script>
  element.addEventListener('mousedown', ripplet);
</script>
```


## API

### ripplet(targetSuchAsMouseEvent[, options])

Generate a ripplet immediately.

#### Parameters

* targetSuchAsMouseEvent: Object (required) (in most cases, pass the received MouseEvent object)

| Property name           | Description                              |
| ----------------------- | ---------------------------------------- |
| currentTarget           | Target element                           |
| clientX                 | Client x-coordinate of center of ripplet |
| clientY                 | Client y-coordinate of center of ripplet |

* options: Object (optional)

| Property name           | Default             | Description           |
| ----------------------- | ------------------- | --------------------- |
| className               | ""                  | Class name to be for the ripplet element (not for this library to use, but for user to style that element) |
| color                   | "rgba(0, 0, 0, .1)" | Ripplet color         |
| opacity                 | null                | Ripplet opacity (used when alpha channel of color property above is shared and difficult to change) |
| spreadingDuration       | ".4s"               | As its name suggests  |
| spreadingDelay          | "0s"                | As its name suggests  |
| spreadingTimingFunction | "linear"            | As its name suggests  |
| clearingDuration        | "1s"                | As its name suggests  |
| clearingDelay           | "0s"                | As its name suggests  |
| clearingTimingFunction  | "ease-in-out"       | As its name suggests  |

### defaultOptions

You can change the default ripplet options for your app.  
For example:

```javascript
import { defaultOptions } from 'ripplet';

defaultOptions.color = 'rgba(64, 128, 255, .2)';
```

or

```html
<script src="https://cdn.jsdelivr.net/npm/ripplet.js"></script>
<script>
  ripplet.defaultOptions.color = 'rgba(64, 128, 255, .2)';
</script>
```


## Differentiation

The most valuable feature of ripplet.js is **source code readability**.  
[There are only 90 lines of source code.](https://github.com/luncheon/ripplet.js/blob/master/src/index.ts)  
That purely creates two elements generating ripplet and removes them when the animation ends.

You can read, copy, and edit it.  
This is a very important feature.


## License

WTFPL
