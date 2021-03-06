import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useLazyQuery, useReactiveVar } from "@apollo/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  CardHeader,
  CardMedia,
  CardActionArea,
} from "@material-ui/core";

import {
  GROUP,
  IMAGES_BY_MOTION_ID,
  VOTES_BY_MOTION_ID,
} from "../../apollo/client/queries";
import { votesVar } from "../../apollo/client/localState";
import VotesForm from "../Votes/Form";
import ImagesList from "../Images/List";
import UserAvatar from "../Users/Avatar";
import ItemMenu from "../Shared/ItemMenu";
import GroupItemAvatar from "../Groups/ItemAvatar";
import ActionData from "./ActionData";
import styles from "../../styles/Motion/Motion.module.scss";
import { Stages } from "../../constants/motion";
import { ModelNames, ResourcePaths } from "../../constants/common";
import { GroupSettings } from "../../constants/setting";
import { VotingTypes } from "../../constants/vote";
import { noCache } from "../../utils/apollo";
import {
  useCurrentUser,
  useMembersByGroupId,
  useSettingsByGroupId,
  useUserById,
} from "../../hooks";
import Messages from "../../utils/messages";
import { timeAgo } from "../../utils/time";
import CardFooter from "./CardFooter";

const useStyles = makeStyles({
  title: {
    marginLeft: "-5px",
  },
});

interface Props {
  motion: Motion;
  deleteMotion: (id: string) => void;
}

const Motion = ({ motion, deleteMotion }: Props) => {
  const { id, userId, groupId, motionGroupId, body, action, stage } = motion;
  const currentUser = useCurrentUser();
  const user = useUserById(userId);
  const [group, setGroup] = useState<Group>();
  const [groupSettings] = useSettingsByGroupId(group?.id);
  const [groupMembers] = useMembersByGroupId(group?.id);
  const [votes, setVotes] = useState<Vote[]>([]);
  const votesFromGlobal = useReactiveVar(votesVar);
  const [images, setImages] = useState<Image[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [getVotesRes, votesRes] = useLazyQuery(VOTES_BY_MOTION_ID, noCache);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP);
  const imagesRes = useQuery(IMAGES_BY_MOTION_ID, {
    variables: { motionId: id },
    ...noCache,
  });
  const classes = useStyles();
  const router = useRouter();

  useEffect(() => {
    if (!onMotionPage())
      getVotesRes({
        variables: { motionId: id },
      });
  }, []);

  useEffect(() => {
    if (onMotionPage()) setVotes(votesFromGlobal);
  }, [votesFromGlobal]);

  useEffect(() => {
    if (!onMotionPage() && votesRes.data)
      setVotes(votesRes.data.votesByMotionId);
  }, [votesRes.data]);

  useEffect(() => {
    if (imagesRes.data) setImages(imagesRes.data.imagesByMotionId);
  }, [imagesRes.data]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.group);
  }, [groupRes.data]);

  useEffect(() => {
    if (groupId || motionGroupId)
      getGroupRes({
        variables: { id: groupId ? groupId : motionGroupId },
      });
  }, [groupId, motionGroupId]);

  const ownMotion = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  const onMotionPage = (): boolean => {
    return router.asPath.includes(ResourcePaths.Motion);
  };

  const onGroupPage = (): boolean => {
    return router.asPath.includes(ResourcePaths.Group);
  };

  const alreadyVote = (): Vote | null => {
    if (!currentUser) return null;
    const vote = votes.find((vote) => vote.userId === currentUser.id);
    if (vote) return vote;
    return null;
  };

  const isRatified = (): boolean => {
    return stage === Stages.Ratified;
  };

  const settingByName = (name: string): string => {
    const setting = groupSettings.find((setting) => setting.name === name);
    return setting?.value || "";
  };

  const isModelOfConsensus = (): boolean => {
    return settingByName(GroupSettings.VotingType) === VotingTypes.Consensus;
  };

  const isAGroupMember = (): boolean => {
    const member = groupMembers?.find(
      (member: GroupMember) => member.userId === currentUser?.id
    );
    return !!member;
  };

  return (
    <div key={id}>
      <Card>
        <CardHeader
          avatar={
            group && !onGroupPage()
              ? user && (
                  <GroupItemAvatar user={user} group={group} motion={motion} />
                )
              : user && <UserAvatar user={user} />
          }
          title={
            (!group || onGroupPage()) && (
              <>
                <Link href={`/users/${user?.name}`}>
                  <a>{user?.name}</a>
                </Link>

                <Link href={`${ResourcePaths.Motion}${id}`}>
                  <a className={styles.info}>
                    {Messages.motions.toActionWithRatified(
                      action,
                      isRatified()
                    ) + timeAgo(motion.createdAt)}
                  </a>
                </Link>
              </>
            )
          }
          action={
            <ItemMenu
              itemId={id}
              itemType={ModelNames.Motion}
              anchorEl={menuAnchorEl}
              setAnchorEl={setMenuAnchorEl}
              deleteItem={deleteMotion}
              ownItem={ownMotion}
            />
          }
          classes={classes}
        />

        {body && (
          <CardContent style={{ paddingBottom: 12 }}>
            <Typography
              style={{
                marginTop: "-12px",
              }}
            >
              {body}
            </Typography>

            <ActionData motion={motion} />
          </CardContent>
        )}

        <CardActionArea>
          <CardMedia>
            <ImagesList images={images} />
          </CardMedia>
        </CardActionArea>

        {alreadyVote() && !alreadyVote()?.body && !isRatified() && (
          <VotesForm
            votes={votes}
            vote={alreadyVote() as Vote}
            setVotes={onMotionPage() ? votesVar : setVotes}
            modelOfConsensus={isModelOfConsensus()}
          />
        )}

        {currentUser && isAGroupMember() && (
          <CardFooter
            motionId={id}
            votes={votes}
            setVotes={onMotionPage() ? votesVar : setVotes}
            modelOfConsensus={isModelOfConsensus()}
          />
        )}
      </Card>
    </div>
  );
};

export default Motion;
