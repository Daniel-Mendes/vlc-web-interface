var currentArt = null;

StartHere();

$('.start').click(function(){
    sendCommand({'command':'pl_pause'});
    $(this).blur();
});


$('.backward').click(function(){
    sendCommand({'command':'pl_previous'});
    $(this).blur();
});


$('.forward').click(function(){
    sendCommand({'command':'pl_next'});
    $(this).blur();
});

$('.repeat').click(function(){
    sendCommand({'command':'pl_loop'});
    $(this).blur();
});


$('.random').click(function(){
    sendCommand({'command':'pl_random'});
    $(this).blur();
});

$('#radio-channels').on('click', function (e) {
    var target = $(e.target),
        trackid = target.closest('.channel-link').data('trackid');

    sendCommand('command=pl_play&id=' + trackid);
});


//search input
$('#search').on("keyup", function() {
    var str = $('#search').val();

    $('#radio-channels .radio-channel').show();
    $('#dummytrack').hide();

    if(str == '') return;

    var str = str.toLowerCase();

    $('#radio-channels .radio-channel').each(function(){

        var station = $(this).find('.channel-name').text().toLowerCase();

        if(station.indexOf(str) == -1 ) $(this).hide();

    });
    return false;
});

function StartHere(){
    $.getJSON('/requests/playlist.json', function(data){
        var vlc_playlist = data.children[0].children;

        vlc_playlist.forEach(function(el, i){

            var clone = $('#dummytrack').clone();

            clone.find('.channel-link').attr('data-trackid', el.id);

            clone.find('.channel-name').text(el.name);

            clone.find('.channel-station').text(format_time(el.duration));

            clone.css('display', 'block');

            clone.appendTo('#radio-channels');

        });
    });
    setInterval(update_status, 1000);
}

function format_time(time){
    time = Math.round(time);

        var minutes = Math.floor(time / 60),
            seconds = time - minutes * 60;

        seconds = seconds < 10 ? '0' + seconds : seconds;

        return minutes + ":" + seconds;
}

function format_seconds(time) {
    var hms = time;   // your input string
    var a = hms.split(':'); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var seconds = (a[0]) * 60 + (+a[1]); 
    
    return seconds;
}

function updateArt(url) {
    $('.album').fadeIn(500, function () {
        $(this).attr('src', url);
    });
}

function sendCommand(params){
    $.get('/requests/status.xml', params);
}

function update_status(){
    $.get('/requests/status.xml', function(data){
        var status = {
            random: JSON.parse($('random', data).text()),
            repeat: JSON.parse($('loop', data).text()),
            state: $('state', data).text(),
            volume: $('volume', data).text(),

            id: $("currentplid", data).text(),
            time: $('time', data).text(),
            length: $('length', data).text(),
            title: $('[name="title"]', data).text(),
            artist: $('[name="artist"]', data).text(),
            album: $('[name="album"]', data).text(),
            artwork_url: $('[name="artwork_url"]', data).text()
        };

        if(status.state == 'playing'){
            $('.start span').removeClass('fa-play').addClass('fa-pause');
        } else {
            $('.start span').removeClass('fa-pause').addClass('fa-play');
        }

        $('.repeat').toggleClass('text-white', status.repeat);
        $('.random').toggleClass('text-white', status.random);

        $('.track-name').html(status.title);
        $('.track-artist').html(status.artist);
        $('.track-album').text(status.album);

        var progress = status.time * 100 / status.length

        $(".progress-duration").val(Math.round(progress));
        $(".progress-time").text(format_time(status.time));
        $(".progress-length").text(format_time(status.length));

        $(".current-progress").css("width", progress+"%");

        $(".volume-range").val(status.volume)

        $("#radio-channels").find(".channel-icon-playing").removeClass("fa-align-right");
        $("#radio-channels").find(`[data-trackid='${status.id}'] .channel-icon-playing`).addClass("fa-align-right");

        if (status.artwork_url != currentArt && status.artwork_url != "") {
            var tmp = new Date();
            currentArt = status.artwork_url;
            updateArt('/art?' + tmp.getTime());
        } else if (status.artwork_url == "" && currentArt != 'images/musik-album.png') {
            currentArt = 'images/musik-album.png';
            updateArt(currentArt);
        }
    });
}

$(".track-detail-desktop .progress-duration").on("input", function() {
    var progress = $(this).val();
    var length = $(this).parent().find(".progress-length").text();
    var lengthInSeconds = format_seconds(length);

    var time = progress * lengthInSeconds / 100;
    time = format_time(time)
    $(".progress-time").text(time);
});

$(".track-detail-desktop .progress-duration").on("mouseup",function() {
    var progress = $(this).val();
    var length = $(this).parent().find(".progress-length").text();
    var lengthInSeconds = format_seconds(length);

    var time = progress * lengthInSeconds / 100;

    sendCommand('command=seek&val=' + Math.round(time));
});

$(".downupPopup-content .progress-duration").on("input", function() {
    var progress = $(this).val();
    var length = $(this).next().find(".progress-length").text();
    var lengthInSeconds = format_seconds(length);

    var time = progress * lengthInSeconds / 100;
    time = format_time(time)
    $(".progress-time").text(time);
});

$(".downupPopup-content .progress-duration").on("change", function() {
    var progress = $(this).val();
    var length = $(this).next().find(".progress-length").text();
    var lengthInSeconds = format_seconds(length);

    var time = progress * lengthInSeconds / 100;
    
    sendCommand('command=seek&val=' + Math.round(time));
});

$(".volume-range").on("input", function() {
    var volumeInPercent = $(this).val();
    sendCommand('command=volume&val=' + parseInt(volumeInPercent));
})

$(document).ready(function () {
    $("#downupPopup-element").downupPopup({
        duration: "300",
        animation: "ease-in-out",
        background: true,
        radiusLeft: "10px",
        radiusRight: "10px",
        distance: 10,
        headerText: "",
        width: "100%",
        contentScroll: false
    });
});

$(".track-detail-mobile").click(function(event) {
    if ($(event.target).hasClass("start") || $(event.target).hasClass("fa-play") || $(event.target).hasClass("fa-pause")) {
        return;
    }

    const colorThief = new ColorThief();
    const img = document.querySelector(".album");

    var prominentColor = colorThief.getColor(img)

    $(".downupPopup-header").css("background", "rgba(" + prominentColor[0] + "," + prominentColor[1] + "," + prominentColor[2] + ",1)");
    $("#downupPopup-element").css("background", "linear-gradient(0deg, rgba(20,20,20,1) 20%, rgba(" + prominentColor[0] + "," + prominentColor[1] + "," + prominentColor[2] + ",1) 90%)");
    
    $("#downupPopup-element").downupPopup("open");
});