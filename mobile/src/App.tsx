import { useFonts } from "expo-font";
import { Provider as AntProvider, Toast } from "@ant-design/react-native";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect } from "react";
import { DefaultTheme } from "@react-navigation/native";

import Navigation from "navigation/Navigation";

import { persistor, store } from "services/store.service";

import LoadingWrapper from "#common/wrappers/LoadingWrapper/LoadingWrapper";

const App = () => {
    const [fontsLoaded, fontsError] = useFonts({
        antoutline: require("@ant-design/icons-react-native/fonts/antoutline.ttf"),
        antfill: require("@ant-design/icons-react-native/fonts/antfill.ttf"),
    });

    useEffect(() => {
        Toast.config({ stackable: true });

        if (fontsError) {
            console.error("Font loading error:", fontsError);
        }
        if (fontsLoaded) {
            console.log("Fonts loaded successfully");
        }
    }, [fontsLoaded, fontsError]);

    return (
        // <KeyboardAvoidingView behavior={"padding"} keyboardVerticalOffset={100}>

        <ReduxProvider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <AntProvider>
                    <LoadingWrapper>
                        <Navigation
                            theme={{
                                ...DefaultTheme,
                                colors: {
                                    ...DefaultTheme.colors,
                                    background: "#FFF",
                                },
                            }}
                        />
                    </LoadingWrapper>
                </AntProvider>
            </PersistGate>
        </ReduxProvider>
        // </KeyboardAvoidingView>
    );
};

export default App;
