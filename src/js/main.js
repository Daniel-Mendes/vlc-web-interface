import "./jquery.min.js";
import "./color-thief.min.js";
import "./downupPopup.js";

let currentArt = null;

StartHere();

$(".start").on("click", function () {
    sendCommand({ command: "pl_pause" });
    $(this).blur();
});

$(".backward").on("click", function () {
    sendCommand({ command: "pl_previous" });
    $(this).blur();
});

$(".forward").on("click", function () {
    sendCommand({ command: "pl_next" });
    $(this).blur();
});

$(".repeat").on("click", function () {
    sendCommand({ command: "pl_loop" });
    $(this).blur();
});

$(".random").on("click", function () {
    sendCommand({ command: "pl_random" });
    $(this).blur();
});

$("#radio-channels").on("click", function (e) {
    const target = $(e.target);
    const trackid = target.closest(".channel-link").data("trackid");

    sendCommand("command=pl_play&id=" + trackid);
});

// search input
$("#search").on("keyup", function () {
    let str = $("#search").val();

    $("#radio-channels .radio-channel").show();
    $("#dummytrack").hide();

    if (str === "") return;

    str = str.toLowerCase();

    $("#radio-channels .radio-channel").each(function () {
        const station = $(this).find(".channel-name").text().toLowerCase();

        if (station.indexOf(str) === -1) $(this).hide();
    });
    return false;
});

function StartHere() {
    $.getJSON("/requests/playlist.json", function (data) {
        const vlcPlaylist = data.children[0].children;

        vlcPlaylist.forEach(function (el, i) {
            const clone = $("#dummytrack").clone();

            clone.find(".channel-link").attr("data-trackid", el.id);

            clone.find(".channel-name").text(el.name);

            clone.find(".channel-station").text(formatTime(el.duration));

            clone.css("display", "block");

            clone.appendTo("#radio-channels");
        });
    });

    setInterval(updateStatus, 1000);
}

function formatTime(time) {
    time = Math.round(time);

    const minutes = Math.floor(time / 60);
    let seconds = time - minutes * 60;

    seconds = seconds < 10 ? "0" + seconds : seconds;

    return minutes + ":" + seconds;
}

function formatSeconds(time) {
    const hms = time; // your input string
    const a = hms.split(":"); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    const seconds = a[0] * 60 + +a[1];

    return seconds;
}

function updateArt(url) {
    $(".album").fadeIn(500, function () {
        $(this).attr("src", url);
    });
}

function sendCommand(params) {
    $.get("/requests/status.xml", params);
}

function updateStatus() {
    $.get("/requests/status.xml", function (data) {
        const status = {
            random: JSON.parse($("random", data).text()),
            repeat: JSON.parse($("loop", data).text()),
            state: $("state", data).text(),
            volume: $("volume", data).text(),

            id: $("currentplid", data).text(),
            time: $("time", data).text(),
            length: $("length", data).text(),
            title: $('[name="title"]', data).text(),
            artist: $('[name="artist"]', data).text(),
            album: $('[name="album"]', data).text(),
            artwork_url: $('[name="artwork_url"]', data).text(),
        };

        if (status.state === "playing") {
            $(".start span").removeClass("fa-play").addClass("fa-pause");
        } else {
            $(".start span").removeClass("fa-pause").addClass("fa-play");
        }

        $(".repeat").toggleClass("text-white", status.repeat);
        $(".random").toggleClass("text-white", status.random);

        $(".track-name").text(status.title);
        $(".track-artist").text(status.artist);
        $(".track-album").text(status.album);

        const progress = Math.round((status.time * 100) / status.length);

        $(".progress-duration").val(progress);
        $(".progress-time").text(formatTime(status.time));
        $(".progress-length").text(formatTime(status.length));

        $(".progress-duration").css(
            "background",
            "linear-gradient(to right, #375a7f 0%, #375a7f " +
                progress +
                "%, #444 " +
                progress +
                "%, #444 100%)"
        );

        $(".volume-range").val(status.volume);
        const progressVolume = Math.round((status.volume * 100) / 256);
        $(".volume-range").css(
            "background",
            "linear-gradient(to right, #375a7f 0%, #375a7f " +
                progressVolume +
                "%, #444 " +
                progressVolume +
                "%, #444 100%)"
        );

        $("#radio-channels")
            .find(".channel-icon-playing")
            .removeClass("fa-align-right");
        $("#radio-channels")
            .find(`[data-trackid='${status.id}'] .channel-icon-playing`)
            .addClass("fa-align-right");

        if (status.artwork_url !== currentArt && status.artwork_url !== "") {
            const tmp = new Date();
            currentArt = status.artwork_url;
            updateArt("/art?" + tmp.getTime());
        } else if (
            status.artwork_url === "" &&
            currentArt !== "images/musik-album.png"
        ) {
            currentArt = "images/musik-album.png";
            updateArt(currentArt);
        }
    });
}

$(".track-detail-desktop .progress-duration").on("input", function () {
    const progress = $(this).val();
    const length = $(this).parent().find(".progress-length").text();
    const lengthInSeconds = formatSeconds(length);
    let time = (progress * lengthInSeconds) / 100;

    $(".progress-duration").css(
        "background",
        "linear-gradient(to right, #375a7f 0%, #375a7f " +
            progress +
            "%, #444 " +
            progress +
            "%, #444 100%)"
    );

    time = formatTime(time);
    $(".progress-time").text(time);
});

$(".track-detail-desktop .progress-duration").on("change", function () {
    const progress = $(this).val();
    const length = $(this).parent().find(".progress-length").text();
    const lengthInSeconds = formatSeconds(length);
    const time = (progress * lengthInSeconds) / 100;

    sendCommand("command=seek&val=" + Math.round(time));
});

$(".downupPopup-content .progress-duration").on("input", function () {
    const progress = $(this).val();
    const length = $(this).next().find(".progress-length").text();
    const lengthInSeconds = formatSeconds(length);

    $(".progress-duration").css(
        "background",
        "linear-gradient(to right, #375a7f 0%, #375a7f " +
            progress +
            "%, #444 " +
            progress +
            "%, #444 100%)"
    );

    let time = (progress * lengthInSeconds) / 100;
    time = formatTime(time);
    $(".progress-time").text(time);
});

$(".downupPopup-content .progress-duration").on("change", function () {
    const progress = $(this).val();
    const length = $(this).next().find(".progress-length").text();
    const lengthInSeconds = formatSeconds(length);

    const time = (progress * lengthInSeconds) / 100;

    sendCommand("command=seek&val=" + Math.round(time));
});

$(".volume-range").on("input", function () {
    const volume = $(this).val();
    const progressVolume = Math.round((volume * 100) / 256);

    $(".volume-range").css(
        "background",
        "linear-gradient(to right, #375a7f 0%, #375a7f " +
            progressVolume +
            "%, #444 " +
            progressVolume +
            "%, #444 100%)"
    );
    sendCommand("command=volume&val=" + parseInt(volume));
});

$(function () {
    $("#downupPopup-element").downupPopup({
        duration: "300",
        animation: "ease-in-out",
        background: true,
        radiusLeft: "10px",
        radiusRight: "10px",
        distance: 10,
        headerText: "",
        width: "100%",
        contentScroll: false,
    });
});

$(".track-detail-mobile").on("click", function (event) {
    if (
        $(event.target).hasClass("start") ||
        $(event.target).hasClass("fa-play") ||
        $(event.target).hasClass("fa-pause")
    ) {
        return;
    }

    const colorThief = new ColorThief();
    const img = document.querySelector(".album");

    const prominentColor = colorThief.getColor(img);

    $(".downupPopup-header").css(
        "background",
        "rgba(" +
            prominentColor[0] +
            "," +
            prominentColor[1] +
            "," +
            prominentColor[2] +
            ",1)"
    );
    $("#downupPopup-element").css(
        "background",
        "linear-gradient(0deg, rgba(20,20,20,1) 20%, rgba(" +
            prominentColor[0] +
            "," +
            prominentColor[1] +
            "," +
            prominentColor[2] +
            ",1) 90%)"
    );

    $("#downupPopup-element").downupPopup("open");
});
