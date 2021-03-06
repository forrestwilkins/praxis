import { GraphQLUpload } from "apollo-server-micro";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";
import { TypeNames } from "../../constants/common";

interface PermissionInput {
  permissions: Permission[];
}

const permissionResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    hasPermissionGlobally: async (
      _: any,
      { name, userId }: { name: string; userId: string }
    ) => {
      const roleMembersWithRole = await prisma.roleMember.findMany({
        where: {
          userId: parseInt(userId),
        },
        include: {
          role: true,
        },
      });
      const globalRoles: BackendRole[] = [];
      for (const member of roleMembersWithRole) {
        if (member.role?.global) {
          globalRoles.push(member.role);
        }
      }
      const permissions: BackendPermission[] = [];
      for (const role of globalRoles) {
        const _permissions = await prisma.permission.findMany({
          where: {
            roleId: role.id,
          },
        });
        permissions.push(
          ..._permissions.filter((_permission) => {
            return !permissions.find(
              (permission) => _permission.id === permission.id
            );
          })
        );
      }
      const hasPermissionGlobally = permissions.find(
        (permission) => permission.name === name && permission.enabled
      );
      return !!hasPermissionGlobally;
    },

    permissionsByRoleId: async (_: any, { roleId }: { roleId: string }) => {
      const permissions = await prisma.permission.findMany({
        where: {
          roleId: parseInt(roleId),
        },
      });
      return permissions;
    },
  },

  Mutation: {
    async updatePermissions(_: any, { input }: { input: PermissionInput }) {
      const { permissions } = input;
      let updatedPermissions: BackendPermission[] = [];

      for (const permission of permissions) {
        const { id, enabled } = permission;
        const updatedPermission = await prisma.permission.update({
          where: { id: parseInt(id) },
          data: { enabled },
        });

        if (!updatedPermission)
          throw new Error(Messages.items.notFound(TypeNames.Permission));

        updatedPermissions = [...updatedPermissions, updatedPermission];
      }

      return { permissions: updatedPermissions };
    },
  },
};

export default permissionResolvers;
