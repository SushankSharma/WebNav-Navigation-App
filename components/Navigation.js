import { useState, useEffect, useRef } from "react";
import { GoogleMap, DirectionsRenderer, Marker, TrafficLayer, DistanceMatrixService } from "@react-google-maps/api";
import "./RouteNavSidebar.css";
import CloseIcon from "@material-ui/icons/Close";
import GpsFixedIcon from "@material-ui/icons/GpsFixed";
import { Card, Modal, Button, } from "react-bootstrap";
import Icon from '@mui/material/Icon';
import LatLon from 'geodesy/latlon-nvector-spherical';
import { socket } from "./socket";

/*global google*/

function Navigation({
    directionsResponse,
    NavigationStop,
    NavigationStart,
    lat,
    lng,
    head,
    inst,
    endlocation,
    Rerouting,
    coords,
    setDirectionsResponse
}) {


    const [map, setMap] = useState(/** @type google.maps.Map */(null));
    let url= "http://maps.google.com/mapfiles/ms/icons/red-dot.png"; // icon for destination location
    
    // Forward headed icon for navigation
    let symbol = {
        path: "M9.5 42 8 40.5 24 4 40 40.5 38.5 42 24 35.4Z",
        fillColor: 'skyblue',
        fillOpacity: 1,
        anchor: new google.maps.Point(25, 15),
        strokeWeight: 1,
        scale: 1,
        // rotation: head  
    }

    // Variables required for comparison of location with drawn route 
    let leng;
    let Latlngarr = [];
    let Latlngarr2 = [];
    let Travelhistory = [];
    var currcoord;
    let currcoord2;
    let prevcoord;
    let distance="";
    let m=0;
    let i=0;
    let j=0;
    let l=0;      
    let interval;
    let interval2;
    let coord;
    let flag1 = 0;

    // State Variables
    const [center, setCenter] = useState({lat:coords.lat, lng:coords.lng});
    const [precoord, setPreCoord] = useState({lat:lat, lng:lng});

    // Boolean State variables
    const [realTime, setRealTime] = useState(true);
    const [realTime2, setRealTime2] = useState(true);
    const [locUpdate, setLocUpdate] = useState(false);
    const [reroute, setReroute] = useState(false);
    const [rerouteFlag, setRerouteFlag] = useState(false);
    const [fasterrouteFlag, setFasterRouteFlag] = useState(false);
    const [show, setShow] = useState(false);
    const [distancematrixflag, setDistanceMatrixFlag] = useState(false);

    const [insts, setInsts] = useState(); // For current instruction
    const [nextinsts, setNextInsts] = useState(); // For next instruction
    const [maphead, setMaphead] = useState(head); // For setting the map heading
    const centerRef = useRef(center); 
    let currLoc = centerRef.current;
    const [sym, setSym] = useState(null); // For current symbol
    const [nextsym, setNextSym] = useState(null); // For next symbol
    const [latlngarr, setLatLngArray] = useState([]); // For Lat Lng array(simulation)
    const [endaddress, setEndAddress] = useState("");
    const [distanceremaining, setDistanceRemaining] = useState(); // Distance between currloc and end of step
    const [distancematrixresponse, setDistanceMatrixResponse] = useState(null);
    const [fasterroutedist, setFasterRouteDist] = useState();
    const [fasterrouteduration, setFasterRouteDuration] = useState();
    const [fasterroutedirectionresponse, setFasterRouteDirectionResponse] = useState();

    const directionsService = new google.maps.DirectionsService(); // a variable is declared to set the dircetions request
    const directionsRenderer = new google.maps.DirectionsRenderer(); // variable is declared to render the dircetions but currently not used
    const service = new google.maps.DistanceMatrixService();
    const geocoder = new google.maps.Geocoder();

    // Stops the Route navigation and navigates back to directions display
    const navigationStop = () => {
        let storedarray = localStorage.getItem("TravelHistory");
        Travelhistory = JSON.parse(storedarray);
        let startloc = directionsResponse.routes[0].legs[0].start_address;
        let endloc ;
        geocoder
            .geocode({ location: center })
            .then((response) => {
                if (response.results[0]) {
                endloc = response.results[0].formatted_address;
                setEndAddress(endloc);
                console.log(endaddress);
                let val = {start: startloc, end: endloc};
                console.log(val);
                Travelhistory.push(val)
                console.log(Travelhistory);
                localStorage.setItem("TravelHistory", JSON.stringify(Travelhistory));
                } else {
                window.alert("No results found");
                }
            })
            .catch((e) => window.alert("Geocoder failed due to: " + e));
        NavigationStop(true);
        setRealTime2(false);
        setRealTime(false);
    }

    const handleClose = () => {
        setShow(false);
      }

    // Pans the map to the source icon and sets the zoom
    const Zoomtomarker=()=>{
         const timer = setTimeout(() => {
            map.setZoom(20);
            map.panTo(center);
            map.setTilt(55);
            
           }, 1000);
        return () => clearTimeout(timer);
    }

    // For current direction symbol
    const DirectionsSymbol = (val) => {
        if(val == "turn-left"){
            setSym('turn_left');
        }else if(val == "turn-right"){
            setSym('turn_right');
        }else if(val == "turn-slight-left"){
            setSym('turn_slight_left');
        }else if(val == "turn-slight-right"){
            setSym('turn_slight_right');
        }else if(val == "ramp-left"){
            setSym('ramp_left');
        }else if(val == "ramp-right"){
            setSym('ramp_right');
        }else if(val == "roundabout-left"){
            setSym('roundabout_left');
        }else if(val == "roundabout-right"){
            setSym('roundabout_right');
        }else if(val == "uturn-left"){
            setSym('u_turn_left');
        }else if(val == "uturn-right"){
            setSym('u_turn_right');
        }else if(val == "turn-sharp-left"){
            setSym('turn_sharp_left');
        }else if(val == "turn-sharp-right"){
            setSym('turn_sharp_right');
        }else if(val == "fork-left"){
            setSym('fork_left');
        }else if(val == "fork-right"){
            setSym('fork_right');
        }else if(val == "merge"){
            setSym('merge');
        }else{
            setSym('north');
        }
    }

    // For next direction symbol
    const NextDirectionsSymbol = (val) => {
        if(val == "turn-left"){
            setNextSym('turn_left');
        }else if(val == "turn-right"){
            setNextSym('turn_right');
        }else if(val == "turn-slight-left"){
            setNextSym('turn_slight_left');
        }else if(val == "turn-slight-right"){
            setNextSym('turn_slight_right');
        }else if(val == "ramp-left"){
            setNextSym('ramp_left');
        }else if(val == "ramp-right"){
            setNextSym('ramp_right');
        }else if(val == "roundabout-left"){
            setNextSym('roundabout_left');
        }else if(val == "roundabout-right"){
            setNextSym('roundabout_right');
        }else if(val == "uturn-left"){
            setNextSym('u_turn_left');
        }else if(val == "uturn-right"){
            setNextSym('u_turn_right');
        }else if(val == "turn-sharp-left"){
            setNextSym('turn_sharp_left');
        }else if(val == "turn-sharp-right"){
            setNextSym('turn_sharp_right');
        }else if(val == "fork-left"){
            setNextSym('fork_left');
        }else if(val == "fork-right"){
            setNextSym('fork_right');
        }else if(val == "merge"){
            setNextSym('merge');
        }else{
            setNextSym('north');
        }
    }

    // For present instruction and next instruction
    const Instructions = (val) => {
        let reg1 = (directionsResponse.routes[0].legs[0].steps[val].instructions);
        reg1 = reg1.replace(/(<([^>]+)>)/ig, "");
        let reg2 = (directionsResponse.routes[0].legs[0].steps[val+1].instructions);
        reg2 = reg2.replace(/(<([^>]+)>)/ig, "");
        let sym = (directionsResponse.routes[0].legs[0].steps[val].maneuver);
        let nextsym = (directionsResponse.routes[0].legs[0].steps[val+1].maneuver);
        setInsts(reg1);
        setNextInsts(reg2);
        //console.log(reg2);
        DirectionsSymbol(sym);
        NextDirectionsSymbol(nextsym);
    }

    // To compute the distance between current location and end of the step
    const ComputeRemainingDistance = (val, val1) => {
        distance = google.maps.geometry.spherical.computeDistanceBetween(val1, directionsResponse.routes[0].legs[0].steps[val].lat_lngs[leng-1]);
        let distanceInM = Math.round(distance);
        let distanceInKm = parseFloat(distanceInM / 1000).toFixed(1);
        setDistanceRemaining(distanceInM > 1000 ? `${distanceInKm} km` : `${distanceInM} m`);
    }

    // To confirm whether to re route or not
    const ReRoutingConfirm = () => {           
        console.log(currcoord); 
        setRerouteFlag(false);
        Rerouting(center);
        NavigationStop(true);
        NavigationStart();
    }

    const FasterRoutingConfirm = () => {
        setDirectionsResponse(fasterroutedirectionresponse);
    }

    const Cancel = () => {
        setRerouteFlag(false);
        navigationStop();
    }

    const Cancel2 = () => {
        setFasterRouteFlag(false);
        //navigationStop();
    }

    useEffect(() => {
        if(map){
            Zoomtomarker();
        }
        })

        // Stores the route lat lng in an array required for simulation purposes
        const FetchLatLng = () => {
            let arr = [];
            let i=0;
            let j=0;
            arr = directionsResponse.routes[0].legs[0].steps;
            let len = arr.length;
            console.log(len);
            for(i=0; i<len; i++){
                let len2= directionsResponse.routes[0].legs[0].steps[i].path.length;
                console.log(len2);
                for(j=0; j<len2-1; j++){
                    Latlngarr2.push({lat:directionsResponse.routes[0].legs[0].steps[i].path[j].lat(), lng:directionsResponse.routes[0].legs[0].steps[i].path[j].lng()});
                }
            }
            console.log(Latlngarr2);
        }

        const StepLatLngArr = (val, val1) => {
            let arr = [];
            let i=0;
            let j=0;
            let len= directionsResponse.routes[0].legs[0].steps[val].path.length;
            for(i=0; i<len; i++){
                //console.log(len2);
                Latlngarr.push({lat:directionsResponse.routes[0].legs[0].steps[val].path[i].lat(), lng:directionsResponse.routes[0].legs[0].steps[val].path[i].lng()});
            }
            console.log(Latlngarr);
        }

        useEffect(() =>{
            //FetchLatLng();
            StepLatLngArr(0, leng);
            Instructions(0);
            console.log(directionsResponse);
        }, [directionsResponse]);

        // In this UseEffect the currentloc is compared with the route drawn every 1 secong using setInterval
        useEffect(() => {
            let k=0;
            m=0;
            if(socket.readyState == 1){
                socket.send('Reconnecting for navigation');
            }
            socket.addEventListener('message', function (event) {
            if (realTime) {
                interval = setInterval(() => {
                    currLoc = JSON.parse(event.data);
                    setCenter({lat:Number(currLoc.Latitude), lng:Number(currLoc.Longitude)});
                    currcoord = {lat:Number(currLoc.Latitude), lng:Number(currLoc.Longitude)};
                    console.log(center,currcoord);
                if(i==(directionsResponse.routes[0].legs[0].steps.length - 1)){
                    let lastLegDist = google.maps.geometry.spherical.computeDistanceBetween(currcoord, endlocation);
                    if(lastLegDist<25){
                        setShow(true);
                    }
                    setTimeout(() => {
                        setShow(false)
                        navigationStop();
                    }, 100000);
                }
                leng = directionsResponse.routes[0].legs[0].steps[i].lat_lngs.length;
                console.log(leng)
                let pos = directionsResponse.routes[0].legs[0].steps[i].path;
                let poly = new google.maps.Polyline({
                    path: pos
                  }); // need to do error handling
                console.log(currcoord)
                if(google.maps.geometry.poly.isLocationOnEdge(currcoord, poly, 10e-9) ){
                    console.log("running", currcoord)
                    flag1 = 0;
                    Instructions(i);
                    ComputeRemainingDistance(i,currcoord);
                    if((google.maps.geometry.spherical.computeDistanceBetween(currcoord, directionsResponse.routes[0].legs[0].steps[i].lat_lngs[leng-1])) < 1 ){
                         i=i+1;
                         j=0;
                         k=0;
                         console.log("step complete");
                         const [loc1, loc2] =  directionsResponse.routes[0].legs[0].steps[i].lat_lngs.slice(0, 2);
                         let heading = google.maps.geometry.spherical.computeHeading(loc1, loc2);
                         setMaphead(heading);
                         Instructions(i);
                         StepLatLngArr(i, leng);
                    }else {
                        const locLatLon = currcoord instanceof LatLon ? currcoord : new LatLon(currcoord.lat, currcoord.lng);
                        const startLatLon =  directionsResponse.routes[0].legs[0].steps[i].lat_lngs[0] instanceof LatLon ?  directionsResponse.routes[0].legs[0].steps[i].lat_lngs[0] : new LatLon( directionsResponse.routes[0].legs[0].steps[i].lat_lngs[0].lat(),  directionsResponse.routes[0].legs[0].steps[i].lat_lngs[0].lng());
                        const endLatLon =  directionsResponse.routes[0].legs[0].steps[i].lat_lngs[leng-1] instanceof LatLon ?  directionsResponse.routes[0].legs[0].steps[i].lat_lngs[leng-1] : new LatLon( directionsResponse.routes[0].legs[0].steps[i].lat_lngs[leng-1].lat(),  directionsResponse.routes[0].legs[0].steps[i].lat_lngs[leng-1].lng());
                        const nearestPointOnSegment = locLatLon.nearestPointOnSegment(startLatLon, endLatLon);
                        const nearestpointDistance = nearestPointOnSegment.distanceTo(endLatLon);
                        const locdistance = locLatLon.distanceTo(endLatLon);
                        console.log(nearestPointOnSegment.lat, nearestpointDistance, locdistance);
                        if(nearestpointDistance <= locdistance){
                            console.log("if condition executed")
                            let markerHeading = google.maps.geometry.spherical.computeHeading(currcoord, {lat: nearestPointOnSegment.lat, lng: nearestPointOnSegment.lng});
                            setMaphead(markerHeading);
                            console.log(markerHeading);
                        }else{
                            console.log("if condition executed")
                            let markerHeading = google.maps.geometry.spherical.computeHeading({lat: nearestPointOnSegment.lat, lng: nearestPointOnSegment.lng}, currcoord);
                            setMaphead(markerHeading);
                            console.log(markerHeading);
                        }
                        //const distance = nearestPointOnSegment.distanceTo(locLatLon);
                        console.log(distance, { lat: nearestPointOnSegment.lat, lng: nearestPointOnSegment.lng });
                        //console.log("run1")
                    } 
                }else{
                    // i=i+1;
                    console.log("Wrong Direction!")
                    for(k=0; k<directionsResponse.routes[0].legs[0].steps.length; k++){
                        let pos1 = directionsResponse.routes[0].legs[0].steps[k].path;
                        let poly1 = new google.maps.Polyline({
                            path: pos1
                        });
                        if(google.maps.geometry.poly.isLocationOnEdge(currcoord, poly1, 10e-9)){
                            i=k;
                            break;
                        }
                    }
                    setRerouteFlag(true);
                    //setRealTime(false);
                }
              }, 1000);
            } else {
                return () => {
                    clearInterval(interval)
                };
            }
            });
            return () => {
                clearInterval(interval)
                console.log("Return executed")
            };
        }, [realTime]);

    
    // To calculate fastest route every 
    useEffect(() => {
        console.log("2nd useeffect")
        let secondsocket = new WebSocket(`ws://${process.env.REACT_APP_WEBSOCK_IP}:${process.env.REACT_APP_WEBSOCK_PORT}`);
        secondsocket.addEventListener('open', function (event) { 
            secondsocket.send('faster route ');
        });
        if (realTime2) {
            interval2 = setInterval(() => {
                if(secondsocket.readyState == 1){
                    secondsocket.send('Reconnecting for faster route');
                  }
                secondsocket.addEventListener('message', function (event) {
                    let currLoc1 = JSON.parse(event.data);
                    //setCenter({lat:Number(currLoc[0].Latitude), lng:Number(currLoc[0].Longitude)});
                    currcoord2 = {lat:Number(currLoc1.Latitude), lng:Number(currLoc1.Longitude)};
                    //console.log("2nd useEffect running", currcoord2)
                })
                let request = {
                    origin: currcoord2,
                    destination: endlocation,
                    travelMode: "DRIVING",
                    //provideRouteAlternatives: true,
                    drivingOptions: {
                      departureTime: new Date(Date.now() + 10000),  // for the time N milliseconds from now.
                      trafficModel: 'optimistic'
                    }}
                let request2 = {
                    origins: [directionsResponse.routes[0].legs[0].start_location],
                    destinations: [currcoord2],
                    travelMode: google.maps.TravelMode.DRIVING,
                    //unitSystem: google.maps.UnitSystem.METRIC,
                    avoidHighways: false,
                    avoidTolls: false,
                  };
                let travelledduration;
                //console.log("rantillhere")
                service.getDistanceMatrix(request2).then((response) => {
                    travelledduration = response.rows[0].elements[0].duration.value;
                    console.log( response , travelledduration);
                })
                    directionsService.route(request, function (result, status) {
                        if (status === "OK") {
                            //setDistanceMatrixFlag(true);
                            let prevdurationintraffic = directionsResponse.routes[0].legs[0].duration_in_traffic;
                            let prevtotaldist = directionsResponse.routes[0].legs[0].distance.value;
                            let remainingtravelduration = prevdurationintraffic-travelledduration;
                            let durationintraffic = result.routes[0].legs[0].duration_in_traffic.value;
                            let durationintraffictext = result.routes[0].legs[0].duration_in_traffic.text;
                            let remainingdist = result.routes[0].legs[0].distance.text;
                            // if(durationintraffic < remainingtravelduration){
                                setFasterRouteFlag(true);
                                setFasterRouteDist(remainingdist);
                                setFasterRouteDuration(durationintraffictext);
                                setFasterRouteDirectionResponse(result);
                                setTimeout(() => {
                                    setFasterRouteFlag(false);
                                    setDistanceMatrixFlag(false);
                                    //setShow(false)
                                  }, 3000); // To set the timeout fot the best route pop up.
                          console.log(result);
                          console.log("directionresponse")
                        }
                      });
            }, process.env.REACT_APP_FASTER_ROUTE_FREQ); // To set the best route display frequency
        } else {
            clearInterval(interval2);
        }
       return () => {
                        clearInterval(interval2)
                        secondsocket.close();
                    };
      },[realTime2]);
        

    return (
        <div className="map">
            <GoogleMap
                //center= {{lat:lat, lng:lng}}
                //zoom={20.5}
                mapContainerStyle={{ width: "100%", height: "100%" }}
                libraries
                options={{
                mapId : "be715e303820a193",
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                clickableIcons:true,
                }}
                heading={maphead}
                tilt={55}
                onLoad={map => setMap(map)}
            >
                            
            {/* To display icon for the source  */}
            <Marker
                position={center}
                icon={symbol}
                title="Navigation Icon"
                
            />  

            {/* To display icon for the destination  */}
            <Marker
                position={endlocation}
                icon = {url}
                title="Destination"
                options={{
                    draggable: true
                }}
            />
            {/* To Render traffic condiitions */}
            <TrafficLayer autoUpdate />

            {/* Displays the routes for navigation */}
            <DirectionsRenderer
              directions={directionsResponse}
              panel={document.getElementById("right-panel")}
              options={{
                  suppressMarkers: true
              }}
            />

            {/* To Confirm Re routing */}
            {rerouteFlag? 
            <div >
                <Card 
                  className="bg-dark"
                  style={{ width: '20rem', height:'10rem', position: "absolute", right:"0.5%", bottom:"10%", color:"white", fontSize:"20px", textAlign:"center", justifyContent:"center"}}
                >
                    <Card.Body>
                        <p>Wrong Direction</p>
                        <p>Do you want to Re-route ? </p>
                    <Button
                        color="primary"
                        onClick={ReRoutingConfirm}
                        className="ml-4"
                        style={{width: "8rem", margin: '3px'}}
                    >
                    Ok
                    </Button>
                    <Button 
                        color="secondary"
                        onClick={Cancel}
                        style={{width: "8rem", margin: '3px'}}
                    >
                    Cancel
                    </Button>
                    </Card.Body>
                </Card>
            </div>
            : null}

            {/* To Confirm Faster Route */}
            {fasterrouteFlag? 
                <div >
                    <Card 
                    className="bg-dark"
                    style={{ width: '20rem', height:'15rem', position: "absolute", left:"0.5%", bottom:"10%", color:"white", fontSize:"20px", textAlign:"center", justifyContent:"center"}}
                    >
                        <Card.Body>
                            <p>Faster Route Available </p>
                            {/* <p>Do you want to Re-route ? </p> */}
                        <p>Duration : {fasterrouteduration}</p>
                        <p>Distance : {fasterroutedist}</p>
                        <Button
                            color="primary"
                            onClick={FasterRoutingConfirm}
                            className="ml-4"
                            style={{width: "8rem", margin: '3px'}}
                        >
                        Accept
                        </Button>
                        <Button 
                            color="secondary"
                            onClick={Cancel2}
                            style={{width: "8rem", margin: '3px'}}
                        >
                        Reject
                        </Button>
                        </Card.Body>
                    </Card>

                </div>
            : null}

            {distancematrixflag ?
                <DistanceMatrixService
                    options={{
                            destinations: [directionsResponse.routes[0].legs[0].start_location],
                            origins: [center],
                            travelMode: "DRIVING",
                            }}
                    callback = {(response) => {setDistanceMatrixResponse(response)}}
                />
                :null
            }

            <Modal show={show} onHide={handleClose} size="xl" centered  style={{position: "absolute", left:"40%", bottom: "40%", width:"20rem" }}>
                <Modal.Body style={{height:"75px"}}>
                    <div style={{justifyContent: "center" }}><p ><strong>You have reached your destination.</strong></p></div>
                </Modal.Body>
                <Button className="col-12 col-sm-12 me-5" variant="success" onClick={navigationStop} aria-current="page" title="Close Search Window" data-bs-toggle="tooltip" data-bs-placement="right">Close</Button>
            </Modal> 

                {/* Bottom Nav Bar. Includes Recenter, close and TBT */}
                <nav className="navbar fixed-bottom navbar-expand-lg navbar-light bg-dark" style={{height: "9%"}}>
                    <div className="container-fluid">
                        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                            <div className="navbar-nav">
                                <a className="nav-link active" aria-current="page" href="#" 
                                    onClick={() => {
                                        map.panTo(center);
                                        map.setZoom(20);
                                        }}
                                >
                                    <button className="btn btn-primary">
                                        <GpsFixedIcon />
                                    </button>
                                </a>
                                <a className="nav-link" href="#"><div className="distance-container">{distanceremaining}</div></a>
                                <a className="nav-link" href="#">
                                {/* <div style={{alignItems:"center"}}> */}
                                    <Card style={{ width: '62rem', height:'4rem', position: "absolute", left:"20%", top:"0%", backgroundColor:"darkgreen", color:"white", fontSize:"20px", textAlign:"center", justifyContent:"center"}}>
                                        <Card.Body>
                                            <Card.Text>
                                            <div className="current-direction-container"> 
                                            {/* <span className="material-icons md-36 md-light current-direction-symbols">{sym}</span> */}
                                            <Icon baseClassName="material-icons md-36 md-light current-direction-symbols">{sym}</Icon>
                                            {/* </div>
                                            <div className="current-direction-container">  */}
                                            <strong>{insts}</strong></div>
                                            <div className="next-direction-container">
                                                {/* Then <span className="material-icons md-36 md-light next-direction-symbols">{nextsym}</span> */}
                                            Then <Icon baseClassName="material-icons md-36 md-light next-direction-symbols">{nextsym}</Icon>
                                            </div> 
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                {/* </div> */}
                                </a>
                                <a className="nav-link" href="#" onClick={navigationStop}>
                                    <button className="btn btn-danger closeIcon">
                                        <CloseIcon />
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>
                </GoogleMap></div>
        )
}

export default Navigation;