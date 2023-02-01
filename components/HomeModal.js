import React, { useEffect } from "react";
import { useState, Suspense } from "react";
import "./HomeModal.css";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import {
  Modal,
  Button,
  Card,
  Row,
  Col,
  Stack,
} from "react-bootstrap";

import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import PlaceIcon from "@mui/icons-material/Place";

/*global google*/

function HomeModal({ 
  state, 
  HomeLoc, 
  Address, 
  latp, 
  lngp,
  socket 
}) {

  const [show, setShow] = useState(true); // To display the modal when the homemodal componenet is triggerred and is set to true by default.

  const [address, setAddress] = useState(""); // To set the home or office location address.
  const [loc, setLocation] = useState({ lat: latp, lng: lngp }); // To set the home or office location lat and lng.
  const [lat, setLat] = useState(); // To obtain current lat value .
  const [lng, setLng] = useState(); // To obtain current lng value.
  const [latlngadd, setLatLngAdd] = useState(""); // To obtain current location address.

  const geocoder = new google.maps.Geocoder(); // variable to obtain when search is given via lat ang lng.
  const classes = useStyles();
  const [value1, setValue1] = React.useState(0);

  function handleChange(event, newValue) {
    setValue1(newValue);
  }

  // To get lat and lng values from the searched location.
  const handleSelect = async (value) => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    setAddress(value);
    setLocation({ lat: latLng.lat, lng: latLng.lng });
  };

  // To close the modal after close button is triggerred.
  const handleClose = () => {
    setShow(false);
    state(false);
  };

  // To pass the latlng and address of the given location to App.js to store in home/office location.
  const handlelocation = () => {
    HomeLoc(loc);
    Address(address);
    setShow(false);
    state(false);
  };

  // To get the current location when loaded
  useEffect(() => {
    getLoc();
  }, [lat, lng]);

  // To set the parsed lat and lng values given by input from user
  const getLoc = () => {
    setLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
  };

  // To calculate the address from the given lat and lng values by user
  const getadd = () => {
    getLoc();
    geocoder
      .geocode({ location: loc })
      .then((response) => {
        if (response.results[0]) {
          setLatLngAdd(response.results[0].formatted_address);
          setAddress(response.results[0].formatted_address);
        } else {
          window.alert("No results found");
        }
      })
      .catch((e) => window.alert("Geocoder failed due to: " + e));
  };

  // Set the current location lat and lng values when Get live cooridinates button is clicked.
  const getLatLngValue = () => {
    let count = 0;
    //console.log(process.env.WEBSOCK_IP);
    //let socket = new WebSocket('ws://localhost:8000');
    //let socket = new WebSocket(`ws://${process.env.WEBSOCK_IP}:8000`);
    //let socket = new WebSocket(`ws://${process.env.REACT_APP_WEBSOCK_IP}:${process.env.REACT_APP_WEBSOCK_PORT}`);
    // socket.addEventListener('open', function (event) { 
    //   socket.send('Connection Established');
    // });
    socket.onopen = function (event) {
      socket.send("Here's some text that the server is urgently awaiting for routenav");
  };
    socket.onmessage = function (event) {
      console.log("run1")
      count = count+1;
        let currLoc = JSON.parse(event.data);
        console.log(event.data);
        setLat(Number(currLoc.Latitude));
        setLng(Number(currLoc.Longitude));
        if(count==1){
          return;
        }
      // socket.addEventListener('message', function (event) {
      //     let currLoc = JSON.parse(event.data);
      //     console.log(event.data);
      //     setLat(Number(currLoc.Latitude));
      //     setLng(Number(currLoc.Longitude));
      // });
    console.log("run2")}
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Location Setup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AppBar position="static" color="default">
            {/* To input search location */}
            <Tabs
              value={value1}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              className={classes.root}
              centered
            >
              <Tab label="Location by Address" {...a11yProps(0)} />
              <Tab
                label="Location by Latitude and Longitude"
                {...a11yProps(1)}
              />
            </Tabs>
          </AppBar>
          <TabPanel value={value1} index={0}>
            <div>
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
                  <div>
                    <input
                      {...getInputProps({
                        className: "form-control",
                        placeholder: "Search here",
                      })}
                    />

                    <div
                      className="autocomplete-dropdown-container"
                      style={{
                        color: "black",
                        position: "absolute",
                        zIndex: "1",
                        width: "56vw",
                      }}
                    >
                      {loading ? <div>...loading</div> : null}
                      {suggestions.map((suggestion) => {
                        const className = suggestion.active
                          ? "suggestion-item--active"
                          : "suggestion-item";
                        const style = suggestion.active
                          ? { backgroundColor: "#c0c0c0", cursor: "pointer" }
                          : { backgroundColor: "#ffffff", cursor: "pointer" };

                        return (
                          <div
                            key={suggestion.placeId}
                            {...getSuggestionItemProps(suggestion, {
                              className,
                              style,
                            })}
                          >
                            <PlaceIcon /> {suggestion.description}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </PlacesAutocomplete>
            </div>
          </TabPanel>
          <br></br>
          <TabPanel value={value1} index={1}>
            {/* To input the latitude and longitude values in the homemodal */}
            <div>
              <Stack direction="horizontal" gap={5}>
                <Row>
                  <Col>
                    <p>Latitude : </p>
                    <input
                      className="form-control"
                      placeholder="Latitude here..."
                      defaultValue={lat}
                      onChange={(e) => setLat(e.target.value)}
                    />{" "}
                  </Col>
                  <Col>
                    <p>Longitude : </p>
                    <input
                      className="form-control"
                      defaultValue={lng}
                      placeholder="Longitude here..."
                      onChange={(e) => setLng(e.target.value)}
                    />
                  </Col>
                </Row>
              </Stack>
              <br></br>
              {/* To display the current position coordinates */}
              <Button
                className="btn  common_btn align-self-end "
                onClick={getLatLngValue}
              >
                Get live Co-ordinates
              </Button>
              &nbsp;&nbsp;&nbsp;
              {/* To get address of the latitude and longitude */}
              <Suspense>
                <Button variant="success" onClick={getadd}>
                  Get Location Address
                </Button>
              </Suspense>
            </div>
            <br></br>
            {/* To display the fetched address from the given lat and lng values */}
            <div>
              <Card>
                <Card.Header>Address</Card.Header>
                <Card.Body>
                  <Card.Text>
                    <strong>{latlngadd}</strong>
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          </TabPanel>
        </Modal.Body>
        <Modal.Footer>
          {/* To save the location input via address or location(lat and lng) */}
          <Button variant="primary" onClick={handlelocation}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// To toggle between the two tabs i.e, Location by address and location by lat and lng values.
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      <Box p={2}>{children}</Box>
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: "#FFF8DC",
  },
}));

export default HomeModal;
