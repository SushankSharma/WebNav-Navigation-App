import React, {useEffect, useState} from 'react';
import logo from '../xos-mark.svg';
import './webnavhome.css';
import { Dropdown} from "react-bootstrap";
import HomeIcon from "@material-ui/icons/Home";
import BusinessIcon from '@mui/icons-material/Business';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import SettingsIcon from '@mui/icons-material/Settings';
import { Card, Modal, Button, } from "react-bootstrap";


function WebNavHome({childToParent, setRealTime}) {

    const [gpsData, setGpsData] = useState();
    const [show, setShow] = useState(false);

    // To clear saved home and office location from the localstorage
    const clearHomeOffice = (val,val1) => {
        localStorage.setItem(val,JSON.stringify({lat:null, lng:null}));
        localStorage.setItem(val1,JSON.stringify(null));
    }

    // To clear the recent searches from the local storage
    const clearRecentFavourite = (val) => {
        localStorage.setItem(val,JSON.stringify([]));
    }

    // To clear all the data from the localstorage
    const resetStorage = () => {
        localStorage.clear();
        localStorage.setItem('home',JSON.stringify({lat:null, lng:null}));
        localStorage.setItem('office',JSON.stringify({lat:null, lng:null}));
        localStorage.setItem('RecentSearches',JSON.stringify([]));
        localStorage.setItem('FavouriteLocations',JSON.stringify([]));
        localStorage.setItem('homeadd',JSON.stringify(null));
        localStorage.setItem('officeadd',JSON.stringify(null));
    }

    const handleOpen = () => {
        setShow(true);
        setRealTime(true);
    }

    const modalStop = () => {
        setShow(false);
    }

    const handleClose = () => {
        setShow(false);
    }

    return(
        <div className="cover-container">
            <div className='text-end pt-2 pb-4 px-2 '>
            
            {/* Dropdown menu for clearing values from the localstorage */}
            <Dropdown align="center">
                <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                  <SettingsIcon/>
                </Dropdown.Toggle>
                <Dropdown.Menu variant="light">
                    <Dropdown.Item href="#/action-1" onClick={()=>clearHomeOffice('home','homeadd')}>Clear Home</Dropdown.Item>
                    <Dropdown.Item href="#/action-2" onClick={()=>clearHomeOffice('office','officeadd')}>Clear Office</Dropdown.Item>
                    <Dropdown.Item href="#/action-3" onClick={()=>clearRecentFavourite('RecentSearches')}>Clear Recent History</Dropdown.Item>
                    <Dropdown.Item href="#/action-4" onClick={()=>clearRecentFavourite('FavouriteLocations')}>Clear Favourites History</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item href="#/action-5" onClick={resetStorage}>Reset Storage</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            {/* <button className="btn btn-primary" onClick={handleOpen} style={{marginTop: "8px"}}>
                GPS Data
            </button> */}
            </div>
         
            {/* <h1>Welcome to XOS Navigation</h1> */}
         
            <header className="App-header container ">
                <img src={logo} className="App-logo" alt="logo" />
            </header>
            
            <div className="text-center py-2">
                <button type="button" 
                    onClick={() => childToParent("home")}
                    //onClick={() => {alert("Home button clicked!")}}
                    className=" m-3 btn btn-primary align-items-center link-dark">
                    <HomeIcon className='m-2' style={{ fontSize: 75 }}/><br/>
                    <p>Home</p>
                </button>

                <button type="button" 
                    onClick={() => childToParent("search")}
                    className=" m-3 btn btn-success align-items-center link-dark">
                    <TravelExploreIcon className='m-2'style={{ fontSize: 75 }}/><br/>
                    <p>Search</p>
                </button>

                <button type="button" 
                    onClick={() => childToParent("office")}
                    className=" m-3 btn btn-warning align-items-center link-dark">
                    <BusinessIcon className='m-2'style={{ fontSize: 75 }}/><br/>
                    <p>Office</p>
                </button>

                <button type="button" 
                    onClick={() => window.close()}
                    className=" m-3 btn btn-danger align-items-center link-dark">
                    <CloseTwoToneIcon className='m-2'style={{ fontSize: 75 }}/><br/>
                    <p>Close</p>
                </button>
            </div>
            <Modal show={show} onHide={handleClose} size="xl" centered  style={{position: "absolute", left:"15%", bottom: "40%", width:"60rem" }}>
                <Modal.Body style={{height:"100px"}}>
                    <div style={{justifyContent: "center" }}><p ><strong>GPS DATA : {gpsData}</strong></p></div>
                    {/* <div style={{justifyContent: "center" }}><p ><strong>LAT LNG DATA : {latlngdata}</strong></p></div> */}
                </Modal.Body>
                <Button className="col-12 col-sm-12 me-5" variant="success" onClick={modalStop} aria-current="page" title="Close Search Window" data-bs-toggle="tooltip" data-bs-placement="right">Close</Button>
            </Modal> 
        </div>
    )
}
export default WebNavHome