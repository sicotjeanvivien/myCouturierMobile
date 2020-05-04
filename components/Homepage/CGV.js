import React, { Component } from 'react';
import { Text, View, Button, ActivityIndicator, ScrollView } from 'react-native';
import { main, text } from '../../assets/stylesCustom';
import { ConstEnv } from '../tools/ConstEnv';
import { Error } from '../tools/Error';

export const CGV = () => {

    React.useEffect(() => {
        const bootdata = async () => {
            console.log(ConstEnv.host + ConstEnv.cgv);
            fetch(ConstEnv.host + ConstEnv.cgv)
                .then((response) => response.json())
                .then((responseJson) => {
                    if (!responseJson.error) {
                        setCgv(responseJson.cgv)
                    } else {
                        setCgv(<Error message={responseJson.message} />)
                    }
                })
        }
        bootdata();
    })

    const [cgv, setCgv] = React.useState();
    let cgvViewRender = <ActivityIndicator />;
    if (cgv) {
        cgvViewRender = <Text style={text.sizeSmall}>{cgv}</Text>
    }


    return (
        <ScrollView style={main.scroll}>            
                {cgvViewRender}
        </ScrollView>
    )
}