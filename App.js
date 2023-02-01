import logo from "./mark.svg";
import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import SideBar from "./Navbar/Sidebar";
import WebNavHome from "./components/webnavhome";
import MapApi from "./components/MapApi";
import HomeModal from "./components/HomeModal";
import RouteNavigation from "./components/RouteNav";
import SearchModal from "./components/SearchModal";
import CurrentLocation from "./components/CurrentLocation";
import { usePosition } from "use-position";
import { Offline, Online } from "react-detect-offline";
import Icon from '@mui/material/Icon';
import Keyboard from "react-simple-keyboard";
import { socket } from "./components/socket";
//let socket;

function App() {
  let currLoc;
  let interval;
  const [coords, setCoords] = useState({
    lat: null,
    lng: null,
  });

  const [realTime, setRealTime] = useState(true);
  const [data, setData] = useState(true);
  const [initiateSock, setInitiateSock] = useState(true);

  useEffect(() => {
    //socket = new WebSocket('ws://localhost:4001');
    socket.addEventListener('open', function (event) { 
      socket.send('Connection Established');
    })
  }, []);

  useEffect(() => {
    console.log("useEffect2")
    socket.addEventListener('message', function(event) {
      console.log(event, "useEffect2");
    })
    socket.addEventListener('message', function(event){
      //console.log(event.data);
      // console.log("Closing connection")
      // // socket.close();
      // setTimeout(() => {
      //   console.log(event);
      // }, 3000)
      //interval = setInterval(() => {
        //console.log(event)
        currLoc = JSON.parse(event.data);
        setCoords({ lat: Number(currLoc.Latitude), lng: Number(currLoc.Longitude) });
        console.log(coords, Number(currLoc.Latitude))
      //}, 2000)
    })
    // setTimeout(() => {
    //   clearInterval(interval);
    //   //socket.close();
    // }, 20000);
    //return () => clearInterval(interval);
  },[]);

  // To pass the id for Home, office and search when selected from the web nav home
  const [id, setId] = useState("");
  const childToParent = (childdata) => {
    setData(!data);
    setId(childdata);
    console.log("Button clicked : ", childdata, coords);
  };

  // To set the Local Storage for home, office, recent, favourites
  if (
    localStorage.getItem("home") == null ||
    localStorage.getItem("office") == null ||
    localStorage.getItem("RecentSearches") == null ||
    localStorage.getItem("FavouriteLocations") == null ||
    localStorage.getItem("TravelHistory") == null    
  ) {
    localStorage.clear();
    localStorage.setItem("home", JSON.stringify({ lat: null, lng: null }));
    localStorage.setItem("office", JSON.stringify({ lat: null, lng: null }));
    localStorage.setItem("RecentSearches", JSON.stringify([]));
    localStorage.setItem("FavouriteLocations", JSON.stringify([]));
    localStorage.setItem("TravelHistory", JSON.stringify([]));
    localStorage.setItem("homeadd", JSON.stringify(null));
    localStorage.setItem("officeadd", JSON.stringify(null));
    localStorage.setItem("Mylocation", JSON.stringify({ lat: null, lng: null }));
  } else {
    //console.log("Keys are already created");
  }

  return (
    // To navigate between Webnav home and Location search, navigation, recent searches screen
    <div>
      <div className="network">
        <Offline>
          <h1>
            You're Offline.Check your{" "}
            {/* <span class="material-icons red-color" style={{ fontSize: "45px" }}>
              wifi_off{" "}
            </span>{" "} */}
            <Icon baseClassName="material-icons red-color">wifi_off</Icon>

            connection!
          </h1>
        </Offline>
      </div>
      {data ? (
        <WebNavHome childToParent={childToParent} setRealTime={setRealTime}/>
      ) : (
        <Main
          childToParent={childToParent}
          id={id}
          // currLat={latitude}
          // currLng={longitude}
          coords={coords}
          socket={socket}
        />
      )}
    </div>
  );
}

function Main({ childToParent, id, currLat, currLng, coords, socket }) {
  console.log(coords)
  // Location variables
  const [latlng, setLatLng] = useState({}); // To set the latlng values from current position or searched location
  const [address, setAddress] = useState(""); // To set the address from the searched location
  const [currlatlng, setCurrlatlng] = useState({}); // Object to store the current position lat and lng values

  // Boolean variables
  const [mod, setMod] = useState(false); // To display the location input modal for home / office if not set
  const [mapflag, setMapFlag] = useState(false); // To navigate between the route navigation screen and location search screen
  const [search, setSearch] = useState(false); // To display the search modal when search icon is pressed in home screen or navigation screen
  const [sidebarflag, setSidebarFlag] = useState(true);

  const [home1, setHome] = useState(false); // To check if the home icon is selected from side bar to store the location in 'home' key(localstorage)
  const [office, setOffice] = useState(false); // To check if the office icon is selected from side bar to store the location in 'office' key(localstorage)

  const [homedirection, setHomeDirection] = useState(false); // To check if directions to be rendered from the current position to stored home location.
  const [officedirection, setOfficeDirection] = useState(false); // To check if directions to be rendered from the current position to stored office location.
  const [searchdirection, setSearchDirection] = useState(false); // To render directions form the current position to the searched location.
  const [keyboardflag1, setKeyboardFlag1] = useState(false);
  const [input, setInput] = useState("");
  const [layout, setLayout] = useState("default");
  const keyboard = useRef();

  const [liveFlag, setLiveFlag] = useState(false); // To obtain the current loction.
  const [isfavbuttonactive, setFavButtonActive] = useState(false); // Favourite button should not be shown in side bar for home and office location.

  const [recentsearches, setRecentSearches] = useState([]); // Array to store the recent searches and pass as a prop to seacrch modal
  const [favouritesearches, setFavouriteSearches] = useState([]); // Array to store the favourites searches and pass as a prop to search modal
  const [travelhistorystart, setTravelHistoryStart] = useState([]);// Array to store the start loc of the travel history
  const [travelhistoryend, setTravelHistoryEnd] = useState([]);// Array to stote the end loc of the travel history

  // For saving the home and office location lat ang lng values in the localstorage.
  const HomeLoc = (val) => {
    // To check if home and office location is given by pressing icons from the sidebar.
    if (home1) {
      localStorage.setItem("home", JSON.stringify(val));
      setLatLng({ lat: val.lat, lng: val.lng });
      setHome(false);
      return;
    }
    if (office) {
      localStorage.setItem("office", JSON.stringify(val));
      setLatLng({ lat: val.lat, lng: val.lng });
      setOffice(false);
      return;
    }
    // To check if home and office location is given by pressing icons from the webnav home page.
    if (id == "home") {
      localStorage.setItem("home", JSON.stringify(val));
      setLatLng({ lat: val.lat, lng: val.lng });
      return;
    }
    if (id == "office") {
      localStorage.setItem("office", JSON.stringify(val));
      setLatLng({ lat: val.lat, lng: val.lng });
      return;
    }
  };

  // For saving the home and office location addresses in the localstorage
  const Address = (val) => {
    // To check if home and office location is given by pressing icons from the sidebar.
    if (home1) {
      localStorage.setItem("homeadd", JSON.stringify(val));
      return;
    }
    if (office) {
      localStorage.setItem("officeadd", JSON.stringify(val));
      return;
    }
    // To check if home and office location is given by pressing icons from the webnav home page.
    if (id == "home") {
      localStorage.setItem("homeadd", JSON.stringify(val));
      return;
    }
    if (id == "office") {
      localStorage.setItem("officeadd", JSON.stringify(val));
      return;
    }
  };

  // Callback function to render location when serach is done
  const LocationSearch = (val) => {
    if (val.lat != null) {
      let addobject = localStorage.getItem("RecentSearches");
      let parsedadd = JSON.parse(addobject);
      console.log(parsedadd, val)
      const index = parsedadd.findIndex((element) => element.address === val.address);
      console.log(index);
      if(index == -1) {
        parsedadd.push(val);
        localStorage.setItem("RecentSearches", JSON.stringify(parsedadd));
        setRecentSearches(parsedadd);
      }
      // Set address state variable to render the location on map
      setLatLng({ lat: val.lat, lng: val.lng });
      setAddress(val.address);
      setLiveFlag(false);
    }
    socket.addEventListener('open', function (event) { 
      socket.send('Connection Established');
    });

      //console.log("run1")
      socket.addEventListener('message', function (event) {
          let currLoc1 = JSON.parse(event.data);
          setCurrlatlng({lat:Number(currLoc1.Latitude), lng:Number(currLoc1.Longitude)})
          console.log(currLoc1, currlatlng);
      });
    setSearchDirection(true); // To render directions on the map for searched location and not home/office
  };

  // Recent Location Search (setting lat lng values)
  const recentLocationSearch = (val) => {
    setLatLng({ lat: val.lat, lng: val.lng });
  };

  // Recent Location Search for rendering only the place(setting address)
  const recentLocationAddress = (val) => {
    setAddress(val);
  };

  // Recent Location Search for rendering the directions(setting address)
  const recentLocationDirections = (val) => {
    setAddress(val);
  };

  // To load the default static address everytime the map is loaded and loading the recent searches and favourites
  useEffect(() => {
    setLatLng({ lat: coords.lat, lng: coords.lng });
    check();
  }, []);

  // To set the current lat and lng values everytime the page is loaded
  useEffect(() => {
    setCurrlatlng({ lat: coords.lat, lng: coords.lng });
    check();
  },[]);

  // Checks the ID for home, office or search given by user to render respective locations when icons are trigered from webnav home page.
  const check = () => {
    if (id == "home") {
      let locobject = localStorage.getItem("home");
      let parsedloc = JSON.parse(locobject);
      if (parsedloc.lat === null) {
        setMod(true); // To display Homemodal is home location not set.
      } else {
        setLatLng({ lat: parsedloc.lat, lng: parsedloc.lng });
      }
    }
    if (id == "office") {
      let locobject = localStorage.getItem("office");
      let parsedloc = JSON.parse(locobject);
      if (parsedloc.lat === null) {
        setMod(true); // To display Homemodal if office location not set.
      } else {
        setLatLng({ lat: parsedloc.lat, lng: parsedloc.lng });
      }
    }
    if (id == "search") {
      setSearch(true); // To display Searchmodal when search is triggered.
      setFavButtonActive(true);
      // Fetch recent searches from localstorage
      let addobject = localStorage.getItem("RecentSearches");
      let parsedadd = JSON.parse(addobject);
      if (parsedadd) {
        let recentaddress = parsedadd.map((items) => items.address);
        setRecentSearches(recentaddress.reverse());
      }
      // Fetch favourites from localstorage
      let favaddobject = localStorage.getItem("FavouriteLocations");
      let parsedfavadd = JSON.parse(favaddobject);
      if (parsedfavadd) {
        let favaddress = parsedfavadd.map((items) => items.address);
        setFavouriteSearches(favaddress.reverse());
      }
      // Fetch Travel history from localstorage
      let travelhistoryobject = localStorage.getItem("TravelHistory");
      let parsedtravelhistory = JSON.parse(travelhistoryobject);
      let i=0;
      let travelhis=[];
      if (parsedtravelhistory){
        let startloc = parsedtravelhistory.map((items) => items.start);
        //setTravelHistoryStart(startloc.reverse());
        let endloc = parsedtravelhistory.map((items) => items.end);
        let len = startloc.length;
        for(i=0; i<len; i++){
          travelhis.push([startloc[i], endloc[i]])
        }
        setTravelHistoryStart(travelhis.reverse());
        console.log(travelhis);
        console.log(len);
        setTravelHistoryEnd(endloc.reverse());
      }
    }
  };

  // For future use
  const state = (val) => {
    setMod(val);
  };

  // For future use in navigation
  const closeRouteNavigation = (val) => {
    setMapFlag(val);
  };

  // For Rendering the directions from current location to the home/office or searched locations in the map.
  const SetNavFlag = (val) => {
    if (homedirection) {
      let addobject = localStorage.getItem("homeadd");
      let parsedadd = JSON.parse(addobject);
      setAddress(parsedadd);
      setHomeDirection(false);
      setOfficeDirection(false);
      setMapFlag(val);
      return;
    }
    if (officedirection) {
      let addobject = localStorage.getItem("officeadd");
      let parsedadd = JSON.parse(addobject);
      setAddress(parsedadd);
      setHomeDirection(false);
      setOfficeDirection(false);
      setMapFlag(val);
      return;
    }
    if (searchdirection || id == "search") {
      setMapFlag(val);
      console.log(address)
      return;
    }
    // If icons are triggered from webnav home page are either home / office
    if (id == "home") {
      let addobject = localStorage.getItem("homeadd");
      let parsedadd = JSON.parse(addobject);
      setAddress(parsedadd);
      setMapFlag(val);
      return;
    }
    if (id == "office") {
      let addobject = localStorage.getItem("officeadd");
      let parsedadd = JSON.parse(addobject);
      setAddress(parsedadd);
      setMapFlag(val);
      return;
    }
  };

  // To render home or office location from the icons in the sidebar
  const SetHomeOfficeNavFlag = (val, val1) => {
    if (val1 == "home") {
      let locobject = localStorage.getItem("home");
      let parsedloc = JSON.parse(locobject);
      if (parsedloc.lat === null) {
        setMapFlag(false);
        setOfficeDirection(false);
        setHomeDirection(true);
        setHome(true);
        setOffice(false);
        setMod(true);
        setLiveFlag(false);
      } else {
        setMapFlag(false);
        setLiveFlag(false);
        setLatLng({ lat: parsedloc.lat, lng: parsedloc.lng });
        setHomeDirection(true);
      }
    }
    if (val1 == "office") {
      setHomeDirection(false);
      let locobject = localStorage.getItem("office");
      let parsedloc = JSON.parse(locobject);
      if (parsedloc.lat === null) {
        setMapFlag(false);
        setHomeDirection(false);
        setOfficeDirection(true);
        setOffice(true);
        setHome(false);
        setMod(true);
        setLiveFlag(false);
      } else {
        setMapFlag(false);
        setLiveFlag(false);
        setLatLng({ lat: parsedloc.lat, lng: parsedloc.lng });
        setOfficeDirection(true);
      }
    }
  };

  // To display Search modal when search icon inside the sidebar is trigerred
  const SetSearchFlag = (val) => {
    setHomeDirection(false);
    setOfficeDirection(false);
    setMapFlag(false);
    setLiveFlag(false);
    setSearch(true);
    let addobject = localStorage.getItem("RecentSearches");
    let parsedadd = JSON.parse(addobject);
    let recentaddress = parsedadd.map((items) => items.address);
    setRecentSearches(recentaddress.reverse());
    let favaddobject = localStorage.getItem("FavouriteLocations");
    let parsedfavadd = JSON.parse(favaddobject);
    let favaddress = parsedfavadd.map((items) => items.address);
    setFavouriteSearches(favaddress.reverse());
    let travelhistoryobject = localStorage.getItem("TravelHistory");
      let parsedtravelhistory = JSON.parse(travelhistoryobject);
      let i=0;
      let travelhis=[];
      if (parsedtravelhistory){
        let startloc = parsedtravelhistory.map((items) => items.start);
        let endloc = parsedtravelhistory.map((items) => items.end);
        let len = startloc.length;
        for(i=0; i<len; i++){
          travelhis.push([startloc[i], endloc[i]])
        }
        setTravelHistoryStart(travelhis.reverse());
        console.log(travelhis);
        console.log(travelhistorystart);
        console.log(len);
      }
  };

  // To close the searchmodal after close button is triggered
  const CloseSearch = (val) => {
    setSearch(val);
  };

  // Delete items from the RecentSearches List
  const removeRecentSearches = (val) => {
    let addobject = localStorage.getItem("RecentSearches");
    let parsedadd = JSON.parse(addobject);
    const index = parsedadd.findIndex((element) => element.address === val);
    if (index != -1) {
      parsedadd.splice(index, 1);
    }
    let recentaddress = parsedadd.map((items) => items.address);
    setRecentSearches(recentaddress.reverse());
    localStorage.setItem("RecentSearches", JSON.stringify(parsedadd));
  };

  // Delete individual items from the Favourites List
  const removeFavourite = (val) => {
    let favaddobject = localStorage.getItem("FavouriteLocations");
    let parsedfavadd = JSON.parse(favaddobject);
    const index = parsedfavadd.findIndex((element) => element.address === val);
    if (index != -1) {
      parsedfavadd.splice(index, 1);
    }
    let favaddress = parsedfavadd.map((items) => items.address);
    setFavouriteSearches(favaddress.reverse());
    localStorage.setItem("FavouriteLocations", JSON.stringify(parsedfavadd));
  };

  // Delete individual items from Travel History
  const removeTravelHistory = (val) => {
    console.log(val);
    let travelhistoryobject = localStorage.getItem("TravelHistory");
    let parsedTravelhistory = JSON.parse(travelhistoryobject);
    const index = parsedTravelhistory.findIndex((element) => element.start === val[0]);
    console.log(index);
    if(index != -1) {
      console.log("found!")
      parsedTravelhistory.splice(index, 1);
    }
    localStorage.setItem("TravelHistory", JSON.stringify(parsedTravelhistory));
    let travelhis=[];
    let i=0;
      if (parsedTravelhistory){
        let startloc = parsedTravelhistory.map((items) => items.start);
        let endloc = parsedTravelhistory.map((items) => items.end);
        let len = startloc.length;
        for(i=0; i<len; i++){
          travelhis.push([startloc[i], endloc[i]])
        }
        setTravelHistoryStart(travelhis.reverse());
  }};

  // To fetch current location after the recenter button is trigerred in sidebar
  const SetLiveLocFlag = () => {
    setLiveFlag(true);
    setMapFlag(false);
    setCurrlatlng({ lat: coords.lat, lng: coords.lng });
  };

  // To set Destination address using Pin drop instaed of search bar
  const PinLocationSearch = (val) => {
    console.log(val);
    setOfficeDirection(false);
    setHomeDirection(false);
    setLatLng({lat: val.latLng.lat(), lng: val.latLng.lng()});
    console.log(address)
  };

  const keyBoardClick = () => {
    setKeyboardFlag1(true);
    console.log("clicked");
  }
  const onChange1 = input => {
    setInput(input);
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
      setKeyboardFlag1(false);
      //setDestination1(destination1);
    }
    if (button === "{shift}" || button === "{lock}") handleShift();
  };

  const onChangeInput = event => {
    const input = event.target.value;
    setInput(input);
    keyboard.current.setInput(input);
  };

  return (
    <div>
      {/* <Navbar location = {location} id={id}/> */}
      <div className="main">
        {sidebarflag ? (
          <SideBar
            childToParent={childToParent}
            SetNavFlag={SetNavFlag}
            SetSearchFlag={SetSearchFlag}
            address={address}
            latlng={latlng}
            id={id}
            isfavbuttonactive={isfavbuttonactive}
            setFavButtonActive={setFavButtonActive}
            SetHomeOfficeNavFlag={SetHomeOfficeNavFlag}
            SetLiveFlag={SetLiveLocFlag}
          />
        ) : null}
        <div className="map">
          {mapflag ? (
            <RouteNavigation
              //destination={address}
              destination={latlng}
              closeRouteNavigation={closeRouteNavigation}
              lat={currlatlng.lat}
              lng={currlatlng.lng}
              setSidebarFlag={setSidebarFlag}
              coords={coords}
              keyBoardClick={keyBoardClick}
              socket={socket}
            />
          ) 
          : 
            <MapApi 
              loc={latlng}
              coords={currlatlng}
              //coords={coords}
              PinLocationSearch={PinLocationSearch}
              liveFlag={liveFlag} 
            />
          }
        </div>
      </div>
      {mod ? (
        <HomeModal
          state={state}
          HomeLoc={HomeLoc}
          Address={Address}
          latp={currLat}
          lngp={currLng}
          //socket={socket}
        />
      ) : null}
      {search ? (
        <SearchModal
          CloseSearch={CloseSearch}
          LocationSearch={LocationSearch}
          recentsearches={recentsearches}
          favouritesearches={favouritesearches}
          travelhistorystart={travelhistorystart}
          travelhistoryend={travelhistoryend}
          recentLocationSearch={recentLocationSearch}
          recentLocationAddress={recentLocationAddress}
          recentLocationDirections={recentLocationDirections}
          SetNavFlag={SetNavFlag}
          removeFavourite={removeFavourite}
          removeRecentSearches={removeRecentSearches}
          removeTravelHistory={removeTravelHistory}
          setFavButtonActive={setFavButtonActive}
        />
      ) : null}
      {/* {keyboardflag1 ?
        (<Keyboard
          //keyboardRef={r => (keyboard.current = r)}
          layoutName={layout}
          onChange={onChange1}
          onKeyPress={onKeyPress}
          {...console.log("clicked keyboard")}
        /> 
      ) : null} */}
    </div>
  );
}
export default App;
