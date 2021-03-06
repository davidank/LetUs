import React, { Component }        from 'react';
// Onsen UI
import { Page, Button }            from 'react-onsenui';
// Packages
import Autocomplete                from 'react-google-autocomplete';
import axios                       from 'axios';
// Redux
import { connect }                 from 'react-redux';
import { updateCoords, updateEDP } from '../../redux/actions';
// Styles
import { bodyStyle }               from '../../styles/styles';
import '../../styles/mapStyle.css';
// API Key
import apikey                      from './../../../../config/google-maps-api';
// import  BottomNav                     from './../../views/_global/bottomNav.jsx';

// TODO: Add api key

const inputField = {
  ...bodyStyle,
};

const title = {
  ...bodyStyle,
  fontSize: 'xx-large',
  textAlign: 'center',
};

const searchForm = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
};

class LatLonModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      loaded: false,
    };
    window.googleLoaded = () => {
      this.setState({
        loaded: true,
      });
    };
    this.getInput = (e) => {
      this.setState({ input: e.target.value });
    };
    this.handleSelect = (address) => {
      this.setState({
        address,
        loading: true,
      });
    };
    this.handleChange = (address) => {
      this.setState({
        address,
        geocodeResults: null,
      });
    };
    this.componentDidMount = () => {
      const target = document.getElementsByTagName('body')[0];
      const config = { childList: true };
      // eslint-disable-next-line
      const childObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            node.classList.add('needsclick');
            node.childNodes.forEach((child) => {
              child.classList.add('needsclick');
            });
          });
        });
      });
      // eslint-disable-next-line
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if ([...node.classList].indexOf('pac-container') !== -1) {
              childObserver.observe(node, config);
            }
          });
        });
      });
      this.observer.observe(target, config);
    };
    this.componentWillUnmount = () => {
      // click handling for google drop down
      this.observer.disconnect();
      // TODO: remove google script from being added
    };
    this.componentWillMount = () => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&callback=googleLoaded';
      script.async = true;
      document.body.appendChild(script);
    };
  }

  request(lat, lng) {
    axios.get(`/eventdata/${lat}/${lng}`)
      .then( (response) => {
        if (response) {
          this.props.updateEDP(response.data);
          // push to next page
          this.props.router.push('/create');
        }
      })
      .catch((error) => {
        console.log('An error occured when access data');
      });
  }

  render() {
    return (
      <Page>
        <p style={title}>Where to?</p>
        {
          this.state.loaded ?
            <div style={searchForm}>
              <Autocomplete
                style={inputField}
                onPlaceSelected={(place) => {
                  this.props.updateCoords([
                    place.geometry.location.lat(),
                    place.geometry.location.lng(),
                  ]);
                  this.request(this.props.coords[0],this.props.coords[1]);
                }}
                types={['geocode']}
                componentRestrictions={{ country: 'us' }}
              />
              {/* <Button onClick={console.log(this.state.input)}>Submit</Button> */}
            </div> :
            <div/> // TODO: add loading bar
        }
      </Page>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  updateCoords: (coords) => {
    dispatch(updateCoords(coords));
  },
  updateEDP: (edp) => {
    dispatch(updateEDP(edp));
  },
});

const mapStateToProps = state => ({
  coords: state.coords,
  edp: state.edp,
});

export default connect(mapStateToProps, mapDispatchToProps)(LatLonModule);
