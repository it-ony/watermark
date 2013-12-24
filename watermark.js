(function (window) {

    var document = window.document,
        $ = function (selector) {
            return document.querySelector(selector);
        },
        $$ = function (selector) {
            return Array.prototype.slice.call(document.querySelectorAll(selector));
        },
        watermark,
        files = [];

    $$(".drop-area").forEach(function (dropArea) {

        dropArea.addEventListener("dragenter", dragEnter);
        dropArea.addEventListener("dragleave", dragLeave);
        dropArea.addEventListener("dragover", dragOver);
        dropArea.addEventListener("drop", drop);

        function dragEnter(e) {
            e.target.classList.add("drag-over");
        }

        function dragOver(e) {
            e.preventDefault();
        }

        function dragLeave(e) {
            e.currentTarget.classList.remove("drag-over");
        }

        function drop(e) {
            e.currentTarget.classList.remove("drag-over");

            if (e.currentTarget.dropHandler) {
                try {
                    e.currentTarget.dropHandler(e);
                } finally {
                    e.preventDefault();
                }
            }

        }
    });

    $("#watermark-upload").dropHandler = function (e) {

        if (e.dataTransfer && e.dataTransfer.files.length) {

            var container = $("#watermark-container");
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            watermark = e.dataTransfer.files[0];
            container.appendChild(createImagePreview(watermark));

        }

    };


    $("#upload").dropHandler = function (e) {

        if (e.dataTransfer && e.dataTransfer.files) {
            var f = Array.prototype.slice.call(e.dataTransfer.files);
            files = files.concat(f);

            var container = $("#uploaded");

            f.forEach(function (file) {

                var div = document.createElement("div"),
                    meta = document.createElement("div");

                div.appendChild(createImagePreview(file));
                div.appendChild(meta);

                meta.className = "meta";
                meta.innerText = file.name;

                container.appendChild(div);
            });
        }


    };

    $("#progress").addEventListener("click", function (e) {
        e.preventDefault();

        if (!watermark) {
            alert("First upload a watermark image");
            return;
        }

        var progress = 0,
            watermarkImage,
            opacity = parseFloat($("#opacity").value) || 0.8,
            position = $("#position").selectedOptions[0].value,
            xPosition = /Right/.test(position) ? 1 : 0,
            yPosition = /bottom/.test(position) ? 1 : 0,
            xMarginSign = xPosition === 1 ? -1 : 1,
            yMarginSign = yPosition === 1 ? -1 : 1,
            watermarkHeight = parseFloat($("#watermarkHeight").value) || 2,
            imageHeight = parseFloat($("#imageHeight").value) || 13,
            xOffset = parseFloat($("#xOffset").value),
            yOffset = parseFloat($("#yOffset").value),
            format = $("#format").selectedOptions[0].value,
            extension = format.split("/")[1];

        //noinspection JSValidateTypes
        flow()
            .seq("watermark", function (cb) {
                loadFileAsImage(watermark, cb);
            })
            .seqEach(files, function (file, cb) {

                watermarkImage = this.vars.watermark;

                //noinspection JSValidateTypes
                flow()
                    .seq("image", function (cb) {
                        loadFileAsImage(file, cb);
                    })
                    .seq("result", function (cb) {
                        var canvas = document.createElement("canvas"),
                            image = this.vars.image;

                        canvas.setAttribute("width", image.width);
                        canvas.setAttribute("height", image.height);

                        var context = canvas.getContext("2d");

                        context.drawImage(image, 0, 0);

                        context.globalAlpha = opacity;

                        var relation = Math.min(image.height, image.width),
                            unitFactor = relation / imageHeight,
                            factor = watermarkHeight / imageHeight;

                        var watermarkHeightPx = factor * relation,
                            watermarkFactor = watermarkHeightPx / watermarkImage.height,
                            x = image.width * xPosition - watermarkImage.width * xPosition * watermarkFactor + xOffset * unitFactor * xMarginSign,
                            y = image.height * yPosition - watermarkImage.height * yPosition * watermarkFactor + yOffset * unitFactor * yMarginSign;

                        // draw watermark
                        context.drawImage(watermarkImage, x, y, watermarkImage.width * watermarkFactor, watermarkImage.height * watermarkFactor);

                        progress++;

                        canvas.toBlob(function(blob) {

                            var e = document.createEvent('MouseEvents'),
                                a = document.createElement('a');

                            a.download = file.name.replace(/\.\w+$/, "") + "_watermark." + extension;
                            a.href = window.URL.createObjectURL(blob);
                            a.dataset.downloadurl = [format, a.download, a.href].join(':');

                            e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                            a.dispatchEvent(e);

                            cb();
                        }, format, 0.8);


                    })
                    .exec(cb);
            })
            .exec(function (err) {
                err && console.error(err);
            });

    });


    function loadFileAsImage(file, callback) {

        // load image
        var img = new Image(),
            reader = new FileReader();

        img.onload = function () {
            callback(null, img);
        };

        img.onerror = function (e) {
            callback(e || true);
        };

        reader.onerror = function (evt) {
            callback(evt || true);
        };

        reader.onload = function (evt) {
            img.src = evt.target.result;
        };

        reader.readAsDataURL(file);

    }

    function createImagePreview(file) {

        var container = document.createElement("div");

        if (file instanceof File) {
            var reader = new FileReader();

            reader.onload = function (evt) {
                var img = new Image();
                img.src = evt.target.result;

                container.appendChild(img);
            };

            reader.readAsDataURL(file);
        } else {
            var img = new Image();
            img.src = file;
            container.appendChild(img);
        }

        container.className = "image-container";

        return container;
    }

})(window);