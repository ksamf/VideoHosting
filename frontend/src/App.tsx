import Home from "./pages/Home"
import Studio from "./pages/Studio"
import { Routes, Route } from "react-router-dom"
import UploadVideo from "./components/common/UploadVideo"
import NavBar from "./components/common/NavBar"
import Watch from "./pages/Watch"
import LoginModal from "./components/forms/LoginModal"
import RegisterModal from "./components/forms/RegisterModal"
import { Box, Toolbar } from "@mui/material"
import Watched from "./pages/Watched"
import Liked from "./pages/Liked"
import Channel from "./pages/Channel"
import Subscriptions from "./pages/Subscriptions"
import Search from "./pages/Search"
import { appSx } from "./styles/sx/app"

type ThemeMode = "light" | "dark";

type AppProps = {
  themeMode: ThemeMode;
  onToggleTheme: () => void;
};

export default function App({ themeMode, onToggleTheme }: AppProps) {

  return (
    <>
      <NavBar themeMode={themeMode} onToggleTheme={onToggleTheme} />
      <Toolbar />
      <Box sx={appSx.routeShell}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<LoginModal />} />
          <Route path='/register' element={<RegisterModal />} />
          <Route path='/studio' element={<Studio />}>
            <Route path='upload' element={<UploadVideo />} />
          </Route>
          <Route path='/watch/:id' element={<Watch />} />
          <Route path='/user/:id/sub' element={<Subscriptions />} />
          <Route path='/watched' element={<Watched />} />
          <Route path='/liked' element={<Liked />} />
          <Route path='/channel/:id' element={<Channel />} />
          <Route path='/search' element={<Search />} />
        </Routes>
      </Box>

    </>
  )
}


