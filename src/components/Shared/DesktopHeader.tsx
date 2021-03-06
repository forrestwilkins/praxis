import Link from "next/link";
import { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import { useMutation, useReactiveVar } from "@apollo/client";
import MenuIcon from "@material-ui/icons/Menu";
import clsx from "clsx";

import Messages from "../../utils/messages";
import { LOGOUT_USER } from "../../apollo/client/mutations";
import {
  useCurrentUser,
  useHasPermissionGlobally,
  useWindowSize,
} from "../../hooks";
import styles from "../../styles/Shared/DesktopHeader.module.scss";
import { navKeyVar } from "../../apollo/client/localState";
import { redeemedInviteToken } from "../../utils/clientIndex";
import { NavigationPaths, ResourcePaths } from "../../constants/common";
import { Permissions } from "../../constants/role";

const Header = () => {
  const router = useRouter();
  const windowSize = useWindowSize();
  const [open, setOpen] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>();
  const [logoutUser] = useMutation(LOGOUT_USER);
  const currentUser = useCurrentUser();
  const refreshKey = useReactiveVar(navKeyVar);
  const [canManageRoles] = useHasPermissionGlobally(
    Permissions.ManageRoles,
    refreshKey
  );
  const [canManageUsers] = useHasPermissionGlobally(
    Permissions.ManageUsers,
    refreshKey
  );
  const [canManageInvites] = useHasPermissionGlobally(
    Permissions.ManageInvites,
    refreshKey
  );
  const [canCreateInvites] = useHasPermissionGlobally(
    Permissions.CreateInvites,
    refreshKey
  );

  useEffect(() => {
    setInviteToken(redeemedInviteToken());
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [router.asPath, windowSize]);

  const logoutUserMutate = async () => {
    await logoutUser();
    Router.push("/users/login");
  };

  return (
    <>
      <nav className={styles.navbar} key={refreshKey}>
        <div className={styles.navbarBrand}>
          {router.asPath === NavigationPaths.Home ? (
            <span onClick={() => router.reload()} role="button" tabIndex={0}>
              {Messages.brand()}
            </span>
          ) : (
            <Link href={NavigationPaths.Home} passHref>
              {Messages.brand()}
            </Link>
          )}
        </div>
        <div
          className={clsx(styles.navbarItems, {
            [styles.navbarItemsShow]: open,
          })}
        >
          {canManageUsers && (
            <div className={styles.navbarItem}>
              <Link href={NavigationPaths.Users} passHref>
                <a className={styles.navbarItemText}>
                  {Messages.navigation.users()}
                </a>
              </Link>
            </div>
          )}

          <div className={styles.navbarItem}>
            <Link href={NavigationPaths.Groups} passHref>
              <a className={styles.navbarItemText}>
                {Messages.navigation.groups()}
              </a>
            </Link>
          </div>

          {canManageRoles && (
            <div className={styles.navbarItem}>
              <Link href={NavigationPaths.Roles} passHref>
                <a className={styles.navbarItemText}>
                  {Messages.navigation.roles()}
                </a>
              </Link>
            </div>
          )}

          {(canManageInvites || canCreateInvites) && (
            <div className={styles.navbarItem}>
              <Link href={NavigationPaths.Invites} passHref>
                <a className={styles.navbarItemText}>
                  {Messages.navigation.invites()}
                </a>
              </Link>
            </div>
          )}

          {currentUser ? (
            <>
              <div className={styles.navbarItem}>
                <Link
                  href={`${ResourcePaths.User}${currentUser.name}`}
                  passHref
                >
                  <a className={styles.navbarItemText}>{currentUser.name}</a>
                </Link>
              </div>
              <div className={styles.navbarItem}>
                <div
                  onClick={() =>
                    window.confirm(Messages.prompts.logOut()) &&
                    logoutUserMutate()
                  }
                  role="button"
                  tabIndex={0}
                >
                  <a className={styles.navbarItemText}>
                    {Messages.users.actions.logOut()}
                  </a>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.navbarItem}>
                <Link href={NavigationPaths.LogIn} passHref>
                  <a className={styles.navbarItemText}>
                    {Messages.users.actions.logIn()}
                  </a>
                </Link>
              </div>
              {inviteToken && (
                <div className={styles.navbarItem}>
                  <Link href={NavigationPaths.SignUp} passHref>
                    <a className={styles.navbarItemText}>
                      {Messages.users.actions.signUp()}
                    </a>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      <MenuIcon className={styles.menuButton} />
      <div
        className={styles.menuButtonTouchTarget}
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={-1}
      ></div>
    </>
  );
};

export default Header;
