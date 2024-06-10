import React from 'react';
import { Locale } from './Localization/types';

export type Configuration = {
    locale: Locale,
}

export const ConfigurationContext = React.createContext<Configuration & { setConfiguration: (c: Configuration) => void | Promise<void>, toggleTheme: () => void | Promise<void> }>({
    locale: {
        calendar: 'Gregorian',
        direction: 'ltr',
        name: 'en-US',
        zone: 'UTC'
    },
    setConfiguration: () => { },
    toggleTheme: () => { },
});
