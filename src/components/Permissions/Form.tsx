import React, { useState, useEffect } from "react";
import { Button, FormGroup, makeStyles, Switch } from "@material-ui/core";

import styles from "../../styles/Role/Role.module.scss";
import { displayName } from "../../utils/items";
import Messages from "../../utils/messages";
import { UPDATE_PERMISSIONS } from "../../apollo/client/mutations";
import { useMutation } from "@apollo/client";
import { headerKeyVar } from "../../apollo/client/localState";
import { randomKey } from "../../utils/common";

const useStyles = makeStyles({
  toggle: {
    "& .Mui-checked .MuiSwitch-thumb": {
      color: "inherit",
    },
    "& .MuiSwitch-thumb": {
      color: "rgb(170, 170, 170)",
    },
  },
});

interface Props {
  permissions: Permission[];
  setPermissions: (permissions: Permission[]) => void;
  unsavedPermissions?: Permission[];
  setUnsavedPermissions?: (permissions: Permission[]) => void;
  anyUnsavedPermissions?: boolean;
  setCanManageRolesDep: (dependency: string) => void;
}

const PermissionsForm = ({
  permissions,
  setPermissions,
  unsavedPermissions,
  setUnsavedPermissions,
  anyUnsavedPermissions,
  setCanManageRolesDep,
}: Props) => {
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [updatePermissions] = useMutation(UPDATE_PERMISSIONS);
  const classes = useStyles();

  useEffect(() => {
    if (
      unsavedPermissions &&
      setUnsavedPermissions &&
      permissions.length &&
      !unsavedPermissions.length
    )
      setUnsavedPermissions(permissions);
  }, [permissions]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const { data } = await updatePermissions({
        variables: {
          permissions: permissions.map(({ id, enabled }) => {
            return { id, enabled };
          }),
        },
      });
      const newPermissions = data.updatePermissions.permissions;
      if (setUnsavedPermissions) setUnsavedPermissions(newPermissions);
      setPermissions(newPermissions);
      const newKey = randomKey();
      setCanManageRolesDep(newKey);
      headerKeyVar(newKey);
    } catch (err) {
      alert(err);
    }
    setSubmitLoading(false);
  };

  const handleSwitchChange = (name: string, enabled: boolean) => {
    setByName(name, enabled);
  };

  const setByName = (name: string, enabled: boolean) => {
    setPermissions(
      permissions.map((permission) => {
        if (permission.name === name)
          return {
            ...permission,
            enabled,
          };
        return permission;
      })
    );
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className={styles.form}>
      <FormGroup>
        <div className={styles.card}>
          {permissions.map(({ name, description, enabled }) => {
            return (
              <div className={styles.permission} key={name}>
                <div>
                  <div className={styles.permissionName}>
                    {displayName(name)}
                  </div>
                  <div className={styles.permissionDescription}>
                    {description}
                  </div>
                </div>

                <Switch
                  checked={enabled}
                  onChange={() => handleSwitchChange(name, !enabled)}
                  className={classes.toggle}
                  color="primary"
                />
              </div>
            );
          })}
        </div>
      </FormGroup>
      {anyUnsavedPermissions && (
        <Button
          variant="contained"
          type="submit"
          style={{
            color: "white",
            backgroundColor: "rgb(65, 65, 65)",
          }}
        >
          {submitLoading ? Messages.states.saving() : Messages.actions.save()}
        </Button>
      )}
    </form>
  );
};

export default PermissionsForm;
