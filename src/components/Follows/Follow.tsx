import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { Avatar } from "@material-ui/core";

import { USER } from "../../apollo/client/queries";

import FollowButton from "./FollowButton";
import styles from "../../styles/Follow.module.scss";

const Follow = ({ userId }) => {
  const [user, setUser] = useState(null);
  const userRes = useQuery(USER, {
    variables: { id: userId },
  });

  useEffect(() => {
    setUser(userRes.data ? userRes.data.user : null);
  }, [userRes.data]);

  if (user)
    return (
      <div className={styles.follow}>
        <Link href={`/users/${user.name}`}>
          <a className={styles.link}>
            <Avatar className={styles.avatar}>
              {user.name[0].charAt(0).toUpperCase()}
            </Avatar>
            <div className={styles.userName}>{user.name}</div>
          </a>
        </Link>
        <FollowButton userId={userId} />
      </div>
    );
  return <>Loading...</>;
};

export default Follow;