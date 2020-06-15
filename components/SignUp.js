import React, { Component } from 'react';
import { Notifications } from 'expo';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, View, Button, StyleSheet, TextInput, TouchableOpacity, AsyncStorage, KeyboardAvoidingView, ScrollView } from 'react-native';
import { styles, main, widthTall, flexTall, text, btn, input, flexDirection } from '../assets/stylesCustom';
import { AuthContext } from '../Context/AuthContext';
import { ConstEnv } from './tools/ConstEnv';
import { Error } from './tools/Error';
import { Success } from './tools/Success';

export const SingUp = ({ navigation }) => {
    const [email, setEmail] = React.useState('');
    const [firstname, setFirstname] = React.useState('');
    const [lastname, setLastname] = React.useState('');
    const [emailConfirm, setEmailConfirm] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [passwordConfirm, setPasswordConfirm] = React.useState('');
    const [birthday, setBirthday] = React.useState(Date.now());
    const [addressLine1, setAddressLine1] = React.useState('');
    const [addressLine2, setAddressLine2] = React.useState('');
    const [city, setCity] = React.useState('');
    const [postalCode, setPostalCode] = React.useState('');
    const [response, setResponse] = React.useState();
    const [date, setDate] = React.useState(Date.now());
    const [mode, setMode] = React.useState('date');
    const [show, setShow] = React.useState(false);
    const [expoPushToken, setExpoPushToken] = React.useState();

    const { signUpContext } = React.useContext(AuthContext);

    const onChange = (event, selectedDate) => {

        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setBirthday(event.nativeEvent.timestamp);
        setDate(currentDate);
    };

    const showMode = currentMode => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        setDate(date)
        showMode('date');
    };

    const validatorData = () => {
        let data = {
            address: {
                Country: "FR"
            },
            Nationality: "FR",
            CountryOfResidence: "FR",
            Capacity: "NORMAL",
            Tag: "Postman create a user"
        };
        let errorData = { error: false };

        if (firstname.repeat(1).length > 0 && toString(firstname)) {
            data.firstname = firstname
        } else {
            errorData.error = true;
            errorData.champ = ["firstname"]
        }
        if (lastname.repeat(1).length > 0 && toString(lastname)) {
            data.lastname = lastname
        } else {
            errorData.error = true;
            errorData.champ = ["lastname"]
        }
        if (email.repeat(1).length > 0 && email.includes('@') && emailConfirm.repeat(1).length > 0 && toString(email) === toString(emailConfirm)
        ) {
            data.email = email;
            data.emailConfirm = emailConfirm;
        } else {
            errorData.error = true;
            errorData.champ = ["email", "emailConfirm"];
        }
        if (password.repeat(1).length > 7 && passwordConfirm.repeat(1).length > 7 && toString(password) && toString(passwordConfirm) && password === passwordConfirm
        ) {
            data.password = password;
            data.passwordConfirm = passwordConfirm;
        } else {
            errorData.error = true;
            errorData.champ = ["password", "passWordConfirm"];
        }
        if (addressLine1.repeat(1).length > 0 && toString(addressLine1)) {
            data.address.addressLine1 = addressLine1;
        } else {
            errorData.error = true;
            errorData.champ = ["addressLine1"];
        }
        if (city.repeat(1).length > 0 && toString(city)) {
            data.address.city = city;
        } else {
            errorData.error = true;
            errorData.champ = ["city"];
        }
        data.address.addressLine2 = addressLine2;
        data.address.postalCode = postalCode;
        data.bio = '';
        data.birthday = Math.round(birthday / 1000);

        return { data, errorData };

    };

    const RegisterPushNotification = async () => {
        if (Constants.isDevice) {
            const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
                finalStatus = status;
            }
            
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            tokenPush = await Notifications.getExpoPushTokenAsync();
            setExpoPushToken(tokenPush);
        } else {
            alert('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            Notifications.createChannelAndroidAsync('default', {
                name: 'default',
                sound: true,
                priority: 'max',
                vibrate: [0, 250, 250, 250],
            });
        }
        return  tokenPush;
    }

    const _signupSend = async () => {
        RegisterPushNotification();
        let data = validatorData();
        
        let dataRequest = data.data;
        dataRequest.expoPushToken = expoPushToken;
        let errorData = data.errorData;

        if (!errorData.error) {
            
            fetch(ConstEnv.host + ConstEnv.signUp, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataRequest),
            })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.error) {
                        setResponse(<Error message={responseJson.message} />);
                    } else {
                        setResponse(<Success message={responseJson.message} />);
                        const userApp = JSON.parse(responseJson.user);
                        AsyncStorage.setItem('data', JSON.stringify(userApp));
                        AsyncStorage.setItem('userToken', userApp.apitoken);
                        AsyncStorage.setItem('activeCouturier', JSON.stringify(userApp.activeCouturier));
                        AsyncStorage.setItem('firstname', userApp.firstname);
                        AsyncStorage.setItem('lastname', userApp.lastname);
                        AsyncStorage.setItem('username', userApp.username);
                        AsyncStorage.setItem('email', userApp.email);
                        AsyncStorage.setItem('privateMode', JSON.stringify(userApp.privateMode));
                        AsyncStorage.setItem('screenOpen', "profil")
                        signUpContext(userApp.apitoken)
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            setResponse(<Error message={"champs non valide ou incorrecte"} />);
        }
    }
    return (
        <ScrollView style={main.scroll}>
            <View style={{flex:2, marginTop:24}}>
                <Text style={text.h1}>MyCouturier</Text>
            </View>
            <View style={widthTall.width08, { alignItems: 'center' }}>
                <TextInput
                    style={input.signUp}
                    placeholder="Prénom"
                    onChangeText={setFirstname}
                    defaultValue={firstname}
                />
                <TextInput
                    style={input.signUp}
                    placeholder="Nom"
                    onChangeText={setLastname}
                    defaultValue={lastname}
                />
                <View style={flexDirection.row} >
                    <Text style={input.date}>{new Date(birthday).getDate()} / {new Date(birthday).getMonth() +1} / {new Date(birthday).getFullYear()}  </Text>
                    <View style={{ marginLeft: 15 }}>
                        <Button onPress={showDatepicker} title="date de naissance" />
                    </View>
                    {show && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            timeZoneOffsetInMinutes={0}
                            value={date}
                            mode="date"
                            // is24Hour={true}
                            display="spinner"
                            onChange={onChange}
                        />
                    )}
                </View>
                <TextInput
                    style={input.signUp}
                    placeholder="Adresse email"
                    onChangeText={setEmail}
                    defaultValue={email}
                />
                <TextInput
                    style={input.signUp}
                    placeholder="Confirmer adresse email"
                    onChangeText={setEmailConfirm}
                    defaultValue={emailConfirm}
                />
                <TextInput
                    style={input.signUp}
                    placeholder="adresse"
                    onChangeText={setAddressLine1}
                    defaultValue={addressLine1}
                />
                <TextInput
                    style={input.signUp}
                    placeholder="complément d'adresse"
                    onChangeText={setAddressLine2}
                    defaultValue={addressLine2}
                />
                <TextInput
                    style={input.signUp}
                    placeholder="ville"
                    onChangeText={setCity}
                    defaultValue={city}
                />
                <TextInput
                    style={input.signUp}
                    placeholder="code postal"
                    onChangeText={setPostalCode}
                    defaultValue={postalCode}
                />
                <TextInput
                    style={input.signUp}
                    placeholder="Mot de passe"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={true}
                />
                <TextInput
                    style={input.signUp}
                    placeholder="Confirmer mot de passe"
                    onChangeText={setPasswordConfirm}
                    value={passwordConfirm}
                    secureTextEntry={true}
                />
                <View>
                    <TouchableOpacity
                        style={btn.primaire}
                        onPress={() => _signupSend()}
                    >
                        <Text style={text.btnPrimaire}>Inscription</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View >
                {response}
            </View>
            <View style={{ marginBottom: 40 }}>
                <TouchableOpacity
                    style={btn.secondaire}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={text.btnSecondaire}>connexion</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>

    );
}



