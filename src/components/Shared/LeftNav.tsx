import Link from "next/link";
import { useReactiveVar } from "@apollo/client";
import {
  List,
  ListItem,
  withStyles,
  createStyles,
  ListItemIcon,
  ListItemText as MUIListItemText,
} from "@material-ui/core";
import {
  Link as LinkIcon,
  SupervisedUserCircle,
  AccountBox,
  Group,
  Home,
} from "@material-ui/icons";

import { navKeyVar } from "../../apollo/client/localState";
import { NavigationPaths } from "../../constants/common";
import { WHITE } from "../../styles/Shared/theme";
import Messages from "../../utils/messages";
import { useHasPermissionGlobally } from "../../hooks";
import { Permissions } from "../../constants/role";
import styles from "../../styles/Shared/LeftNav.module.scss";

const ListItemText = withStyles(() =>
  createStyles({
    primary: {
      color: WHITE,
      fontSize: 20,
    },
  })
)(MUIListItemText);

const LeftNav = () => {
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

  return (
    <div className={styles.leftNav}>
      <List>
        <Link href={NavigationPaths.Home}>
          <a>
            <ListItem button>
              <ListItemIcon>
                <Home color="primary" />
              </ListItemIcon>
              <ListItemText primary={Messages.navigation.home()} />
            </ListItem>
          </a>
        </Link>

        <Link href={NavigationPaths.Groups}>
          <a>
            <ListItem button>
              <ListItemIcon>
                <Group color="primary" />
              </ListItemIcon>
              <ListItemText primary={Messages.navigation.groups()} />
            </ListItem>
          </a>
        </Link>

        {canManageRoles && (
          <Link href={NavigationPaths.Roles}>
            <a>
              <ListItem button>
                <ListItemIcon>
                  <AccountBox color="primary" />
                </ListItemIcon>
                <ListItemText primary={Messages.navigation.roles()} />
              </ListItem>
            </a>
          </Link>
        )}

        {canManageUsers && (
          <Link href={NavigationPaths.Users}>
            <a>
              <ListItem button>
                <ListItemIcon>
                  <SupervisedUserCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary={Messages.navigation.users()} />
              </ListItem>
            </a>
          </Link>
        )}

        {(canManageInvites || canCreateInvites) && (
          <Link href={NavigationPaths.Invites}>
            <a>
              <ListItem button>
                <ListItemIcon>
                  <LinkIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={Messages.navigation.invites()} />
              </ListItem>
            </a>
          </Link>
        )}
      </List>
    </div>
  );
};

export default LeftNav;
