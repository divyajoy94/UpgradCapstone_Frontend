import React, { Component } from 'react';
import Header from '../../common/header/Header';
import './Checkout.css'
import { withStyles } from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import IconButton from '@material-ui/core/IconButton'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'





const styles = theme => ({

    stepper: { //Style for the stepper
        'padding-top': '0px',
        '@media (max-width:600px)': {
            'padding': '0px',
        }
    },
    tab: { //Style for the tab
        "font-weight": 500,
        '@media (max-width:600px)': {
            width: '50%',
        }
    },
    existingAddressTabContainer: {
        float: 'left',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: { //Style for the Grid List 
        flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)',


    },
    gridListTile: { //Style for the Grid list tile .
        textAlign: 'left',
        margin: '30px 0px 20px 0px',
        'border-style': 'solid',
        'border-width': '0.5px 3px 3px 0.5px',
        'border-radius': '10px',
        'padding': '8px',
    },
    addressCheckButton: { // Style fro the address check button
        'float': 'right',
    },
    saveAddressForm: { //Style for the save address form 
        width: '60%',
        'padding': '20px',
        textAlign: 'left',

    },
    formControl: { //Style for the formcontrol
        width: '200px',
    },
    selectField: { //Style for the select field
        width: '100%',
    },
    formButton: { // Style for the button in the form
        'font-weight': 400,
        'width': '150px'
    },

})


// Custom component created for the use in the tab
const TabContainer = function (props) {
    return (
        <Typography className={props.className} component="div">
            {props.children}
        </Typography>
    )
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired
}

class Checkout extends Component {
    constructor() {
        super()
        this.state = {
            activeStep: 0,
            steps: this.getSteps(),
            value: 0,
            addresses: null,
            noOfColumn: 3,
            isLoggedIn: sessionStorage.getItem('access-token') === null ? false : true,
            selectedAddress: "",
            flatBuildingName: "",
            flatBuildingNameRequired: "dispNone",
            locality: "",
            localityRequired: "dispNone",
            city: "",
            cityRequired: "dispNone",
            selectedState: "",
            stateRequired: "dispNone",
            pincode: "",
            pincodeRequired: "dispNone",
            pincodeHelpText: "dispNone",
            states: [],


        }
    }

    //This method is called to get the array of steps name.
    getSteps = () => {
        return ['Delivery', 'Payment'];
    }

    //This method handles change in the tabs.
    tabsChangeHandler = (event, value) => {
        this.setState({
            value,
        });
    }

     // This method is called when the save address button is clicked from the address form 
    //This method uses save address endpoint and sends the data as required by the endpoint to be persisted in the data base.
    saveAddressClickHandler = () => {
        if (this.saveAddressFormValid()) { //checking the form validity is right only then the api call is made
            let newAddressData = JSON.stringify({ //Creating data of address to be sent to the end point.
                "city": this.state.city,
                "flat_building_name": this.state.flatBuildingName,
                "locality": this.state.locality,
                "pincode": this.state.pincode,
                "state_uuid": this.state.selectedState,
            })

            let xhrSaveAddress = new XMLHttpRequest();
            let that = this;

            xhrSaveAddress.addEventListener("readystatechange", function () {
                if (xhrSaveAddress.readyState === 4 && xhrSaveAddress.status === 201) {
                    that.setState({
                        ...that.state,
                        value: 0,

                    })
                    that.getAllAddress(); //Updating the page by calling get all address
                }
            })

            xhrSaveAddress.open('POST', this.props.baseUrl + 'address')
            xhrSaveAddress.setRequestHeader('authorization', 'Bearer ' + this.state.accessToken)
            xhrSaveAddress.setRequestHeader("Content-Type", "application/json");
            xhrSaveAddress.send(newAddressData);
        }
    }

    //This method checks the validity of the form submitted.
    //This method return true if form is all right else displays relevant msg.
    saveAddressFormValid = () => {
        let flatBuildingNameRequired = "dispNone";
        let cityRequired = "dispNone";
        let localityRequired = "dispNone";
        let stateRequired = "dispNone";
        let pincodeRequired = "dispNone";
        let pincodeHelpText = "dispNone";
        let saveAddressFormValid = true;

        if (this.state.flatBuildingName === "") { //checking if the flatBuildingName is not empty
            flatBuildingNameRequired = "dispBlock";
            saveAddressFormValid = false;
        }

        if (this.state.locality === "") { //checking if the locality is not empty
            localityRequired = "dispBlock";
            saveAddressFormValid = false;
        }

        if (this.state.selectedState === "") { //checking if the selectedState is not empty
            stateRequired = "dispBlock";
            saveAddressFormValid = false;
        }

        if (this.state.city === "") { //checking if the city is not empty
            cityRequired = "dispBlock";
            saveAddressFormValid = false;
        }

        if (this.state.pincode === "") { //checking if the pincode is not empty
            pincodeRequired = "dispBlock";
            saveAddressFormValid = false;
        }
        if (this.state.pincode !== "") {
            var pincodePattern = /^\d{6}$/;
            if (!this.state.pincode.match(pincodePattern)) {  //checking the format of the pincode
                pincodeHelpText = "dispBlock";
                saveAddressFormValid = false;
            }
        }
        this.setState({
            ...this.state,
            flatBuildingNameRequired: flatBuildingNameRequired,
            cityRequired: cityRequired,
            localityRequired: localityRequired,
            stateRequired: stateRequired,
            pincodeRequired: pincodeRequired,
            pincodeHelpText: pincodeHelpText,
        })

        return saveAddressFormValid
    }


    //This method handles change in the input of FlatBuildingNameChangeHandler
    inputFlatBuildingNameChangeHandler = (event) => {
        this.setState({
            ...this.state,
            flatBuildingName: event.target.value,
        })
    }

    //This method handles change in the input of locality
    inputLocalityChangeHandler = (event) => {
        this.setState({
            ...this.state,
            locality: event.target.value,
        })
    }

    //This method handles change in the input of city
    inputCityChangeHandler = (event) => {
        this.setState({
            ...this.state,
            city: event.target.value,
        })
    }

     //This method handles change in the input of state
     selectSelectedStateChangeHandler = (event) => {
        this.setState({
            ...this.state,
            selectedState: event.target.value,
        })
    }

    //This method handles change in the input of pincode
    inputPincodeChangeHandler = (event) => {
        this.setState({
            ...this.state,
            pincode: event.target.value,
        })
    }

    // This Method is called when the address is selected from the existing address tab
    addressSelectedClickHandler = (addressId) => {
        let addresses = this.state.addresses;
        let selectedAddress = "";
        addresses.forEach(address => {
            if (address.id === addressId) {
                address.selected = true;
                selectedAddress = address.id;
            } else {
                address.selected = false;
            }
        })
        this.setState({
            ...this.state,
            addresses: addresses,
            selectedAddress: selectedAddress
        })
    }

    //This method is called when the components are mounted and in turn calls the api.
    //This method call get all address,get all states and get all payment endpoints.
    //Then re-renders the page with the data received from the api
    componentDidMount() {
        if (this.state.isLoggedIn) {
            //Calling getAllAddress function to get all the address of the customer.
            this.getAllAddress();

            //API call to get all states 
            let statesData = null;
            let xhrStates = new XMLHttpRequest();
            let that = this;
            xhrStates.addEventListener("readystatechange", function () {
                if (xhrStates.readyState === 4 && xhrStates.status === 200) {
                    let states = JSON.parse(xhrStates.responseText).states;
                    that.setState({
                        ...that.state,
                        states: states,
                    })
                }
            })
            xhrStates.open('GET', this.props.baseUrl + 'states');
            xhrStates.send(statesData);

        }
    }
    

    getAllAddress = () => {
        let data = null;
        let that = this;
        let xhrAddress = new XMLHttpRequest();

        xhrAddress.addEventListener('readystatechange', function () {
            if (xhrAddress.readyState === 4 && xhrAddress.status === 200) {
                let responseAddresses = JSON.parse(xhrAddress.responseText).addresses;
                let addresses = [];
                if (!responseAddresses === null) {
                    responseAddresses.forEach(responseAddress => {
                        let address = {
                            id: responseAddress.id,
                            city: responseAddress.city,
                            flatBuildingName: responseAddress.flat_building_name,
                            locality: responseAddress.locality,
                            pincode: responseAddress.pincode,
                            state: responseAddress.state,
                            selected: false,
                        }
                        addresses.push(address)
                    })
                }
                that.setState({
                    ...that.state,
                    addresses: addresses
                })
            }
        })

        xhrAddress.open('GET', this.props.baseUrl + 'address/customer');
        xhrAddress.setRequestHeader('authorization', 'Bearer ' + this.state.accessToken)
        xhrAddress.send(data);

    }

    render() {
        const { classes } = this.props
        return (
            <div>
                <Header></Header>
                <div className="checkout-container">
                    <div className="stepper-container">
                        <Stepper activeStep={this.state.activeStep} orientation="vertical" className={classes.stepper}>
                            {
                                this.state.steps.map((label, index) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                        <StepContent>
                                            {
                                                index === 0 ?
                                                    <div className="address-container">
                                                        <Tabs className="address-tabs" value={this.state.value} onChange={this.tabsChangeHandler}>
                                                            <Tab label="EXISTING ADDRESS" className={classes.tab} />
                                                            <Tab label="NEW ADDRESS" className={classes.tab} />
                                                        </Tabs>
                                                        {
                                                            this.state.value === 0 &&
                                                            <TabContainer className={classes.existingAddressTabContainer}>
                                                                {
                                                                    this.state.addresses === null || undefined ?
                                                                        <Typography variant='h6' color='textSecondary'>
                                                                            There are no saved addresses! You can save an address using the 'New Address' tab or using your 'Profile' menu option.
                                                                        </Typography>
                                                                        :
                                                                        <GridList className={classes.gridList} cols={this.state.noOfColumn} spacing={2} cellHeight='auto'>
                                                                            {this.state.addresses.map(address => (
                                                                                <GridListTile className={classes.gridListTile} key={address.id} style={{ borderColor: address.selected ? "rgb(224,37,96)" : "white" }}>
                                                                                    <div className="grid-list-tile-container">
                                                                                        <Typography variant="body1" component="p">{address.flatBuildingName}</Typography>
                                                                                        <Typography variant="body1" component="p">{address.locality}</Typography>
                                                                                        <Typography variant="body1" component="p">{address.city}</Typography>
                                                                                        <Typography variant="body1" component="p">{address.state.state_name}</Typography>
                                                                                        <Typography variant="body1" component="p">{address.pincode}</Typography>
                                                                                        <IconButton className={classes.addressCheckButton} onClick={() => this.addressSelectedClickHandler(address.id)}>
                                                                                            <CheckCircleIcon style={{ color: address.selected ? "green" : "grey" }} />
                                                                                        </IconButton>
                                                                                    </div>
                                                                                </GridListTile>
                                                                            ))}
                                                                        </GridList>
                                                                }


                                                            </TabContainer>
                                                        }
                                                        {
                                                            this.state.value === 1 &&
                                                            <TabContainer className={classes.saveAddressForm}>
                                                                <FormControl required className={classes.formControl}>
                                                                    <InputLabel htmlFor="flat-building-name">Flat / Building No.</InputLabel>
                                                                    <Input id="flat-building-name" className="input-fields" flatbuildingname={this.state.flatBuildingName} fullWidth={true} onChange={this.inputFlatBuildingNameChangeHandler} value={this.state.flatBuildingName} />
                                                                    <FormHelperText className={this.state.flatBuildingNameRequired}>
                                                                        <span className="red">required</span>
                                                                    </FormHelperText>
                                                                </FormControl>
                                                                <br />
                                                                <br />
                                                                <FormControl className={classes.formControl}>
                                                                    <InputLabel htmlFor="locality">Locality</InputLabel>
                                                                    <Input id="locality" className="input-fields" locality={this.state.locality} fullWidth={true} onChange={this.inputLocalityChangeHandler} value={this.state.locality} />
                                                                    <FormHelperText className={this.state.localityRequired}>
                                                                        <span className="red">required</span>
                                                                    </FormHelperText>
                                                                </FormControl>
                                                                <br />
                                                                <br />
                                                                <FormControl required className={classes.formControl}>
                                                                    <InputLabel htmlFor="city">City</InputLabel>
                                                                    <Input id="city" className="input-fields" type="text" city={this.state.city} fullWidth={true} onChange={this.inputCityChangeHandler} value={this.state.city} />
                                                                    <FormHelperText className={this.state.cityRequired}>
                                                                        <span className="red">required</span>
                                                                    </FormHelperText>
                                                                </FormControl>
                                                                <br />
                                                                <br />
                                                                <FormControl required className={classes.formControl}>
                                                                    <InputLabel htmlFor="state">State</InputLabel>
                                                                    <Select id="state" className={classes.selectField} state={this.state.selectedState} onChange={this.selectSelectedStateChangeHandler} MenuProps={{ style: { marginTop: '50px', maxHeight: '300px' } }} value={this.state.selectedState}>
                                                                        {this.state.states.map(state => (
                                                                            <MenuItem value={state.id} key={state.id} >{state.state_name}</MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                    <FormHelperText className={this.state.stateRequired}>
                                                                        <span className="red">required</span>
                                                                    </FormHelperText>
                                                                </FormControl>
                                                                <br />
                                                        <br />
                                                        <FormControl required className={classes.formControl}>
                                                            <InputLabel htmlFor="pincode">Pincode</InputLabel>
                                                            <Input id="pincode" className="input-fields" pincode={this.state.pincode} fullWidth={true} onChange={this.inputPincodeChangeHandler} value={this.state.pincode} />
                                                            <FormHelperText className={this.state.pincodeRequired}>
                                                                <span className="red">required</span>
                                                            </FormHelperText>
                                                            <FormHelperText className={this.state.pincodeHelpText}>
                                                                <span className="red">Pincode must contain only numbers and must be 6 digits long</span>
                                                            </FormHelperText>
                                                        </FormControl>
                                                        <br />
                                                        <br />
                                                        <br />
                                                        <Button variant="contained" className={classes.formButton} color="secondary" onClick={this.saveAddressClickHandler}>SAVE ADDRESS</Button>


                                                            </TabContainer>
                                                        }
                                                    </div>
                                                    :
                                                    ""
                                            }
                                        </StepContent>

                                    </Step>

                                ))
                            }

                        </Stepper>
                    </div>

                </div>
            </div>
        )
    }


}





export default withStyles(styles)(Checkout)