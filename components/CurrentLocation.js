import { useState, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import mapStyle from "./mapStyle";
import "./GpsButton.css";
import { GiCrosshair } from "react-icons/gi";

function CurrentLocation(loc) {
  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [clickloc, setClickLoc] = useState({
    lat: Number(loc.loc.lat),
    lng: Number(loc.loc.lng),
  });
  const [center, setCenter] = useState({
    lat: Number(loc.loc.lat),
    lng: Number(loc.loc.lng),
  });

  const defaultVal = {
    zoom: 12,
  };

  // useEffect(() => {
  //   navigator.geolocation.getCurrentPosition(function (position) {
  //     setCenter({
  //       lat: Number(position.coords.latitude),
  //       lng: Number(position.coords.longitude),
  //     });
  //   });
  // }, []);

  return (
    <GoogleMap
      center={{
        lat: Number(clickloc.lat),
        lng: Number(clickloc.lng),
      }}
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
      onClick={(e) =>
        setClickLoc({
          lat: Number(e.latLng.lat()),
          lng: Number(e.latLng.lng()),
        })
      }
      yesIWantToUseGoogleMapApiInternals
      onLoad={(map) => setMap(map)}
    >

      {/* Marker for pin drop */}
      <Marker
        position={clickloc}
        icon={{
          url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
          scaledSize: { width: 32, height: 32 },
        }}
      />
      {/* Marker for current location */}
      <Marker position={center} zIndex={4} />

      {/* Recenter button */}
      <button
        className="gpsButton"
        onClick={() => {
          map.panTo(center);
          map.setZoom(15);
        }}
      >
        <GiCrosshair
          style={{
            color: "black",
            fontSize: "1.8rem",
            zIndex: "1",
            backgroundColor: "white",
          }}
        />
      </button>
    </GoogleMap>
  );
}

export default CurrentLocation;
