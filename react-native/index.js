/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import App from './src/App';
import { name as appName } from './app.json';

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: 'tomato',
        secondary: 'yellow',
    },
};

export default function Main() {
    return (
        <PaperProvider>
            <App />
        </PaperProvider>
    );
}

AppRegistry.registerComponent(appName, () => Main);
