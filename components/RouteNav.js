import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
//import TextField from 'material-ui/TextField';
//import { Keyboard, RequestCloseHandler, InputHandler } from 'react-material-ui-keyboard';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { GoogleMap, DirectionsRenderer, Marker, Polyline, TrafficLayer } from "@react-google-maps/api";
import Autocomplete, { usePlacesWidget } from "react-google-autocomplete";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./RouteNavSidebar.css";
import './SearchModal.css';
import styled from "styled-components";
import PlaceIcon from '@mui/icons-material/Place';
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import NavigationIcon from "@mui/icons-material/Navigation";
import Navigation from "./Navigation";
import GpsFixedIcon from "@material-ui/icons/GpsFixed";
import { socket } from "./socket";
import "./GpsButton.css";
import { GiCrosshair } from "react-icons/gi";

/*global google*/

function RouteNavigation({
  destination,
  closeRouteNavigation,
  lat,
  lng,
  setSidebarFlag,
  coords,
  keyBoardClick,
  //socket
}) {
  //console.log(destination);
  let currLoc;
  let start ={};
  let interval;
  let waypts = [{location :{lat: 15.443188615446775, lng: 75.006193666266}, stopover: true}]
  const [directionsResponse, setDirectionsResponse] = useState({}); // To store origin and destination directions response from google servers
  const [origin, setOrigin] = useState(""); // To store the origin address given via input.
  const [destination1, setDestination1] = useState(destination); // To store the destination address given via input or when passed as props.
  const [destination2, setDestination2] = useState(); // To store the destination address given via input or when passed as props. 
  const [options, setOptions] = useState();

  const [navtoggle, setNavToggle] = useState(false); // To set the navigation icon when start navigation is trigerred.
  const [burgerStatus, setBurgerStatus] = useState(true); // To display the sidenav bar/ burger nav when routenav componenet is trigerred.
  const [isburgernavactie, setIsBurgernavActive] = useState(true);
  const [reroute, setReroute] = useState(false);
  const [toggle, setToggle] = useState(true);
  const [startnavflag, setStartNavFlag] = useState(false);
  const [keyboardflag, setKeyboardFlag] = useState(false);

  const [noofroutes, setNoOfRoutes] = useState(null); // To calculate the number of routes present in the directions response.
  const [startlocation, setStartLocation] = useState(); // To store the start location lat and lng from the directions response.
  const [endlocation, setEndLocation] = useState(); // To store the end location lat and lng values from the directions response.
  const [startaddress, setStartAddress] = useState(); // To store the start location address from the directions response.
  const [head, setHead] = useState(); // Heading value according to the route
  const [center, setCenter] = useState({ lat: coords.lat, lng: coords.lng}); // Current Location
  const [inst, setInst] = useState(null); // To fetch instructions from the directions response.
  const [updatedcenter, setUpdatedCenter] = useState({lat:null, lng:null});
  const [input, setInput] = useState("");
  const [layout, setLayout] = useState("default");
  const keyboard = useRef();

  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const directionsService = new google.maps.DirectionsService(); // a variable is declared to set the dircetions request
  const directionsRenderer = new google.maps.DirectionsRenderer(); // variable is declared to render the dircetions but currently not used
  const geocoder = new google.maps.Geocoder();
  let divdata;

  let url = "http://maps.google.com/mapfiles/ms/icons/red-dot.png"; // icon for destination location

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef();
  const centerRef = useRef(center); 
  let curr = centerRef.current;

  const check = () => {
    setTimeout(() => {
      let mylocation = localStorage.getItem("Mylocation");
      let parseorigin = JSON.parse(mylocation);
      setCenter({lat:parseorigin.lat, lng:parseorigin.lng});
      //setOrigin(parseorigin)
    }, 1000);
    console.log(center);
  }

  useEffect(() => {
    if(socket.readyState == 1){
      socket.send('Reconnecting');
    }
    socket.addEventListener('message', function(event){
      //interval = setInterval(() => {
        console.log("Receiving gps data")
        currLoc = JSON.parse(event.data);
        console.log(currLoc);
        setCenter({lat:Number(currLoc.Latitude), lng:Number(currLoc.Longitude)});
        //setStartLocation({lat:Number(currLoc.Latitude), lng:Number(currLoc.Longitude)});
        start = {lat:Number(currLoc.Latitude), lng:Number(currLoc.Longitude)};
        localStorage.setItem("Mylocation", JSON.stringify(start));
        if(currLoc['Speed[KMPH]'] == "0" ){
          setStartNavFlag(true)
        }else{
          setStartNavFlag(false);
        }
      //}, 3000)
      
    })
    return;
    //})
  }, [destination1]);

  // For fetching GPS data from the server
  useEffect(() =>  {
    console.log(socket.readyState, startlocation);
   
  //RouteNavigation();
    let request = {
      origin: center || start,
      destination: destination1,
      travelMode: "DRIVING",
      provideRouteAlternatives: true,
      drivingOptions: {
        departureTime: new Date(Date.now() + 10000),  // for the time N milliseconds from now.
        trafficModel: 'optimistic'
      }
      //waypoints: waypts,
      //optimizeWaypoints: true,
    };
    directionsService.route(request, function (result, status) {
      if (status === "OK") {
        setDirectionsResponse(result);
        let index = result.routes.length;
        setNoOfRoutes(index);
        let startlocation = result.routes[0].legs[0].start_location;
        setStartLocation(startlocation);
        let endlocation = result.routes[0].legs[0].end_location;
        setEndLocation(endlocation);
        let startaddress = result.routes[0].legs[0].start_address;
        setStartAddress(startaddress);
        let endaddress = result.routes[0].legs[0].end_address;
        setDestination1(endaddress)
        console.log(result);
        //renderDirectionsPolylines(result, 0);
        console.log("directionresponse")
        // directionsRenderer.setDirections(result)
        // directionsRenderer.setOptions({suppressMarkers:true})
      }
    });
    // socket.close();
  }, [origin, destination1, reroute, ]);

  var polylineOptions = {
    strokeColor: "blue",
    strokeOpacity: 1,
    strokeWeight: 4,
    zIndex: 1,
    id: 0,
  };
  var polylineOptions1 = {
    strokeColor: "grey",
    strokeOpacity: 1,
    strokeWeight: 4,
    id: 1,
  };
  var polylines = [];
  function renderDirectionsPolylines(response, val) {
    console.log(val)
    for (var i = 0; i < polylines.length; i++) {
      polylines[i].setMap(null);
    }
    // var legs = response.routes[0].legs;
    console.log(response.routes.length);
    for (let l = 0; l < response.routes.length; l++) {
      for (let i = 0; i < response.routes[l].legs.length; i++) {
        var steps = response.routes[l].legs[i].steps;
        for (let j = 0; j < steps.length; j++) {
          var nextSegment = steps[j].path;
          if (l === val) {
            var stepPolyline = new google.maps.Polyline(polylineOptions);
            console.log("0th route",l)
          } else {
            var stepPolyline = new google.maps.Polyline(polylineOptions1);
          }
          for (let k = 0; k < nextSegment.length; k++) {
            stepPolyline.getPath().push(nextSegment[k]);
          }
          stepPolyline.setMap(map);
          polylines.push(stepPolyline);
          google.maps.event.addListener(stepPolyline, "click", function (evt) {
            // stepPolyline.setOptions({
            //   strokeColor: "blue",
            //   strokeOpacity: 1.0,
            //   strokeWeight: 7,
            //   zIndex: 7,
            // });

            stepPolyline.setMap(this.map);
            handlePolyClick(evt, this);
            console.log(
              "you clicked on the route<br>" + evt.latLng.toUrlValue(6)
            );

            // infowindow.setPosition(evt.latLng);
            // infowindow.open(map);
          });
          function handlePolyClick(eventArgs, polyLine) {
            // now you can access the polyLine
            alert(polyLine.strokeColor + polyLine.id);
            renderDirectionsPolylines(directionsResponse, polyLine.id);
            // polyLine.setOptions({
            //   strokeColor: "black",
            //   // strokeOpacity: 1.0,
            //   // strokeWeight: 3,
            // });
          }
        }
      console.log(stepPolyline);

      }
    }
    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(
      document.getElementById("right-panel")
    );
  }

  // To start the navigation and set the icon and tbt
  const NavigationStart = () => {
    // setBurgerStatus(false);
    console.log("nav start clicked")
    setSidebarFlag(false);
    setIsBurgernavActive(false);
    const [loc1, loc2] =
    directionsResponse.routes[0].legs[0].steps[0].lat_lngs.slice(0, 2);
    let heading = google.maps.geometry.spherical.computeHeading(loc1, loc2);
    setHead(heading);
    let reg = directionsResponse.routes[0].legs[0].steps[0].instructions;
    reg = reg.replace(/(<([^>]+)>)/gi, "");
    setInst(reg);
    setNavToggle(true);
  };

  // To stop the navigation when stop button is triggered
  const NavigationStop = (val) => {
    setNavToggle(false);
    map.setZoom(8);
    map.setTilt(0);
    map.setHeading(0);
    setSidebarFlag(val);
    // setBurgerStatus(true);
    setIsBurgernavActive(true);
    setBurgerStatus(false);
    setBurgerStatus(true);
  };

  const Rerouting = (val) => {
    console.log(val);
    setCenter(val);
    setReroute(!reroute);
  };

  const DestMarkerPos = (e) => {
    console.log({lat:e.latLng.lat(), lng:e.latLng.lng()});
    setDestination1({lat:e.latLng.lat(), lng:e.latLng.lng()});
  }

  const setPolylineOptions = () => {
    console.log("Route Clicked")
    setOptions({storkeColor : "black"})
  }

  const onChange1 = input => {
    setInput(input);
    setDestination1(input);
    console.log("Input changed", input);
  };

  const handleShift = () => {
    const newLayoutName = layout === "default" ? "shift" : "default";
    setLayout(newLayoutName);
  };

  const onKeyPress = button => {
    console.log("Button pressed", button);
    /**
     * If you want to handle the shift and caps lock buttons
     */
    if(button === "{enter}") {
      setKeyboardFlag(false);
      setDestination1(destination1);
    }
    if (button === "{shift}" || button === "{lock}") handleShift();
  };

  const onChangeInput = event => {
    const input = event.target.value;
    setInput(input);
    keyboard.current.setInput(input);
  };

  const Divdata = () => {
    var elm = document.getElementById("right-panel");
    console.log(elm);
  }

  // Icon for start / current location
  var image = "http://i.stack.imgur.com/orZ4x.png";
  var image2 = require("./icons1.png")

  return (
    <div className="App">
      <div className="map">
        {navtoggle ? (
          <Navigation
            directionsResponse={directionsResponse}
            NavigationStart={NavigationStart}
            NavigationStop={NavigationStop}
            lat={lat}
            lng={lng}
            head={head}
            inst={inst}
            endlocation={endlocation}
            Rerouting={Rerouting}
            coords={coords}
            setDirectionsResponse={setDirectionsResponse}
          />
        ) : (
          <GoogleMap
            //center={center}
            zoom={18}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            libraries
            options={{
              mapId: "be715e303820a193",
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
            onLoad={(map) => setMap(map)}
            onClick={(e)=>(console.log(e,"clicked2" ))}
          >
            {/* Burger nav/ side bar */}
            {isburgernavactie ? (
              <div >
                <RightMenu>
                  <CustomMenu onClick={() => setBurgerStatus(true)} />
                </RightMenu>

                <BurgerNav show={burgerStatus} style={{width: "40%"}}> 
                {/* //570px */}
                  <CloseWrapper>
                    <CustomClose onClick={() => setBurgerStatus(false)} />
                  </CloseWrapper>
                  <Container
                    fluid
                    className="bg-light p-3"
                    style={{ overflowY: "scroll", width: "100%", height: "100vh"}} 
                    // 550px
                  >
                    <Row>
                      <Col md={12}>
                        <Card className="p-3 mb-2 card w-100">
                          <div className="mb-3">
                            <span>
                              <b>Origin</b>
                            </span>
                            {/* To input the start location */}
                            <Autocomplete
                              className="form-control"
                              apiKey={process.env.GOOGLE_MAP_API_KEY}
                              defaultValue={startaddress}
                              ref={originRef}
                              onPlaceSelected={(place) => {
                                const coordinates = {
                                  lat: place.geometry.location.lat(),
                                  lng: place.geometry.location.lng(),
                                };
                                setOrigin(coordinates);
                                setCenter(coordinates);
                              }}
                              types={["address"]}
                             
                              //onClick={setKeyboardFlag(true)}
                              //componentRestrictions={{ country: "IN" }}
                            />
                          </div>
                          <div className="mb-3">
                            <span>
                              <b>Destination</b>
                            </span>
                            {/* To input the destination location */}
                            <div className="row d-flex flex-row me-0">
                            <PlacesAutocomplete
                              value={destination1}
                              onChange={setDestination1}
                              //onSelect={handleSelect}
                             //shouldFetchSuggestions={true}
                            >
                              {({
                                getInputProps,
                                suggestions,
                                getSuggestionItemProps,
                                loading,
                                img,
                              }) => (
                                  <div className="col col-sm-12 m-0"><input
                                    {...getInputProps({
                                      className: "form-control" ,
                                      placeholder: "Search here",
                                      })}
                                    onFocus={() => {
                                          console.log("Keyboard click")
                                          setKeyboardFlag(true);
                                          //keyBoardClick();
                                      }} 
                                  />

                                  <div className=" ms-0" style={{ color: "black", position: "absolute", zIndex: "1", width: "90%"}}>
                                    {loading ? <div >...loading</div> : null}
                                    {suggestions.map((suggestion) => {
                                      const className="item-searchbarroutenav d-flex flex-row"
                                      const style = {fontSize:"px"}
                                      return (
                                        <div {...getSuggestionItemProps(suggestion, { className, style})}>
                                        <PlaceIcon className="me-3 ms-2"/>{suggestion.description}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </PlacesAutocomplete>
                            </div>
                          </div>
                          {/* {keyboardflag &&
                          (<Keyboard
                            //keyboardRef={r => (keyboard.current = r)}
                            layoutName={layout}
                            onChange={onChange1}
                            onKeyPress={onKeyPress}
                          /> )} */}
                        </Card>
                      </Col>

                      {/* To display the turn by turn instructions */}
                      <Col md={12}>
                        <div id="right-panel" style={{width: "100%"}} onLoad={Divdata}></div>
                        {console.log(document.getElementById("right-panel"))}
                        {console.log(divdata)};
                        {/* // 505 px */}
                      </Col>
                    </Row>
                  </Container>
                  
                  <Row>
                    {/* Buttons to start and stop navigation */}
                    {startnavflag ?
                    <Col>
                    <button
                      className="btn btn-primary StartButton"
                      onClick={() => NavigationStart()}
                    >
                      <NavigationIcon /> Start
                    </button>
                    </Col> :
                    null}
                    <Col> 
                    <button
                      className="btn btn-primary GpsButton"
                      onClick={() => {
                        //setToggle(!toggle)
                        map.panTo(center);
                        map.setZoom(19);
                      }}
                      style={{width:"66px"}}
                    >
                      <GpsFixedIcon/>
                    </button></Col>
                  </Row>
                </BurgerNav>
              </div>
            ) : null}

            {/* Directions renderer componenet to display all the routes between origin and destination */}
            {Array.from({ length: noofroutes }, (v, i) => i).map((i) => (
              <div ><DirectionsRenderer
                directions={directionsResponse}
                panel={document.getElementById("right-panel")}
                options={{
                  draggable: true,
                  hideRouteList: false,
                  routeIndex: i,
                  suppressMarkers: true,
                  // polylineOptions: {
                  //   zIndex: -2,
                  //   strokeColor: "#332FD0",
                  //   // strokeOpacity: 0.5,
                  //   strokeWeight: 5,
                  //   clickable: true
                  // }
                }}
                onClick={console.log("clicked")}
                {...console.log(i)}
              /></div>
            ))
          }

          <TrafficLayer autoUpdate />

            {/* To display icon for the current location/ live location */}
            <Marker
              position={startlocation}
              icon={image}
              title="Live Location"
              animation={2}
            />

            {/* To display icon for the destination  */}
            <Marker 
              position={endlocation} 
              icon={{
                url: image2,
                scaledSize: { width: 45, height: 45 },
              }} 
              title="Destination" 
              draggable={true} 
              onDragEnd={DestMarkerPos}
            />

            {/* To display navigation screen when start navigation is trigerred */}
          </GoogleMap>
        )}
        {keyboardflag ?
          <Keyboard
        /> : null }
      </div>
    </div>
  );
}

const RightMenu = styled.div`
  display: flex;
  align-items: flex-end;
  a {
    font-weight: 600;
    text-transform: uppercase;
    // padding: 0 10px;
    margin-right: 10px;
  }
  gap: 15px;
  z-index: 0;
  position: absolute;
  right: 1%;
  top: 1%;
  padding: 0px;
`;

const CustomMenu = styled(MenuIcon)`
  cursor: pointer;
  z-index: 2;
  position: relative;
  font-size: 40px;
`;

const BurgerNav = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: white;
  width: 425px;
  //   z-index: 16;
  list-style: none;
  padding: 20px;
  display: flex;
  flex-direction: column;
  text-align: start;
  transform: ${(props) => (props.show ? "translateX(0)" : "translateX(100%)")};
  transition: transform 0.2s ease-in-out;
  li {
    padding: 15px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);

    a {
      font-weight: 600;
    }
  }
`;

const CustomClose = styled(CloseIcon)`
  cursor: pointer;
`;

const CloseWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export default RouteNavigation;
