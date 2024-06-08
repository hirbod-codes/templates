/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { JSX, useState, useCallback, useMemo, useContext } from 'react';
import { Appearance, TouchableOpacity } from 'react-native';
import {
    Appbar,
    Switch,
    Title,
    useTheme,
    MD3LightTheme as lightTheme,
    MD3DarkTheme as darkTheme,
    PaperProvider,
    Icon,
    IconButton
} from 'react-native-paper';
import { PreferencesContext } from './PreferencesContext'
import { NavigationContainer, Theme } from '@react-navigation/native';
import { NativeStackHeaderProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerHeaderProps, createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function App(): JSX.Element {
    let colorScheme = Appearance.getColorScheme();

    const [theme, setTheme] = useState((colorScheme ?? 'light') == 'dark' ? darkTheme : lightTheme)

    const toggleTheme = () => setTheme(theme.dark ? lightTheme : darkTheme)

    return (
        <>
            <SafeAreaProvider>
                <PreferencesContext.Provider value={{ toggleTheme }}>
                    <PaperProvider theme={theme}>
                        <NavigationContainer theme={theme as unknown as Theme}>
                            <Drawer.Navigator
                                initialRouteName="Home"
                                screenOptions={{
                                    header: (props) => <CustomAppBar {...props} />,
                                }}
                            >
                                <Drawer.Screen name="Home" component={HomeScreen} />
                                <Drawer.Screen name="DetailsScreen" component={DetailsScreen} />
                            </Drawer.Navigator>

                        </NavigationContainer>
                    </PaperProvider>
                </PreferencesContext.Provider>
            </SafeAreaProvider>
        </>
    );
}

function CustomAppBar(props: DrawerHeaderProps) {
    const theme = useTheme();
    const { toggleTheme } = useContext(PreferencesContext);

    return (
        <Appbar.Header mode='small' elevated>
            <Appbar.Action icon={'menu'} onPress={props.navigation.toggleDrawer} />
            <Appbar.Content title={props.route.name} />
            <IconButton icon={'theme-light-dark'} size={20} onPress={toggleTheme} />
        </Appbar.Header>
    );
}

function HomeScreen(props: any): JSX.Element {
    return (
        <>
            <Title>Home Screen</Title>
        </>
    )
}

function DetailsScreen(props: any): JSX.Element {
    return (
        <>
            <Title>Details Screen</Title>
        </>
    )
}
