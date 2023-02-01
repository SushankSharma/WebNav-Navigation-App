import React, {useState, useEffect } from 'react';
import logo from '../xos-mark.svg';
import './navbar.css';
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng,
  } from "react-places-autocomplete";

import SideBar from './Sidebar';

import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import PlaceIcon from '@mui/icons-material/Place';
import SearchIcon from '@mui/icons-material/Search';

function Navbar({childToParent, location, id }) {
    
    const [address, setAddress] = useState("");
    const [showsearch, SetShowsearch] = useState(false);

    useEffect(() => {
        if(id == "search"){
            SetShowsearch(true);
        }else{
            SetShowsearch(false);
        }
    })

    const handleSelect = async (value) => {
        const results = await geocodeByAddress(value);
        const latLng = await getLatLng(results[0]);
        console.log(latLng);
        setAddress(value);
        location(latLng);
      };

    
    return (
        <div>
        <header className="py-3 border-bottom bg-light text-white cover-navbar">
            <div className="container-fluid d-grid  align-items-center" style={{gridTemplateColumns:" 1fr 2fr"}}>
                <p href="#" className="d-flex align-items-center col mb-2 mb-lg-0 link-dark text-decoration-none text-light" id="icon">
                    <img src={logo}  className="bi me-2" width="40" height="32"/>
                    XOS Web-Navigaton
                </p>
                <div className="d-flex justify-content-center">
                    {/* Call search function start*/}
                    <form className="me-5 w-100 me-3">
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
                            <div >
                                 <input
                                    {...getInputProps({
                                    className : "form-control",
                                    placeholder: "Search here",
                                    })} 
                                />
                          
                            <div className="autocomplete-dropdown-container" style={{color : "black", position : "absolute", zIndex : "1", width : "57vw"}}>
                                {loading ? <div>...loading</div> : null}
                                {suggestions.map((suggestion) => {
                                    const className = suggestion.active
                                    ? 'suggestion-item--active'
                                    : 'suggestion-item';
                                  const style = suggestion.active
                                    ? { backgroundColor: '#c0c0c0', cursor: 'pointer' }
                                    : { backgroundColor: '#ffffff', cursor: 'pointer' };

                                return (
                                    <div {...getSuggestionItemProps(suggestion, {className,style,})}>
                                    <PlaceIcon/>  {suggestion.description}
                                    </div>
                                );
                                })}
                            </div>
                            </div>
                        )}
                        </PlacesAutocomplete> 
                        {/* <input type="search" className="form-control form-control-dark" placeholder="Search..." aria-label="Search"/> */}
                    </form>
                    {/* Call search function end*/}

                    {/* Call close with IPC electron function start*/}
                    <div className="flex-shrink-0">
                        <button type="button" className="btn btn-danger me-2">
                        <CloseTwoToneIcon alt="mdo" width="32" height="32" className="rounded-circle"/>
                        </button>
                    </div>
                    {/* Call close with IPC electron function end*/}

                </div>

            </div>

        </header>
    </div>
    )
}

export default Navbar;