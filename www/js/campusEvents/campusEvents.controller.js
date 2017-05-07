// campus events
var EventsDataSource = "http://www.uwsp.edu/urc/news/_layouts/15/listfeed.aspx?List=%7B70FB69FA-B598-4A16-9CA3-83039A8366BE%7D";
// UWSP in the news
var UWSPNewsDataSource = "http://www.uwsp.edu/urc/uNews/_layouts/15/listfeed.aspx?List=%7B8E2F4347-D6B6-4FFA-8790-44C5172BEE5A%7D";
// News Releases & Events
var NewsDataSource = "http://www.uwsp.edu/urc/news/_layouts/15/listfeed.aspx?List=%7BA4138251-34C5-4F7A-9CA3-3EC9193DD42D%7D";


(function () {
    'use strict';

    function campusEventsController($scope, $ionicHistory, $timeout, $state) {
        updateDataSource();

        var src = $("#dataSourceSelect").change(function () {
            updateDataSource();
        });

    }

    angular
      .module('campusEvents', [])
      .controller('campusEventsController', campusEventsController);


})();

function updateDataSource() {

    // clear the html from the events list
    $("#eventsList").html("");

    // get the selected data source
    var src = $("#dataSourceSelect").val();

    switch (src) {
        case "EVENTS":
            GetEventsData(EventsDataSource);
            break;

        case "UWSPNEWS":
            GetEventsData(UWSPNewsDataSource);
            break;

        case "NEWS":
            GetEventsData(NewsDataSource);
            break;

    }
}



function GetEventsData(src) {
    $.ajax({
        url: src,
        data: "",
        crossDomain: true,
        type: "POST",
        dataType: "xml",
        timeout: 5000,
        success: function (data, textStatus) {
            ParseResult(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            alert("There was an error getting the events data.  Please make sure you are connected to the internet");
        }
    });

}

function ParseResult(xml_data) {

    // get the selected data source
    var src = $("#dataSourceSelect").val();

    switch (src) {
        case "EVENTS":
            ParseEventsResult(xml_data);
            break;

        case "UWSPNEWS":
            ParseUwspNewsResult(xml_data)
            break;

        case "NEWS":
            ParseUwspNewsResult(xml_data)
            break;

    }

}


function ParseNewsResult(xml_data) {
    alert("parse news result");
}


function ParseUwspNewsResult(xml_data) {

    $xml = $(xml_data);
    var items = $xml.find("item");

    for (var i = 0; i < items.length; i++) {

        var description_html = items[i].getElementsByTagName("description")[0].childNodes[0].data;

        var description_html = items[i].getElementsByTagName("description")[0].childNodes[0].data;
        var b = $("b", description_html).parent(); // save the value of the first a tag (for the link)
        var title = b.eq(0).clone().children().remove().end().text();
        var summary = b.eq(1).clone().children().remove().end().text();




        var img = $("img", description_html).attr("src");



        var b = $("div", description_html).parent();

        var pubDate = items[i].getElementsByTagName("pubDate")[0].innerHTML;

        var nLink = items[i].getElementsByTagName("link")[0].innerHTML;



        var nEvent = {
            title: title,
            summary: summary,
            link: nLink,
            date: pubDate,
            image: img
        };

        GenerateUwspNewsItem(nEvent);




    }

}


function GenerateUwspNewsItem(eventObject) {

    if (eventObject.image == null) {
        var icon = "<i class='icon ion-ios-paper-outline'></i>";
        var image = "";
    } else {
        var icon = "";
        var image = "<img class='newsImage' src='http://www.uwsp.edu/" + eventObject.image + "'/>";
    }


    var eventId = "news_" + $(".eventItem").length;

    var html = "<a href='#' id='" + eventId + "' class='eventListLink' onclick='window.open(\"" + eventObject.link + "\", \"_system\");'>" +
                    "<div class='eventItem item item-icon-left item-icon-right'>" +
                       "<div class='icon'>" + icon + "</div>" +
                       "<h3 class='eventItemTitle'>" + eventObject.title + "</h3>" +
                       "<p class='eventSummary'>" + eventObject.summary + "</p>" +
                       "<p class='eventPubDate'>Published:" + eventObject.date + "</p>" +
                       image +
                     "</div>"
    "</a>";

    $("#eventsList").append(html);

}






// once the web request is recieved, Parse the results into our Javascript Objets
function ParseEventsResult(xml_data) {

    $xml = $(xml_data);

    var items = $xml.find("item");

    for (var i = 0; i < items.length; i++) {

        // NOTE - if the format of the xml response ever changes, this code will need to be updated
        // The following code gets the CDATA secition in the description as text, 
        // then uses jQuery to select node values inside that text as an html context
        var description_html = items[i].getElementsByTagName("description")[0].childNodes[0].data;
        var a = $("a", description_html); // save the value of the first a tag (for the link)
        var cLink = a[0];

        // This jQuery selects only the date value, not the <b> element that labels it 
        var b = $("b", description_html).parent();
        var cDate = b.eq(2).clone().children().remove().end().text();




        // create a JSON representation of the current event being parsed
        var cEvent =
            {
                title: items[i].getElementsByTagName("title")[0].innerHTML,
                description: items[i].getElementsByTagName("description")[0].innerHTML,
                date: cDate,
                link: cLink
            };

        // only show events that have not yet occured (in case the XML is not updated)
        if (!isExpired(cEvent.date)) {
            GenerateEventListItem(cEvent);
        }

    }


}

// Adds a new list item to the ion-list defined on the template
function GenerateEventListItem(eventObject) {
    var eventId = "ev_" + $(".eventItem").length;

    var html = "<a href='#' id='" + eventId + "' class='eventListLink' onclick='window.open(\"" + eventObject.link + "\", \"_system\");'>" +
                    "<div class='eventItem item item-icon-left item-icon-left'>" +
                       "<div class='calendarItem icon'>" + MakeCalendarElement(eventObject.date) + "</div>" +
                       "<h3 class='eventItemTitle'>" + eventObject.title + "</h3>" +
                       "<p class='eventDate'>" + eventObject.date + "</p>" +
                     "</div>"
    "</a>";

    // The following code used DOM Traversal to asyncronously sort the element by date
    // get each date element
    var dates = $(".eventDate");

    var latestDateId = "";
    var thisDate = new Date(eventObject.date);

    if (dates.length > 0) {
        for (var i = 0; i < dates.length; i++) {
            if (latestDateId == "") {
                var thatDate = new Date(dates[i].innerHTML);

                // if the current element has a date later than our new element, 
                // mark that element as the latest one
                if (thatDate > thisDate || thatDate == thisDate) {
                    var x = dates[i];
                    // This jQuery chain gets the element's id of the <a> element
                    latestDateId = $(x).parent().parent().attr("id");
                    // if an element was found with a date greater than this one, add the new element just before it
                    $("#" + latestDateId).before(html);

                }
            }
        }
    }

    // if no element had a date bigger than this one, add it to the end
    if (latestDateId == "") {
        $("#eventsList").append(html);
    }
}

// This creates the HTML elements for the calendar
function MakeCalendarElement(evDate) {

    var date = new Date(evDate); // get today's date


    var month = "";
    switch (date.getMonth()) {
        case 0:
            month = "Jan";
            break;
        case 1:
            month = "Feb";
            break;
        case 2:
            month = "Mar";
            break;
        case 3:
            month = "Apr";
            break;
        case 4:
            month = "May";
            break;
        case 5:
            month = "Jun";
            break;
        case 6:
            month = "Jul";
            break;
        case 7:
            month = "Aug";
            break;
        case 8:
            month = "Sep";
            break;
        case 9:
            month = "Oct";
            break;
        case 10:
            month = "Nov";
            break;
        case 11:
            month = "Dec";
            break;
    }


    var x = "<div class='calMonth'>" + month + "</div>";
    x += "<div class='calDay'>" + date.getDate() + "</div>"
    return x;

}


// returns true if the supplied date is past today's date
function isExpired(eventDate_str) {
    var today = new Date();

    // to display events happening today, we have to set yesterday's date as the threshold
    today.setDate(today.getDate() - 1);
    var eventDate = new Date(eventDate_str);

    return (today > eventDate);
}
