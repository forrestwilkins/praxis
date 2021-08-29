import Link from "next/link";
import { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import { useMutation } from "@apollo/client";

import Messages from "../../utils/messages";
import { LOGOUT_USER } from "../../apollo/client/mutations";
import { useCurrentUser } from "../../hooks";
import styles from "../../styles/Shared/TopNavDesktop.module.scss";
import { redeemedInviteToken } from "../../utils/clientIndex";
import { NavigationPaths, ResourcePaths } from "../../constants/common";

const TopNavDesktop = () => {
  const router = useRouter();
  const [inviteToken, setInviteToken] = useState<string | null>();
  const [logoutUser] = useMutation(LOGOUT_USER);
  const currentUser = useCurrentUser();

  useEffect(() => {
    setInviteToken(redeemedInviteToken());
  }, []);

  const logoutUserMutate = async () => {
    await logoutUser();
    Router.push("/users/login");
  };

  return (
    <nav className={styles.navbar}>
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
      <div className={styles.navbarItems}>
        {currentUser ? (
          <>
            <div className={styles.navbarItem}>
              <Link href={`${ResourcePaths.User}${currentUser.name}`} passHref>
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
  );
};

export default TopNavDesktop;
