import { CssBaseline } from "@mui/material";
import { MenuBar } from "./Components/MenuBar";

export function App() {
    return (
        <>
            <CssBaseline />
            <MenuBar backgroundColor='gray' /> {/* or theme.palette.background.default */}
            <h1>hello from react</h1>
        </>
    )
}
