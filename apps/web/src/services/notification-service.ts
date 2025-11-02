/**
 * Notification Service
 * Handles in-app notifications
 */

import { TipoNotificacao, Prisma } from '@nm82/database';

interface CreateNotificationData {
  userId: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  link?: string;
}

export const notificationService = {
  async create(
    data: CreateNotificationData,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const client = tx || (await import('@/lib/prisma')).prisma;

    await client.notification.create({
      data: {
        userId: data.userId,
        tipo: data.tipo,
        titulo: data.titulo,
        mensagem: data.mensagem,
        link: data.link,
      },
    });
  },

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { prisma } = await import('@/lib/prisma');

    await prisma.notification.update({
      where: { id: notificationId, userId },
      data: { lida: true },
    });
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { prisma } = await import('@/lib/prisma');

    return prisma.notification.count({
      where: { userId, lida: false },
    });
  },
};
