import React from "react";
import "./styles.css";
import GoogleMapReact, { DirectionsRenderer } from "google-map-react";
import { GoogleMap, Marker, TrafficLayer } from "@react-google-maps/api";
import mapStyle from "./mapStyle";
import { useState, useEffect } from "react";
import "./GpsButton.css";
import { GiCrosshair } from "react-icons/gi";
import GpsFixedIcon from "@material-ui/icons/GpsFixed";
import { OneKPlusOutlined } from "@mui/icons-material";

/*global google*/

// To display the pin drop when clicked elsewhere
const AnyReactComponent = () => (
  <div className="pin">
    <img
      src={require("./icons1.png")}
      alt="pin"
      style={{ width: "55px", height: "55px" }}
    />
  </div>
);

var image = "http://i.stack.imgur.com/orZ4x.png";
var image2 = require("./icons1.png")

function MapApi({
  loc, 
  coords, 
  PinLocationSearch,
  liveFlag
}) {
  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const geocoder = new google.maps.Geocoder();
  //const [pinloc, setPinLocation] = useState({ lat: null, lng: null, address: "" });
  const [clickloc, setClickLoc] = useState({
    lat: Number(loc.lat),
    lng: Number(loc.lng),
  });
  const [center, setCenter] = useState({
    lat: Number(0),
    lng: Number(0),
  });

  const [markerflag, setMarkerFlag] = useState(true);

  const defaultVal = {
    zoom: 12,
  };
  console.log(coords, center, process.env.GOOGLE_MAP_API_KEY)

//   const Zoomtomarker=()=>{
//     const timer = setTimeout(() => {
//        map.setZoom(15);
//        map.panTo(loc);
//        map.setTilt(55);
       
//       }, 1000);
//    return () => clearTimeout(timer);
// }

// useEffect(() => {
//   if(map){
//     Zoomtomarker();
//     // map.panTo(center);
//     // map.setZoom(19.5);
// }
// },[])

  const DestnMarkerLoad = (val) => {
    console.log("marker pos:", center);
    PinLocationSearch(val);
    //setCenter(null);
  //   let val1;
  //   const timer = setTimeout(() => {
  //   geocoder
  //   .geocode({ location: {lat: val.latLng.lat(), lng: val.latLng.lng()} })
  //   .then((response) => {
  //     if (response.results[0]) {
  //       console.log(response, response.results[0].formatted_address);
  //       map.setCenter(response.results[0].geometry.location);
  //       val1 = { 'lat': center.lat, 'lng': center.lng, 'address': response.results[0].formatted_address };
  //       PinLocationSearch(val1);
  //       // setLatLngAdd(response.results[0].formatted_address);
  //       // setAddress(response.results[0].formatted_address);
  //     } else {
  //       window.alert("No results found");
  //     }
  //   })
  //   .catch((e) => window.alert("Geocoder failed due to: " + e));
  // }, 250);
  // return () => clearTimeout(timer);
    // const timer = setTimeout(() => {
    //   geocoder.geocode({ 'latLng':center}, function (results, status) {
    //     if (status == google.maps.GeocoderStatus.OK) {
    //         let address = results[0].formatted_address;
    //         val = { 'lat': center.lat, 'lng': center.lng, 'address': address }
    //         PinLocationSearch(val);
    //         console.log(address, val, "pindrop1")
    //     }else{
    //       console.log(status)
    //     }
    // });
    // }, 400)
    // return () => clearTimeout(timer);
    
}
  const DestnMarkerPos = (e) => {
    console.log(e);
    PinLocationSearch(e);
//     let val;
//     //setCenter(null);
//     geocoder.geocode({ 'latLng': {lat:e.latLng.lat(), lng:e.latLng.lng()} }, function (results, status) {
//       if (status == google.maps.GeocoderStatus.OK) {
//           //lat = e.getPosition().lat();
//           //lng = e.getPosition().lng();
//           let address = results[0].formatted_address;
//           val = { 'lat': clickloc.lat, 'lng': clickloc.lng, 'address': address }
//           PinLocationSearch(val);
//           //PinLocationSearch({ 'lat': e.latLng.lat(), 'lng': e.latLng.lng(), 'address': address });
//           //setDestination1(address);
//           //alert("\nAddress: " + address);
//           console.log(address, "pindrop2")
//       }
//   });
//   //setMarkerFlag(true);
  }

  // useEffect(() => {
  //   if(map){
  //     map.panTo(center)
  //   }
  // },[center])

  return (
    <GoogleMap
      key={process.env.REACT_APP_GOOGLE_MAP_API_KEY}
      // center={{
      //   lat: Number(center.lat),
      //   lng: Number(center.lng),
      // }}
      center={loc}
      libraries
      zoom={defaultVal.zoom}
      mapContainerStyle={{ width: "100%", height: "100%" }}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: "greedy",
        clickableIcons: true,
        styles: mapStyle,
      }}
      onClick={(e) =>{setCenter({
        lat: Number(e.latLng.lat()),
        lng: Number(e.latLng.lng()),
      });
      DestnMarkerLoad(e);
    }    
    }
      yesIWantToUseGoogleMapApiInternals
      onLoad={(map) => setMap(map)}
    >

      <Marker
        position={loc}
        icon={{
          url: image2,
          scaledSize: { width: 45, height: 45 },
        }}
        draggable={true}
        // onClick={DestnMarkerLoad()}
        onDragEnd={DestnMarkerPos}
      /> 
      
      <Marker 
        icon={{
          url: image2,
          scaledSize: { width: 45, height: 45 },
          }}
        position={coords} 
        zIndex={4} 
        animation={2}
        />

      {/* Recenter button */}
      <button
        className="btn btn-primary gpsButton p-1"
        onClick={() => {
          map.panTo(coords);
          map.setZoom(15);
        }}
            >
        <GpsFixedIcon/>
      </button>
      <TrafficLayer autoUpdate />
    </GoogleMap>
  );
}

export default MapApi;
