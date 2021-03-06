import { ApolloError, GraphQLUpload } from "apollo-server-micro";
import { saveImage, deleteImage } from "../../utils/image";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";
import { TypeNames } from "../../constants/common";

interface PostInput {
  body: string;
  images: any;
}

const saveImages = async (post: any, images: any) => {
  for (const image of images ? images : []) {
    const path = await saveImage(image);

    await prisma.image.create({
      data: {
        user: {
          connect: {
            id: post.userId,
          },
        },
        post: {
          connect: {
            id: post.id,
          },
        },
        path,
      },
    });
  }
};

const postResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    post: async (_: any, { id }: { id: string }) => {
      const post = await prisma.post.findFirst({
        where: {
          id: parseInt(id),
        },
      });
      return post;
    },

    postsByUserName: async (_: any, { name }: { name: string }) => {
      const user = await prisma.user.findFirst({
        where: {
          name,
        },
        include: {
          posts: true,
        },
      });
      return user?.posts;
    },

    postsByGroupName: async (_: any, { name }: { name: string }) => {
      const group = await prisma.group.findFirst({
        where: {
          name,
        },
        include: {
          posts: true,
        },
      });
      return group?.posts;
    },
  },

  Mutation: {
    async createPost(
      _: any,
      {
        userId,
        groupId,
        input,
      }: { userId: string; groupId: string; input: PostInput }
    ) {
      const { body, images } = input;
      const groupData = {
        group: {
          connect: {
            id: parseInt(groupId),
          },
        },
      };
      const newPost = await prisma.post.create({
        data: {
          user: {
            connect: {
              id: parseInt(userId),
            },
          },
          ...(groupId && groupData),
          body,
        },
      });

      // for image upload error catching in utils/saveImage
      try {
        await saveImages(newPost, images);
      } catch (e) {
        const currPost = {
          where: { id: newPost.id },
        };
        await prisma.post.delete(currPost);
        throw new ApolloError(Messages.errors.imageUploadError());
      }

      return { post: newPost };
    },

    async updatePost(_: any, { id, input }: { id: string; input: PostInput }) {
      const { body, images } = input;
      const post = await prisma.post.update({
        where: { id: parseInt(id) },
        data: { body },
      });

      if (!post) throw new Error(Messages.items.notFound(TypeNames.Post));

      // for image upload error catching in utils/saveImage
      try {
        await saveImages(post, images);
      } catch (e) {
        throw new ApolloError(Messages.errors.imageUploadError());
      }

      return { post };
    },

    async deletePost(_: any, { id }: { id: string }) {
      const images = await prisma.image.findMany({
        where: { postId: parseInt(id) },
      });

      for (const image of images) {
        await deleteImage(image.path);
      }

      // TODO: cascading deletes are not deleting Like entries, requires further investigation
      await prisma.like.deleteMany({
        where: { postId: parseInt(id) || null },
      });

      await prisma.post.delete({
        where: { id: parseInt(id) },
      });

      return true;
    },
  },
};

export default postResolvers;
