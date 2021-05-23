/*
 * Copyright 2021, Ali Dinçer
 * Dual licensed under the MIT or GPL Version 3 or any later version licenses.
 * https://dincerali.com
 */

(function ($) {
    $.fn.downupPopup = function (options) {
        const $this = $(this);
        if (!$this.hasClass("downupPopup")) {
            $this.addClass("downupPopup")
                .addClass("no-act")
                .prepend('<div class="downupPopup-header"><svg class="downupPopup-kapat" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>');

            $this.find(".downupPopup-kapat").click(function () {
                $this.addClass("no-act");

                if ($("#dark-back")[0])
                    $("#dark-back").hide();

                $("body").css("overflow", "inherit");
            });

            $(document).on("click", "#dark-back", function () {
                $(this).hide();
                $this.addClass("no-act");
                $("body").css("overflow", "inherit");
            });

            if (typeof options === "object" || !options) { // obje olarak geliyorsa $().downupPopup({deneme:"deneme"}); veya boşsa
                // Default ayar
                var settings = $.extend({
                    duration: "300",
                    animation: "ease",
                    background: true,
                    radiusLeft: "10px",
                    radiusRight: "10px",
                    distance: 20,
                    headerText: "",
                    width: "100%",
                    contentScroll: false
                }, options);
                $this.attr("distance", settings.distance)
                    .find(".downupPopup-header")
                    .prepend('<span>' + settings.headerText + '</span>');

                setTimeout(() => {
                    $this.css('transition', 'transform ' + settings.duration + 'ms ' + settings.animation + '');
                    $this.css('border-radius', '' + settings.radiusLeft + ' ' + settings.radiusRight + ' 0px 0px');
                    $this.css('width', '' + settings.width + '');
                    const hgt = (((100 - settings.distance) - 10) + 3);
                    if (settings.contentScroll) {
                        $this.find(".downupPopup-content").css('height', '' + hgt + 'vh');
                        $this.find(".downupPopup-content").css('overflow-y', 'scroll');
                    }
                }, 100);

                if (settings.background == true) {
                    if (!$("#dark-back")[0])
                        $("body").append("<div id='dark-back'></div>");

                    $this.attr("bg", 1);
                }
            }
        }
        if (typeof options !== "object") {// obje değil de düz yazı geliyorsa $().downupPopup("open");
            if (options === "open") {
                $(".downupPopup").addClass("no-act");
                if ($this.attr("bg") == 1)
                    $("#dark-back").show();

                $this.removeClass("no-act")
                    .css('transform', 'translate(-50%, ' + $this.attr('distance') + 'vh)');

                $("body").css("overflow", "hidden");
            }

            if (options === "close") {
                if ($this.attr("bg") == 1)
                    $("#dark-back").hide();

                $this.addClass("no-act");
                $("body").css("overflow", "inherit");
            }
        }
    }
}(jQuery));