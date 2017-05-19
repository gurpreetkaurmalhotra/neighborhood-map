var map;
// for infowindow
var MyInfoWindow;
//for storing the page markers
var CurrentPageMarkers = [];
// for fetching the result
var FinalResult = [];
// for keeping track of lattitude and longitude
var lati;
var longi;
// Bangalore city lattitude longitude
lati = 12.9716;
longi = 77.5946;

/*(function($) {
    var $window = $(window),
        $html = $('html');

    function resize() {
        if ($window.width() < 991) {
            return $document.getElementById("start").addClass('row');
        }

        $html.removeClass('row');
    }

    $window
        .resize(resize)
        .trigger('resize');
})(jQuery);
*/
// function that gives lattitude and longitude of Chandigarh city
function Chandigarh() {

    lati = 30.7333;
    longi = 76.7794;
    // Do not show weather of Chandigarh until or unless a request is made
    ViewModel.showWeatherDetails(false)
    // initialising the map
    initMap();

}
// function that gives lattitude and longitude of Delhi city
function Delhi() {

    lati = 28.6139;
    longi = 77.2090;
    // Do not show weather of Delhi until or unless a request is made
    ViewModel.showWeatherDetails(false)
    // initialising the map
    initMap();

}
// function that gives lattitude and longitude of Banglore city
function Banglore() {

    lati = 12.9716;
    longi = 77.5946;
    ViewModel.showWeatherDetails(false)
    // Do not show weather of Banglore until or unless a request is made
    initMap();
    //initialsing the map

}
// function that gives lattitude and longitude of Mumbai city
function Mumbai() {

    lati = 19.0760;
    longi = 72.8777;
    // Do not show weather of Mumbai until or unless a request is made
    ViewModel.showWeatherDetails(false)
    // initialsing the map
    initMap();

}

function initMap(){
    // adding styles to map
    var styles = [
                      {
                          "stylers": [
                              {
                                  "hue": "#ff61a6"
                              },
                              {
                                  "visibility": "on"
                              },
                              {
                                  "invert_lightness": true
                              },
                              {
                                  "saturation": 40
                              },
                              {
                                  "lightness": 10
                              }
                          ]
                      }
                  ]
    // creating a new map instance
     map = new google.maps.Map(document.getElementById('map'), {
        // Adding lattitude longitude to the center
        center: {
            lat: lati,
            lng: longi
        },
        // setting the styles
        styles: styles

    });
     // creating a new instance of info window
      MyInfoWindow = new google.maps.InfoWindow({maxWidth: 150});
      // using zomato API

    ZomatoAPI();

}


// highlighting the marker
function highlightMarker( markerTitle ) {

    for( var i in CurrentPageMarkers )
    {
        if( CurrentPageMarkers[ i ].title == markerTitle )
        {
            FillInfoWindowWithData( CurrentPageMarkers[ i ] , MyInfoWindow );
            return;
        }
    }
}


// this function provides animation functionality to markers
function toggleBounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 900);
}

function FillInfoWindowWithData(marker , MyInfoWindow)
{
    var WindowContent = marker.sres;

    if( MyInfoWindow.marker !== marker && MyInfoWindow.marker !== undefined )
    {    // if no marker or marker is undefined set animation to null
        MyInfoWindow.marker.setAnimation( null );
    }
    //setting the marker

    MyInfoWindow.marker = marker;
    // adding animation to marker
    toggleBounce(marker);
    // setting content of info window
    MyInfoWindow.setContent( WindowContent );
    //opening info window
    MyInfoWindow.open( map , marker );
    // adding listner to info window
    MyInfoWindow.addListener('closeclick' , function() {
        // setting animation to null on close click
        MyInfoWindow.marker.setAnimation( null );
    });
}

// Zomato API functionality
function ZomatoAPI() {
    CurrentPageMarkers = []
    $.ajax({
        // using zomato api fetch top 15 restaurants around 5000 mt of that location and sort them according to their rating
        url : 'https://developers.zomato.com/api/v2.1/search?count=15&lat=' + lati + '&lon=' + longi + '&radius=5000&sort=rating',
        headers: {
            // type of data to accept
            'Accept' : 'application/json',
            // credential key provided by zomato
            'user-key' : 'c680c2aa864c966446c7f7cb2cf388a8'
        },
        async: true,
    }).done(function(response){
        // handles the response
        var result = '';
        console.log(response);
        // putting the details in ResultList
        var ResultList = response.restaurants;
        // setting the bounds
        var bounds = new google.maps.LatLngBounds();
        // information about details to be displayed when clicked on marker
        for (var i = 0; i < response.results_shown; i++) {
            result += '<div class="text-center"><p><a href="' + ResultList[i].restaurant.url + '"> Name: ' + ResultList[i].restaurant.name + '</p>';
            result += '<img src="' + ResultList[i].restaurant.thumb + '" height="150px" width="150px"></a><br><br>';
            result += '<p> Average Rating: ' + ResultList[i].restaurant.user_rating.aggregate_rating + '</p>';
            result += '<p> Average Cost for 2: Rs ' + ResultList[i].restaurant.average_cost_for_two + '</p>';
            result += '<p> Address: ' + ResultList[i].restaurant.location.address + '</p></div>';
        FinalResult[i] = result;
        var NewLatLong = new google.maps.LatLng(parseFloat(ResultList[i].restaurant.location.latitude),parseFloat(ResultList[i].restaurant.location.longitude));
        // resetting the result
        result = '';
        // setting the marker
        var marker = new google.maps.Marker({
            position: NewLatLong,
            title: ResultList[i].restaurant.name,
            animation: google.maps.Animation.DROP,
            // adding the data fecthed by FinalResut
            sres: FinalResult[i],
            map:map
       });
        bounds.extend(marker.position);
        // extending the marker position

       // adding a listner that fills the info window with data
        marker.addListener('click', function(){
            FillInfoWindowWithData(this, MyInfoWindow);
        });
        //pushing the markers
        CurrentPageMarkers.push(marker);
    }
    // fitting map in bounds
    map.fitBounds(bounds);
    ViewModel.init();

    }).fail(function(response,status, errorText){
        ViewModel.isThereAnyError(true);
        ViewModel.errorText('Error while fetching list from Zomato!');
    });
}

// hiding the marker
function hideMarkers() {

    for (var i = 0; i < CurrentPageMarkers.length; i++) {
        CurrentPageMarkers[i].setVisible(false);
    }
}

// showing the markers
function showMarkers() {
    for (var i = 0; i < CurrentPageMarkers.length; i++) {
        CurrentPageMarkers[i].setVisible(true);
    }

}

// showing the weather
function weather() {
    if (ViewModel.showWeatherDetails() == true)
        ViewModel.showWeatherDetails(false);
    else
        ViewModel.showWeatherDetails(true);

    $.ajax({
        url: "http://api.wunderground.com/api/533d4139a6f349ba/conditions/q/+" + lati + "," + longi + ".json",
        // type of data to accept
        dataType: 'json',
        async: true
    }).done(function(value) {
        console.log(value);
        if (value) {
            responseapi = value.current_observation;

            // displaying weather according to the city chosen
            if(responseapi.display_location.state == 'KA')
                Content = 'Showing weather for: Banglore!<br>';
            else if(responseapi.display_location.city == 'Kurla West')
                Content = 'Showing weather for: Mumbai!<br>';
            else if(responseapi.display_location.city == 'Chandigarh')
                Content = 'Showing weather for: Chandigarh!<br>';
            else if (responseapi.display_location.state == 'DL')
                Content = 'Showing weather for: Delhi!<br>';

            // content to display
            Content += 'Temperature: ' + responseapi.temp_c + 'C  ' + responseapi.temp_f + 'F <br>';
            Content += 'Weather: ' + responseapi.weather + '<br>';
            Content += responseapi.observation_time + '<br>';

            // creating a new info window instance
            var MyInfoWindow = new google.maps.InfoWindow();
            // adding waether data to view model

            ViewModel.WeatherData(Content);
            ViewModel.imageWeatherPath(responseapi.icon_url);
        } else {
            ViewModel.WeatherData('Response not available!');
        }
    }).fail(function(response, status, value) {
        ViewModel.imageWeatherPath('http://68.media.tumblr.com/3f81fad6ef163759fff8077580d94752/tumblr_inline_nj4nxkE0C21qersu1.png');
        // in case of error
        ViewModel.WeatherData('Weather cannot be loaded due to some error');
    });

}

// error method when map fails to load
function ErrorMethod() {

    ViewModel.errorText('Sorry, given map cannot be loaded right now pls try again later');
    ViewModel.isThereAnyError(true);
}

// setting the viewmodel
var ViewModel = {
    // using finalRestList as knockout obervable array
    finalRestList : ko.observableArray(),
    // fetching text to search from input field
    TextToSearch : ko.observable(''),
    // checking for errors
    isThereAnyError : ko.observable( false ),
    errorText : ko.observable(''),

    // finding the restaurant in given list
    findRestaurantInList : function( value ){
        ViewModel.finalRestList.removeAll();
        for( var i in CurrentPageMarkers )

        {
            // changing the content user added to search to lower case
            if( CurrentPageMarkers[i].title.toLowerCase().indexOf( value  .toLowerCase() ) > -1 )
            {
                // pushing the results in viewmodel
                ViewModel.finalRestList.push( CurrentPageMarkers[i].title );
                // set visible
                CurrentPageMarkers[i].setVisible(true);
            }
            else
            {
                // if not found set visible false
                CurrentPageMarkers[i].setVisible(false);
            }
        }
    },

    init : function() {
        ViewModel.finalRestList([]);
        for( var position in CurrentPageMarkers ) {
            ViewModel.finalRestList.push( CurrentPageMarkers[position].title );
        }
    },

    showWeatherDetails: ko.observable(false),
    imageWeatherPath: ko.observable(""),
    WeatherData: ko.observable("")

}
ko.applyBindings(ViewModel);
ViewModel.TextToSearch.subscribe( ViewModel.findRestaurantInList );
