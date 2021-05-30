import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";

import { FOLLOWERS } from "../../apollo/client/queries";

import UserAvatar from "../Users/Avatar";
import FollowButton from "./FollowButton";
import styles from "../../styles/Follow/Follow.module.scss";
import Messages from "../../utils/messages";
import { noCache } from "../../utils/apollo";
import { useUserById } from "../../hooks";

interface Props {
  userId: string;
}

const Follow = ({ userId }: Props) => {
  const user = useUserById(userId);
  const [followers, setFollowers] = useState<Follow[]>([]);
  const followersRes = useQuery(FOLLOWERS, {
    variables: { userId: userId },
    ...noCache,
  });

  useEffect(() => {
    if (followersRes.data) setFollowers(followersRes.data.userFollowers);
  }, [followersRes.data]);

  if (user)
    return (
      <div className={styles.follow}>
        <div className={styles.link}>
          <UserAvatar user={user} />
          <div className={styles.userName}>{user.name}</div>
        </div>
        <FollowButton
          userId={userId}
          followers={followers}
          setFollowers={setFollowers}
        />
      </div>
    );
  return <>{Messages.states.loading()}</>;
};

export default Follow;
