import App from './App';
import { ConfigurationContextWrapper } from './Contexts/ConfigurationContextWrapper';
import { NavigationContextWrapper } from './Contexts/NavigationContextWrapper';
import { ResultWrapper } from './Contexts/ResultWrapper';

export function AppWrappers() {
    console.log('AppWrappers')
    return (
        <>
            <ConfigurationContextWrapper>
                <ResultWrapper>
                    <NavigationContextWrapper>
                        <App />
                    </NavigationContextWrapper>
                </ResultWrapper>
            </ConfigurationContextWrapper>
        </>
    )
}
