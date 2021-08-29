import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, useMediaQuery } from "@material-ui/core";
import { ThemeProvider, useTheme } from "@material-ui/core/styles";

import HeadContent from "./HeadContent";
import Messages from "../../utils/messages";
import Breadcrumbs from "../Shared/Breadcrumbs";
import Toast from "../Shared/Toast";
import muiTheme from "../../styles/Shared/theme";
import BottomNav from "../Shared/BottomNav";
import { useIsDesktop, useIsMobile, useRestoreUserSession } from "../../hooks";
import TopNav from "../Shared/TopNav";
import TopNavDesktop from "../Shared/TopNavDesktop";
import NavDrawer from "../Shared/NavDrawer";
import LeftNav from "../Shared/LeftNav";

interface Props {
  children: React.ReactChild;
}

const Layout = ({ children }: Props) => {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));
  useRestoreUserSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ThemeProvider theme={muiTheme}>
      <Head>
        <HeadContent />
        <title>{Messages.brand()}</title>
      </Head>

      {isMobile && (
        <>
          <TopNav />
          <NavDrawer />
          <BottomNav />
        </>
      )}

      {isDesktop && (
        <>
          <TopNavDesktop />
          {isLarge && <LeftNav />}
        </>
      )}

      <Container maxWidth="sm">
        <Breadcrumbs />
        {children}
        <Toast />
      </Container>
    </ThemeProvider>
  );
};

export default Layout;
