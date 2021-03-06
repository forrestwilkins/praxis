import { LinearProgress } from "@material-ui/core";
import UserAvatar from "../Users/Avatar";
import FollowButton from "./FollowButton";
import styles from "../../styles/Follow/Follow.module.scss";
import { useUserById, useFollowersByUserId } from "../../hooks";

interface Props {
  userId: string;
}

const Follow = ({ userId }: Props) => {
  const user = useUserById(userId);
  const [followers, setFollowers] = useFollowersByUserId(user?.id);

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
  return <LinearProgress />;
};

export default Follow;
