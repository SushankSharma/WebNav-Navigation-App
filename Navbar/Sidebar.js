import React, { useEffect, useState } from "react";
import logo from "../xos-mark.svg";
import "./sidebar.css";
import HomeIcon from "@material-ui/icons/Home";
import BusinessIcon from "@mui/icons-material/Business";
import GradeIcon from "@material-ui/icons/Grade";
import GpsFixedIcon from "@material-ui/icons/GpsFixed";
import DirectionsIcon from "@material-ui/icons/Directions";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

function SideBar({
  childToParent,
  SetNavFlag,
  SetSearchFlag,
  address,
  latlng,
  id,
  isfavbuttonactive,
  setFavButtonActive,
  SetHomeOfficeNavFlag,
  SetLiveFlag,
}) {
  const [isnavactive, setIsNavActive] = useState(false); // To set the directions button in active or inactive state
  const [issearchactive, setIsSearchActive] = useState(false); // To set the search button in active or inactive state
  const [ishomeactive, setIsHomeActive] = useState(false); // To set the home button in active or inactive state
  const [isofficeactive, setIsOfficeActive] = useState(false); // To set the office button in active or inactive state
  const [isGpsActive, setIsGpsActive] = useState(false); // To set the gps button in active or inactive state

  // To check if home/office or search icon is triggered from home page and respective icon active.
  useEffect(() => {
    if (id == "home") {
      setIsHomeActive(true);
      return;
    }
    if (id == "office") {
      setIsOfficeActive(true);
      return;
    }
    if (id == "search") {
      setIsSearchActive(true);
      return;
    }
  }, []);

  // To set the directions depending on whether home / office is selected.
  const HomeOfficeDirection = (val) => {
    SetHomeOfficeNavFlag(true, val);
    if (val == "home") {
      setIsHomeActive(true);
      setIsOfficeActive(false);
      setIsSearchActive(false);
      setIsNavActive(false);
      setIsGpsActive(false);
    }
    if (val == "office") {
      setIsOfficeActive(true);
      setIsHomeActive(false);
      setIsSearchActive(false);
      setIsNavActive(false);
      setIsGpsActive(false);
    }
    id = val;
  };

  // To trigger get dirctions icon in side and display routenav component
  const navigation = () => {
    SetNavFlag(true);
    setIsNavActive(true);
    setIsGpsActive(false);
    setIsSearchActive(false);
  };

  // To trigger the searchmodal when search icon is triggerd from the sidebar.
  const SearchFlag = () => {
    SetSearchFlag(true);
    setIsNavActive(false);
    setIsHomeActive(false);
    setIsOfficeActive(false);
    setFavButtonActive(true);
    setIsSearchActive(true);
    setIsGpsActive(false);
  };

  // To set the current searched location as favourite and store in favourites list.
  const favouriteLocation = () => {
    if(address!=null){
      let val = { lat: latlng.lat, lng: latlng.lng, address: address };
      let addobject = localStorage.getItem("FavouriteLocations");
      let parsedadd = JSON.parse(addobject);
      const index = parsedadd.findIndex((element) => element.address === address);
      console.log(index);
      if(index == -1) {
        parsedadd.push(val);
        localStorage.setItem("FavouriteLocations", JSON.stringify(parsedadd));
      }
    }
  };

  // To fetch the current location and render it on the map.
  const currLocation1 = () => {
    SetLiveFlag(true);
    setIsGpsActive(true);
    setIsHomeActive(false);
    setIsOfficeActive(false);
    setIsSearchActive(false);
    setIsNavActive(false);
  };

  return (
    <div
      className="d-flex flex-column flex-shrink-0 bg-dark"
      style={{ width: "5.0rem" }}
    >
      {/* To navigate to home page when clicked on the icon */}
      <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
        <li className="nav-item">
          <a
            href="#"
            onClick={() => childToParent()}
            className="nav-link py-4 border-bottom text-light align-items-center "
            id="icon"
            title="XOS-Web Navigation"
          >
            <img src={logo} className="bi" width="40" height="32" />
          </a>
        </li>

        {/* Icon for displaying home location if stored or display modal */}
        <li className="nav-item">
          <a
            onClick={() => HomeOfficeDirection("home")}
            className={`nav-link py-3 border-bottom text-light align-items-center ${
              ishomeactive ? "active" : ""
            }`}
            aria-current="page"
            title="Home-Location"
            data-bs-toggle="tooltip"
            data-bs-placement="right"
          >
            <HomeIcon className="bi" aria-label="HomeLocation" />
          </a>
        </li>

        {/* Icon to display office location if stored or modal */}
        <li>
          <a
            onClick={() => HomeOfficeDirection("office")}
            className={`nav-link py-3 border-bottom text-light ${
              isofficeactive ? "active" : ""
            }`}
            title="Office-Location"
            data-bs-toggle="tooltip"
            data-bs-placement="right"
          >
            <BusinessIcon className="bi" aria-label="OfficeLocation" />
          </a>
        </li>

        {/* Icon to display the serachmodal when trigerred */}
        <li>
          <a
            onClick={SearchFlag}
            className={`nav-link py-3 border-bottom text-light ${
              issearchactive ? "active" : ""
            }`}
            title="Search-Location"
            data-bs-toggle="tooltip"
            data-bs-placement="right"
          >
            <TravelExploreIcon className="bi" aria-label="OfficeLocation" />
          </a>
        </li>

        {/* Icon to display the current location when triggered */}
        {/* <li>
          <a
            onClick={currLocation1}
            className={`nav-link py-3 border-bottom text-light  ${
              isGpsActive ? "active" : ""
            }`}
            title="Get-Location"
            data-bs-toggle="tooltip"
            data-bs-placement="right"
          >
            <GpsFixedIcon className="bi" aria-label="GetLocation" />
          </a>
        </li> */}

        {/* Icon to set the current location as active or inactive */}
        {isfavbuttonactive ? (
          <li>
            <a
              onClick={favouriteLocation}
              className="nav-link py-3 border-bottom text-light"
              title="Favorite"
              data-bs-toggle="tooltip"
              data-bs-placement="right"
            >
              <GradeIcon className="bi" aria-label="Favorite" />
            </a>
          </li>
        ) : null}

        {/* Icon to display directions of the searched location */}
        <li>
          <a
            onClick={navigation}
            className={`nav-link py-3 border-bottom text-light ${
              isnavactive ? "active" : ""
            }`}
            title="Directions"
            data-bs-toggle="tooltip"
            data-bs-placement="right"
          >
            <DirectionsIcon className="bi" aria-label="Directions" />
          </a>
        </li>
      </ul>

      {/* Icon to navigate back to webnav home page */}
      <div className="dropdown border-top">
        <a
          onClick={() => childToParent()}
          className="d-flex align-items-center justify-content-center p-3 link-dark text-light text-decoration-none"
        >
          <ChevronLeftIcon
            alt="mdo"
            style={{ fontSize: 40 }}
            className="rounded-circle"
          />
        </a>
      </div>
    </div>
  );
}

export default SideBar;
