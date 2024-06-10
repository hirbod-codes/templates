import { DrawerContentComponentProps, DrawerContentScrollView } from "@react-navigation/drawer";
import { ReactNode } from "react";
import { Drawer } from "react-native-paper";

export function DrawerContent(props: DrawerContentComponentProps): ReactNode {
    return (
        <>
            <DrawerContentScrollView {...props}>
                <Drawer.Section showDivider={false}>
                    {props.state.routeNames.map((r, i) =>
                        <Drawer.Item
                            key={i}
                            label={r}
                            active={i === props.state.index}
                            onPress={() => props.navigation.jumpTo(r)}
                        />
                    )}
                </Drawer.Section>
            </DrawerContentScrollView>
        </>
    )
}

