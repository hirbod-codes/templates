import { useContext } from 'react';
import { Appbar, useTheme, IconButton } from 'react-native-paper';
import { ConfigurationContext } from '../ConfigurationContext';
import { DrawerHeaderProps } from '@react-navigation/drawer';

export function CustomAppBar(props: DrawerHeaderProps) {
    const theme = useTheme();
    const configuration = useContext(ConfigurationContext);

    return (
        <Appbar.Header mode='small' elevated>
            <Appbar.Action icon={'menu'} onPress={props.navigation.toggleDrawer} />
            <Appbar.Content title={props.route.name} />
            <IconButton icon={'theme-light-dark'} size={20} onPress={configuration.toggleTheme} />
        </Appbar.Header>
    );
}
