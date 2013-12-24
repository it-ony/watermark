watermark
=========

See the latest version live at: http://it-ony.github.io/watermark/.

Adds a watermark with the same metric size to a batch of photos. Most tools, like aperture
will add the watermark pixel based, but if you have a bunch of cropped photos the watermark
will have different sizes.

This is an early version with a minimum feature set.

Optimization can be

* use web workers for image manipulation
* show progress
* batch download of photos
* allow text watermarks
* minify & merge files


License
---

This project is available under the MIT license. See [LICENSE](https://github.com/it-ony/watermark/blob/master/LICENSE) for details.

It used the following libraries

* [flow.js](https://github.com/it-ony/flow.js) (MIT)
* [Canvas to blob](https://github.com/blueimp/JavaScript-Canvas-to-Blob) by Sebastian Tschan (MIT)

