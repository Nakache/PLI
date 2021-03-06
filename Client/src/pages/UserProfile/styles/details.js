import {
  AppRegistry,
  StyleSheet,
  Dimensions,
} from 'react-native';


export default StyleSheet.create({
    head: {
        margin: 0
    },
    infos: {
        flexDirection: 'row'
    },
    cover: {
        height: Dimensions.get('window').height * 0.3,
        width: Dimensions.get('window').width
    },
    thumbnail: {
        marginTop: -40,
        alignSelf: "center"
    },
    name: {
        marginTop: 10,
        fontSize: 20,
        alignSelf: "center"
    },
    friendAddButton: {
        alignSelf: "center",
        flexDirection: 'row'
    }

});
