import React, { useEffect, useState } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardText, CardBody,
  CardTitle, CardSubtitle, Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import L from 'leaflet';
import { getIcon } from './icon';
import Joi from 'joi';

function App() {

  interface UserMessage {
    [key: string]: string;
  }

  interface Location {
    lat: number;
    lng: number;
    zoom: number;
  }
  
  interface State {
    location: Location;
    haveUsersLocation: boolean
    userMessage: UserMessage;
    messages: any[]
  }

  const [state, setState] = useState<State>({
    location: {
      lat: 43.1306,
      lng: -77.6260,
      zoom: 2,
    },
    haveUsersLocation: false,
    userMessage : {
      name: '',
      message: ''
    },
    messages: []
  });

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setState(prevState => ({
            ...prevState,
            location: {
              lat: latitude,
              lng: longitude,
              zoom: 13,
            },
            haveUsersLocation: true,
          }));
        },
        () => {
          console.log('User did not provide location; estimate using their IP address');
          fetch('https://ipapi.co/json')
          .then(res => res.json())
          .then(location => {
            console.log(location);
            setState(prevState => ({
              ...prevState,
              location: {
                lat: location.latitude,
                lng: location.longitude,
                zoom: 13,
              },
              haveUsersLocation: true,
            }));
          });
        });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    fetch(API_URL)
    .then(res => res.json())
    .then(messages => {
      setState(prevState => ({
        ...prevState,
        messages: messages
      }))
    })
    getUserLocation();
  }, []);

  const myIcon = L.icon({
    iconUrl: getIcon(),
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -41]
  });

  const schema = Joi.object().keys({
    name: Joi.string().min(1).max(500).required(),
    message: Joi.string().alphanum().min(1).max(100).required(),
  });

  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1/messages' : 'production-url-here'

  const formisValid = () => {
    const userMessage = {
      name : state.userMessage.name,
      message: state.userMessage.message
    };
    const result = schema.validate(userMessage);

    return result.error || !state.haveUsersLocation ? false : true;
  }

  const formSubmitted = (event : React.FormEvent) => {
    event.preventDefault();
    console.log(state.userMessage);   
    if (formisValid()) {
      fetch("http://localhost:5000/api/v1/messages", {
        method: 'POST',
        headers: {
          'content-type':'application/json'
        },
        body : JSON.stringify({
          name: state.userMessage.name,
          message: state.userMessage.message,
          latitude: state.location.lat,
          longitude: state.location.lng
        })
      }).then(res => res.json())
      .then(message => {
        console.log(message);
      })
    }

    setState((prevState) => ({
      ...prevState,
      userMessage: {
        name: '',
        message: ''
      }
    }));    
  };

  const valueChanged = (event: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;

    setState((prevState) => ({
      ...prevState,
      userMessage: {
        ...prevState.userMessage,
        [name]: value
      }
    }));
  };

  return (
   <div className="map-container">
      <MapContainer
        className="map"
        center={[state.location.lat, state.location.lng]}
        zoom={state.location.zoom}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        { state.haveUsersLocation ? 
          <Marker position={[state.location.lat, state.location.lng]} icon={myIcon}>
        </Marker> : ''
        }  

        {state.messages.map(message => (
          <Marker key = {message._id} position={[message.latitude, message.longitude]} icon={myIcon}>
          <Popup autoClose={false}>
            <em>{message.name}:</em> {message.message}
          </Popup>
        </Marker>
        ))}    
        <MapUpdater location={state.location} />
      </MapContainer>

        <CardBody className="message-form">
        <CardTitle>Welcome to The Map</CardTitle>
        <CardSubtitle>For UofR students and alumni</CardSubtitle>
        <CardText>Leave your message.</CardText>
        <Form onSubmit={formSubmitted}>
        <FormGroup>
          <Label for="name">Name</Label>
          <Input 
            onChange={valueChanged}
            type="text" 
            name="name" 
            id="name" 
            placeholder="Enter your Name (optional)" />
        </FormGroup>
        <FormGroup>
          <Label for="classyear">Class Year</Label>
          <Input type="text" name="classyear" id="classyear" placeholder="Class Year" />
        </FormGroup>
        <FormGroup>
          <Label for="message">Memory</Label>
          <Input 
            onChange={valueChanged}
            type="textarea" 
            name="message" 
            id="message" 
            placeholder="Submit your memory" />
        </FormGroup>
        <Button type="submit" color="info" disabled={!formisValid()}>Send</Button>{' '}
      </Form>
      </CardBody>
    </div>
  );
}

interface Location {
  lat: number;
  lng: number;
  zoom: number;
}

// need this function else the marker will be updated but not the map location
// reason: map location is only initilized in the beginning and it only keeps the default location value i.e. coordinates of UofR
function MapUpdater({ location } : {location: Location}) {
  const map = useMap();

  useEffect(() => {
    const { lat, lng, zoom } = location;
    map.setView([lat, lng], zoom);
  }, [location, map]);

  return null;
}

export default App;
