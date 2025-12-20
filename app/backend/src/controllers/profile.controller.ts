import { Request, Response, RequestHandler } from 'express';
import fs from 'fs';
import path from 'path';
import { UserProfile } from '../models';
import { User } from '../interfaces/user';
import { MulterFile } from '../types/multer';

interface RequestWithUser extends Request {
  user?: User & { sub?: string };
}

export const getMyProfile: RequestHandler = async (req, res) => {
  try {
    const user = (req as RequestWithUser).user;

    if (!user?.sub) {
      res.status(401).json({ message: 'Пользователь не аутентифицирован' });
      return;
    }

    const profile = await UserProfile.findOne({
      where: { external_id: user.sub },
    });

    res.json({
      keycloak: {
        sub: user.sub,
        email: user.email,
        email_verified: user.email_verified,
        family_name: user.family_name,
        given_name: user.given_name,
        name: user.name,
        preferred_username: user.preferred_username,
        realm_roles: user.realm_roles,
      },
      profile,
    });
  } catch (error: any) {
    console.error('Ошибка при получении профиля:', error);
    res.status(500).json({ message: 'Ошибка при получении профиля', error: error.message });
  }
};

export const updateMyProfile: RequestHandler = async (req, res) => {
  try {
    const user = (req as RequestWithUser).user;

    if (!user?.sub) {
      res.status(401).json({ message: 'Пользователь не аутентифицирован' });
      return;
    }

    const { patronymic, personnel_number } = req.body;

    const [profile] = await UserProfile.upsert(
      {
        external_id: user.sub,
        auth_provider: 'keycloak',
        patronymic: patronymic ?? null,
        personnel_number: personnel_number ?? null,
      },
      { returning: true }
    );

    res.json(profile);
  } catch (error: any) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля', error: error.message });
  }
};

export const uploadProfilePhoto: RequestHandler = async (req, res) => {
  try {
    const user = (req as RequestWithUser).user;

    if (!user?.sub) {
      res.status(401).json({ message: 'Пользователь не аутентифицирован' });
      return;
    }

    const file = (req as any).file as MulterFile | undefined;

    if (!file) {
      res.status(400).json({ message: 'Файл не найден' });
      return;
    }

    // Сохраняем файл в файловую систему (например, uploads/profile/)
    const uploadsDir = path.join(process.cwd(), 'backend', 'uploads', 'profiles');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const photoPath = `/uploads/profiles/${fileName}`;

    const [profile] = await UserProfile.upsert(
      {
        external_id: user.sub,
        auth_provider: 'keycloak',
        photo_path: photoPath,
      },
      { returning: true }
    );

    res.json(profile);
  } catch (error: any) {
    console.error('Ошибка при загрузке фото профиля:', error);
    res.status(500).json({ message: 'Ошибка при загрузке фото профиля', error: error.message });
  }
};

