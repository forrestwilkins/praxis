import { useState, useEffect } from "react";
import { useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import { FormGroup } from "@material-ui/core";
import Router from "next/router";
import { Formik, FormikHelpers, Form, Field, FormikProps } from "formik";

import { IMAGES_BY_POST_ID } from "../../apollo/client/queries";
import {
  CREATE_POST,
  UPDATE_POST,
  DELETE_IMAGE,
} from "../../apollo/client/mutations";
import styles from "../../styles/Shared/Shared.module.scss";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import { feedVar, paginationVar } from "../../apollo/client/localState";
import { noCache } from "../../utils/apollo";
import { generateRandom } from "../../utils/common";
import SubmitButton from "../Shared/SubmitButton";
import TextField from "../Shared/TextField";
import SelectedImages from "../Shared/SelectedImages";
import ImageInput from "../Shared/ImageInput";
import { toastVar } from "../../apollo/client/localState";
import { FieldNames, ResourcePaths, ToastStatus } from "../../constants/common";

interface FormValues {
  body: string;
}

interface Props {
  post?: Post;
  posts?: Post[];
  isEditing?: boolean;
  setPosts?: (posts: Post[]) => void;
  group?: Group;
}

const PostsForm = ({ post, posts, isEditing, setPosts, group }: Props) => {
  const [imagesInputKey, setImagesInputKey] = useState<string>("");
  const [savedImages, setSavedImages] = useState<Image[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const currentUser = useCurrentUser();
  const feed = useReactiveVar(feedVar);
  const { currentPage, pageSize } = useReactiveVar(paginationVar);

  const [createPost] = useMutation(CREATE_POST);
  const [updatePost] = useMutation(UPDATE_POST);
  const [deleteImage] = useMutation(DELETE_IMAGE);
  const [getSavedImagesRes, savedImagesRes] = useLazyQuery(
    IMAGES_BY_POST_ID,
    noCache
  );

  useEffect(() => {
    if (post) getSavedImagesRes({ variables: { postId: post.id } });
  }, []);

  useEffect(() => {
    setSavedImages(
      savedImagesRes.data ? savedImagesRes.data.imagesByPostId : []
    );
  }, [savedImagesRes.data]);

  const handleSubmit = async (
    { body }: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    if (currentUser) {
      try {
        if (isEditing && post) {
          await updatePost({
            variables: {
              id: post.id,
              body,
              images,
            },
          });
          Router.push(`${ResourcePaths.Post}${post.id}`);
        } else {
          const { data } = await createPost({
            variables: {
              body,
              images,
              groupId: group?.id,
              userId: currentUser.id,
            },
          });
          resetForm();
          setImages([]);
          setSubmitting(false);
          if (posts && setPosts) setPosts([data.createPost.post, ...posts]);
          else
            feedVar({
              ...feed,
              items: feedItemsAferCreate(data.createPost.post),
              totalItems: feed.totalItems + 1,
            });
        }
      } catch (err) {
        toastVar({
          title: Messages.errors.imageUploadError(),
          status: ToastStatus.Error,
        });
      }
    }
  };

  const deleteImageHandler = async (id: string) => {
    await deleteImage({
      variables: {
        id,
      },
    });
    setSavedImages(savedImages.filter((image: Image) => image.id !== id));
  };

  const feedItemsAferCreate = (newPost: Post): FeedItem[] => {
    let { items, totalItems } = feed;
    const totalPages = Math.ceil(totalItems / pageSize);
    const onLastPage = currentPage === totalPages - 1;
    if (totalItems > items.length && !onLastPage) items = items.slice(0, -1);
    return [newPost, ...items];
  };

  const removeSelectedImage = (imageName: string) => {
    setImages(
      [...images].filter((image) => {
        return image.name !== imageName;
      })
    );
    setImagesInputKey(generateRandom());
  };

  const isSubmitButtonDisabled = (formik: FormikProps<FormValues>): boolean => {
    if (isEditing && !!formik.submitCount && !formik.isValid) return true;
    return formik.isSubmitting;
  };

  const validatePostBody = (body: string) => {
    return body === "" && images.length === 0
      ? Messages.posts.form.postEmpty()
      : undefined;
  };

  return (
    <Formik
      initialValues={{
        body: isEditing && post ? post.body : "",
      }}
      onSubmit={handleSubmit}
    >
      {(formik) => (
        <Form className={styles.form} style={group && { marginTop: "48px" }}>
          <FormGroup>
            <Field
              name={FieldNames.Body}
              placeholder={
                formik.isSubmitting
                  ? Messages.states.loading()
                  : Messages.posts.form.bodyPlaceholder()
              }
              validate={validatePostBody}
              component={TextField}
              multiline
            />

            <ImageInput
              setImages={setImages}
              refreshKey={imagesInputKey}
              multiple
            />
          </FormGroup>

          <SelectedImages
            selectedImages={images}
            savedImages={savedImages}
            removeSelectedImage={removeSelectedImage}
            deleteSavedImage={deleteImageHandler}
          />

          <SubmitButton disabled={isSubmitButtonDisabled(formik)}>
            {isEditing
              ? Messages.actions.save()
              : Messages.posts.actions.post()}
          </SubmitButton>
        </Form>
      )}
    </Formik>
  );
};

export default PostsForm;
