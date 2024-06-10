import { JSX, useContext, useState } from 'react';
import { List, Title } from 'react-native-paper';
import { ConfigurationContext } from '../../ConfigurationContext';
import { Calendar, Direction, Languages, TimeZone } from '../../Localization/types';

export function General(): JSX.Element {
    const configuration = useContext(ConfigurationContext);

    const [tzExpanded, setTZExpanded] = useState(false);
    const setTZ = (tz: TimeZone) => {
        configuration.setConfiguration({
            ...configuration,
            locale: {
                ...(configuration.locale),
                zone: tz,
            }
        })
    }

    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const setCalendar = (calendar: Calendar) => {
        configuration.setConfiguration({
            ...configuration,
            locale: {
                ...(configuration.locale),
                calendar,
            }
        })
    }

    const [languageExpanded, setLanguageExpanded] = useState(false);
    const setLanguage = (direction: Direction, name: Languages) => {
        configuration.setConfiguration({
            ...configuration,
            locale: {
                ...(configuration.locale),
                direction,
                name
            }
        })
    }

    return (
        <>
            <Title>General settings</Title>

            <List.Section>
                <List.Accordion title="Time Zone" left={props => <List.Icon {...props} icon="clock-time-three-outline" />} expanded={tzExpanded} onPress={() => setTZExpanded(!tzExpanded)}>
                    <List.Item title="UTC" onPress={() => setTZ('UTC')} />
                    <List.Item title="Asia/Tehran" onPress={() => setTZ('Asia/Tehran')} />
                </List.Accordion>
            </List.Section>
            <List.Section>
                <List.Accordion title="Calendar type" left={props => <List.Icon {...props} icon="calendar" />} expanded={calendarExpanded} onPress={() => setCalendarExpanded(!calendarExpanded)}>
                    <List.Item title="Persian" onPress={() => setCalendar('Persian')} />
                    <List.Item title="Gregorian" onPress={() => setCalendar('Gregorian')} />
                </List.Accordion>
            </List.Section>
            <List.Section>
                <List.Accordion title="Language" left={props => <List.Icon {...props} icon="earth" />} expanded={languageExpanded} onPress={() => setLanguageExpanded(!languageExpanded)}>
                    <List.Item title="fa" onPress={() => setLanguage('rtl', 'fa-IR')} />
                    <List.Item title="en" onPress={() => setLanguage('ltr', 'en-US')} />
                </List.Accordion>
            </List.Section>
        </>
    );
}
