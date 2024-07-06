import { useContext, useState } from 'react'

import { HomeOutlined, SettingsOutlined, MenuOutlined, LightModeOutlined, DarkModeOutlined, ExpandLess, ExpandMore, DisplaySettingsOutlined, StorageOutlined } from '@mui/icons-material'
import { AppBar, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Collapse, Grid, Theme } from '@mui/material'

import { Home } from './Pages/Home'
import { t } from 'i18next'
import { General } from './Pages/Settings/General'
import { MenuBar } from './Components/MenuBar'
import { ThemeContext } from '@emotion/react'
import { ConfigurationContext } from './Contexts/ConfigurationContext'
import { getReactLocale } from './Lib/helpers'
import { NavigationContext } from './Contexts/NavigationContext'

export default function App() {
    const nav = useContext(NavigationContext)
    const theme = useContext(ThemeContext) as Theme
    const configuration = useContext(ConfigurationContext)
    const setContent = useContext(NavigationContext)?.setContent ?? ((o: any) => { })

    // Navigation
    const [openDrawer, setOpenDrawer] = useState(false)
    const [openSettingsList, setOpenSettingsList] = useState(false)

    console.log('App', { nav, theme, configuration, setContent, openDrawer, openSettingsList })

    return (
        <>
            <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
                <List>
                    <ListItemButton onClick={() => { setContent(<Home />); setOpenDrawer(false) }}>
                        <ListItemIcon>
                            <HomeOutlined />
                        </ListItemIcon>
                        <ListItemText primary={t('home')} />
                    </ListItemButton>
                    <ListItemButton onClick={() => setOpenSettingsList(!openSettingsList)}>
                        <ListItemIcon>
                            <SettingsOutlined />
                        </ListItemIcon>
                        <ListItemText primary={t('settings')} />
                        {openSettingsList ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={openSettingsList} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }} onClick={() => { setContent(<General />); setOpenDrawer(false) }}>
                                <ListItemIcon>
                                    <DisplaySettingsOutlined />
                                </ListItemIcon>
                                <ListItemText primary={t("general")} />
                            </ListItemButton>
                        </List>
                    </Collapse>
                </List>
            </Drawer>

            <Grid container sx={{ height: '100%' }}>
                <Grid item xs={12}>
                    <MenuBar backgroundColor={theme.palette.background.default} />
                </Grid>

                <Grid item xs={12} height={'3rem'}>
                    <AppBar position='relative'>
                        <Toolbar variant="dense">
                            <IconButton size='large' color='inherit' onClick={() => setOpenDrawer(true)} sx={{ mr: 2 }}>
                                <MenuOutlined fontSize='inherit' />
                            </IconButton>
                            <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                                {/* Title */}
                                {t('Title')}
                            </Typography>
                            <IconButton size='medium' color='inherit' onClick={() => configuration.set.updateTheme(theme.palette.mode == 'dark' ? 'light' : 'dark', configuration.get.locale.direction, getReactLocale(configuration.get.locale.code))}>
                                {theme.palette.mode == 'light' ? <LightModeOutlined fontSize='inherit' /> : <DarkModeOutlined fontSize='inherit' />}
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                </Grid>

                {/* MenuBar ==> 2rem, AppBar ==> 3rem */}
                <Grid item xs={12} sx={{ height: 'calc(100% - 5rem)', overflowY: 'auto' }}>
                    {nav?.content}
                </Grid>
            </Grid>
        </>
    )
}

