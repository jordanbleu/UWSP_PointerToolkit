// Point this to the RSS feed which displays the events
var EventsDataSource = "http://www.uwsp.edu/urc/news/_layouts/15/listfeed.aspx?List=%7B70FB69FA-B598-4A16-9CA3-83039A8366BE%7D";

(function () {
    'use strict';

    function campusEventsController($scope, $ionicHistory, $timeout, $state) {
        // Initiates the web request for the XML data
        GetEventsData();       
        

    }

    angular
      .module('campusEvents', [])
      .controller('campusEventsController', campusEventsController);
      

})();


function GetEventsData() {
    $.ajax({
        url: EventsDataSource,
        data: "",
        crossDomain: true,

        dataType: "xml",
        timeout: 5000,
        success: function (data, textStatus) {
            ParseResult(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            alert("error");
        }
    }
    );
    
}

// once the web request is recieved, Parse the results into our Javascript Objets
function ParseResult(xml_data) {
        
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
            GenerateListItem(cEvent);
        }

    }
    

}

// Adds a new list item to the ion-list defined on the template
function GenerateListItem(eventObject) {
    var eventId = "ev_" + $(".eventItem").length;

    var html = "<a href='#' id='" + eventId + "' class='eventListLink' onclick='window.open(\"" + eventObject.link + "\", \"_system\");'>" +
                    "<div class='eventItem item item-icon-left'>" +
                       "<div class='calendarItem icon'>" + MakeCalendarElement(eventObject.date) + "</div>" + 
                       "<h3 class='eventItemTitle'>" + eventObject.title + "</h3>" + 
                       "<p class='eventDate'>" + eventObject.date + "</p>" + 
                     "</div>"
                "</a>";

                // The following code used DOM Traversal to asyncronously sort the element by date
                // get each date element
                var dates = $(".eventDate");

                var latestDateId = "";
                

                for (var i = 0; i < dates.length; i++) {
                    if (latestDateId == "") {
                        var thisDate = new Date(eventObject.date);
                        var thatDate = new Date(dates[i].innerHTML);

                        // if the current element has a date later than our new element, 
                        // mark that element as the latest one
                        if (thatDate > thisDate) {
                            var x = dates[i];
                            // This jQuery chain gets the element's id of the <a> element
                            latestDateId = $(x).parent().parent().attr("id");
                            // if an element was found with a date greater than this one, add the new element just before it
                            $("#" + latestDateId).prepend(html);
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
