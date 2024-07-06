import App from './App';
import { ConfigurationContextWrapper } from './Contexts/ConfigurationContextWrapper';
import { NavigationContextWrapper } from './Contexts/NavigationContextWrapper';
import { ResultContextWrapper } from './Contexts/ResultContextWrapper';

export function AppWrappers() {
    console.log('AppWrappers')
    return (
        <>
            <ConfigurationContextWrapper>
                <NavigationContextWrapper>
                    <ResultContextWrapper>
                        <App />
                    </ResultContextWrapper>
                </NavigationContextWrapper>
            </ConfigurationContextWrapper>
        </>
    )
}
