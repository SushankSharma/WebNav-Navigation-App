import React, { useEffect } from "react";
import { useState } from "react";
import { Modal, Button, Tabs, Tab, Card, Row, Col } from "react-bootstrap";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import './SearchModal.css';
import PlaceIcon from '@mui/icons-material/Place';
import ForwardIcon from '@mui/icons-material/Forward';
import DeleteOutlineTwoToneIcon from '@mui/icons-material/DeleteOutlineTwoTone';
import DirectionsIcon from "@material-ui/icons/Directions";
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

/*global google*/

function SearchModal({
  LocationSearch, 
  CloseSearch, 
  recentsearches, 
  favouritesearches,
  travelhistorystart,
  travelhistoryend, 
  recentLocationSearch, 
  recentLocationAddress, 
  recentLocationDirections, 
  SetNavFlag, 
  removeFavourite, 
  removeRecentSearches,
  removeTravelHistory, 
  setFavButtonActive 
}) {

  const [address, setAddress] = useState(""); // To set the searched location in the address.
  const [loc, setLocation] = useState({ lat: null, lng: null, address: "" }); // To set the lat lng values of searched location.
  const [show, setShow] = useState(true); // To show the modal when searchmodal is triggered. It is always set true.
  const add = '12, Whitefield Main Rd, Hagadur, Immadihalli, Whitefield, Bengaluru, Karnataka 560066, India'

  // To get the lat ,lng and address of the searched location
  const handleSelect = async (value) => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    setAddress(value);
    setLocation({ 'lat': latLng.lat, 'lng': latLng.lng, 'address': value });
  };

  // To close the search modal after searching for the location
  const handleClose = () => {
    setShow(false);
    CloseSearch(false);
  }

  // To render the searched location in the map after search icon is triggered and close the modal.
  const handlelocation = () => {
    LocationSearch(loc);
    setShow(false);
    CloseSearch(false);  
  }

  // To get location of the recent searches again and close the modal.
  const searchagain = async (val) => {
    console.log(val);
    const results = await geocodeByAddress(val);
    const latLng = await getLatLng(results[0]);
    recentLocationSearch(latLng);
    recentLocationAddress(val);
    setShow(false);
    CloseSearch(false);
  }

  // To get the directions of the recent searches & favourite searches.
  const getDirections = (val) => {
    SetNavFlag(true);
    recentLocationDirections(val);
    setFavButtonActive(false);
    setShow(false);
    CloseSearch(false);
  }

  // To pass the location that needs to be deleted from the Favourite list.
  const removeFav = (val) => {
    removeFavourite(val);
    SearchModal();
  }

  // To pass the location that needs to be deleted from the recent searches list.
  const removeRecent = (val) => {
    removeRecentSearches(val);
    SearchModal();
  }

  const removeTravelHis = (val) => {
    removeTravelHistory(val);
    SearchModal();
  }

  return (
    <>
      <Modal show={show} onHide={handleClose} size="xl" centered height="75px">
        <Modal.Body >
          <Tabs defaultActiveKey="search" id="uncontrolled-tab-example" className="mb-3 nav nav-pills nav-fill" >
            <Tab eventKey="search" title="Search" style={{height:"55vh", overflowY:"scroll"}}>
              <Row className="container p-2">
                <Col className="container p-0 ms-3">
                  <div className="row-sm">
                    <div className="card mb-3" >
                      <div className="card-header text-center">
                        Location Search
                      </div>
                    </div>
                  </div>
                  {/* To input location to be searched */}
                  <div className="row d-flex flex-row me-0">
                    <PlacesAutocomplete
                      value={address}
                      onChange={setAddress}
                      onSelect={handleSelect}
                    >
                      {({
                        getInputProps,
                        suggestions,
                        getSuggestionItemProps,
                        loading,
                        img,
                      }) => (
                          <div className="col col-sm-11 me-0"><input
                            {...getInputProps({
                              className: "form-control" ,
                              placeholder: "Search here",
                            })} 
                          />

                          <div className=" ms-0" style={{ color: "black", position: "absolute", zIndex: "1", width: "42%"}}>
                            {loading ? <div >...loading</div> : null}
                            {suggestions.map((suggestion) => {
                              const className="item d-flex flex-row"
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
                    {/* Button for search location */}
                    <Button className="col-sm col-sm-1 p-0" variant="primary" onClick={handlelocation} aria-current="page" title="Click to get location" data-bs-toggle="tooltip" data-bs-placement="right"><TravelExploreIcon/></Button>
                  </div>
                </Col>
                {/* Recent searches list */}
                <Col className="container p-0 ms-4">
                  <div className="row-sm me-3" >
                  <div className="card mb-2" >
                    <div className="card-header text-center ">
                      Recent Searches
                    </div>
                  </div>
                  </div>
                  <div className="container-sm ps-1 justify-content-center">
                    {recentsearches[0] == null ? <div className="row justify-content-center p-5 m-5">No Data</div> : null }
                    {recentsearches.map((items) => (
                      <div className="row ">
                      <div className="col-sm col-sm-10 me-0 item">
                        <a onClick={() => searchagain(items)} aria-current="page" title="Click to get location" data-bs-toggle="tooltip" data-bs-placement="right">
                          {items}
                        </a>
                      </div>
                      <Button 
                          className="col-sm mb-2 item-icon-getdirections" 
                          variant="danger" 
                          onClick={() => removeRecent(items)}
                          aria-current="page" title="Remove reentSearch Item From List" data-bs-toggle="tooltip" data-bs-placement="right">
                          <DeleteOutlineTwoToneIcon/>
                        </Button>
                        </div>
                    ))}            
                  </div>
                </Col>
              </Row>
            </Tab>

            {/* Travel History */}
            <Tab eventKey="recentsearch" title="Travel History" style={{height:"55vh", overflowY:"scroll"}}>
            <div className="container py-3" >
            {travelhistorystart[0] == null ? <div className="row justify-content-center p-5 m-5">No Data</div> : null } 
                {travelhistorystart.map((items) => (
                  <div className="row">
                  <div className="col-5 col-sm-5 item-travelhistory"><a>{items[0]}</a></div>
                  <div className="col-sm item-icon-container"><ForwardIcon /></div>
                  <div className="col-5 col-sm-5 item-travelhistory"><a>{items[1]}</a></div>
                          <Button 
                            className="col-sm item-icon-getdirections" 
                            variant="primary" 
                            onClick={() => getDirections(items)} 
                            aria-current="page" title="Get-Directions" data-bs-toggle="tooltip" data-bs-placement="right">
                              <DirectionsIcon/>
                          </Button>
                          <Button 
                            className="col-sm item-icon-getdirections" 
                            variant="danger" 
                            onClick={() => removeTravelHis(items)}
                            aria-current="page" title="Remove reentSearch Item From List" data-bs-toggle="tooltip" data-bs-placement="right">
                            <DeleteOutlineTwoToneIcon/>
                          </Button>
                  </div>
                ))}
              </div>
            </Tab>

            {/* Favourites */}
            <Tab eventKey="favourites" title="Favourites" style={{height:"55vh", overflowY:"scroll"}} >
              <div className="container py-3">
              {favouritesearches[0] == null ? <div className="row justify-content-center p-5 m-5">No Data</div> : null }
              {favouritesearches.map((items) => (<div className="row d-flex flex-row">
                  <div className="col-10 col-sm-10 item-travelhistory"><a onClick={() => searchagain(items)}>{items}</a></div>
                  <Button 
                    className="col-sm item-icon-getdirections" 
                    variant="primary" 
                    onClick={() => getDirections(items)}
                    aria-current="page" title="Get-Directions" data-bs-toggle="tooltip" data-bs-placement="right">
                      <DirectionsIcon/>
                  </Button>
                  <Button 
                    className="col-sm me-1 item-icon-getdirections" 
                    variant="danger" 
                    onClick={() => removeFav(items)}
                    aria-current="page" title="Remove Favourite Item From List" data-bs-toggle="tooltip" data-bs-placement="right">
                      <DeleteOutlineTwoToneIcon/>
                  </Button>
                </div>))}
              </div>
            </Tab>
          </Tabs>
          
        </Modal.Body>
        <Modal.Footer ></Modal.Footer>
          <div className="mb-4 row justify-content-evenly">
            <div className="col-4 col-sm-3"></div>
            <div className="col-4 col-sm-3"></div>
            <Button className="col-3 col-sm-3 me-5" variant="danger" onClick={handleClose} aria-current="page" title="Close Search Window" data-bs-toggle="tooltip" data-bs-placement="right">Close</Button>
          </div>
      </Modal>
    </>
  );
};

export default SearchModal;