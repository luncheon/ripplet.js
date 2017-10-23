# ripplet.js
Most lightweight material design ripple effect generator.

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

* targetSuchAsMouseEvent: Object (required)

| Property name           | Description                              |
| ----------------------- | ---------------------------------------- |
| currentTarget           | Target element                           |
| clientX                 | Client x-coordinate of center of ripplet |
| clientY                 | Client y-coordinate of center of ripplet |

* options: Object (optional)

| Property name           | Default             |
| ----------------------- | ------------------- |
| className               | 'ripplet'           |
| color                   | 'rgba(0, 0, 0, .1)' |
| opacity                 | null                |
| spreadingDuration       | '.4s'               |
| spreadingDelay          | '0s'                |
| spreadingTimingFunction | 'ease-out'          |
| clearingDuration        | '1s'                |
| clearingDelay           | '0s'                |
| clearingTimingFunction  | 'ease-in-out'       |


## Differentiation

The most valuable feature of ripplet.js is **source code readability**.  
[There are only 85 lines of source code](https://github.com/luncheon/ripplet.js/blob/master/src/index.ts) that simply creates two elements generating ripplet.  
You can read, copy, and edit it.  
This is a very important feature.
