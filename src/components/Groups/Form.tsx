import { useState } from "react";
import { useMutation } from "@apollo/client";
import Router from "next/router";
import { FormGroup } from "@material-ui/core";
import { RemoveCircle } from "@material-ui/icons";
import { Formik, Form, Field } from "formik";

import { CREATE_GROUP, UPDATE_GROUP } from "../../apollo/client/mutations";
import styles from "../../styles/Shared/Shared.module.scss";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import { generateRandom } from "../../utils/common";
import SubmitButton from "../Shared/SubmitButton";
import TextField from "../Shared/TextField";
import { FieldNames, ResourcePaths } from "../../constants/common";
import ImageInput from "../Shared/ImageInput";

interface FormValues {
  name: string;
  description: string;
}

interface Props {
  group?: Group;
  isEditing?: boolean;
}

const GroupForm = ({ group, isEditing }: Props) => {
  const currentUser = useCurrentUser();
  const [coverPhoto, setCoverPhoto] = useState<File>();
  const [imageInputKey, setImageInputKey] = useState<string>("");

  const [createGroup] = useMutation(CREATE_GROUP);
  const [updateGroup] = useMutation(UPDATE_GROUP);

  const initialValues = {
    name: isEditing && group ? group.name : "",
    description: isEditing && group ? group.description : "",
  };

  const handleSubmit = async ({ name, description }: FormValues) => {
    if (currentUser) {
      try {
        if (isEditing && group) {
          const { data } = await updateGroup({
            variables: {
              id: group.id,
              name,
              description,
              coverPhoto,
            },
          });

          Router.push(`${ResourcePaths.Group}${data.updateGroup.group.name}`);
        } else {
          const { data } = await createGroup({
            variables: {
              name,
              description,
              coverPhoto,
              creatorId: currentUser.id,
            },
          });

          Router.push(`${ResourcePaths.Group}${data.createGroup.group.name}`);
        }
      } catch (err) {
        alert(err);
      }
    }
  };

  const removeSelectedCoverPhoto = () => {
    setCoverPhoto(undefined);
    setImageInputKey(generateRandom());
  };

  if (currentUser)
    return (
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {(formik) => (
          <Form className={styles.form}>
            <FormGroup>
              <Field
                name={FieldNames.Name}
                placeholder={Messages.groups.form.name()}
                component={TextField}
                autoComplete="off"
              />

              <Field
                name={FieldNames.Description}
                placeholder={Messages.groups.form.description()}
                component={TextField}
                multiline
              />

              <ImageInput setImage={setCoverPhoto} refreshKey={imageInputKey} />
            </FormGroup>

            {coverPhoto && (
              <div className={styles.selectedImages}>
                <img
                  alt={Messages.images.couldNotRender()}
                  className={styles.selectedImage}
                  src={URL.createObjectURL(coverPhoto)}
                />

                <RemoveCircle
                  color="primary"
                  onClick={() => removeSelectedCoverPhoto()}
                  className={styles.removeSelectedImageButton}
                />
              </div>
            )}

            <SubmitButton disabled={!!formik.submitCount}>
              {isEditing ? Messages.actions.save() : Messages.actions.create()}
            </SubmitButton>
          </Form>
        )}
      </Formik>
    );
  return null;
};

export default GroupForm;
