import React, { useEffect, useState } from "react";
import { Avatar as AntAvatar, Button, Form, Input, Typography, Upload, message, Space, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useDispatch } from "../../store/store";
import { selectUserSelector } from "../../store/features/user/selectors";
import { signIn } from "../../store/features/user/userSlice";
import AuthService from "../../services/auth.service";
import { getMyProfile, updateMyProfile, uploadProfilePhoto, ProfileResponse } from "../../api/profile/profile";

const { Title, Text } = Typography;

export const Profile = () => {
  const user = useSelector(selectUserSelector);
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileResponse["profile"] | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getMyProfile();
        setProfile(data.profile);
        form.setFieldsValue({
          family_name: data.keycloak.family_name,
          given_name: data.keycloak.given_name,
          patronymic: data.profile?.patronymic || "",
          personnel_number: data.profile?.personnel_number || "",
        });
      } catch (error) {
        console.error("Ошибка загрузки профиля", error);
        message.error("Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [form]);

  const handleLogout = () => {
    // очищаем данные пользователя в Redux
    dispatch(
      signIn({
        given_name: "",
        family_name: "",
        email: "",
        email_verified: false,
        groups: [],
        locale: "",
        name: "",
        preferred_username: "",
        roles: [],
        sub: "",
        error: null,
      }) as any
    );

    // выходим из Keycloak
    const authService = AuthService.getInstance();
    authService.logout();
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const updated = await updateMyProfile({
        patronymic: values.patronymic,
        personnel_number: values.personnel_number,
      });
      setProfile(updated);
      message.success("Профиль сохранён");
    } catch (error) {
      console.error("Ошибка сохранения профиля", error);
      message.error("Не удалось сохранить профиль");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;

    try {
      const updated = await uploadProfilePhoto(file as File);
      setProfile(updated);
      message.success("Фото обновлено");
      onSuccess?.(updated);
    } catch (error) {
      console.error("Ошибка загрузки фото", error);
      message.error("Не удалось загрузить фото");
      onError?.(error);
    }
  };

  const avatarLetter = user.preferred_username?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || "";

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
            <Space align="center">
              <AntAvatar
                size={64}
                src={profile?.photo_path ? profile.photo_path : undefined}
              >
                {avatarLetter}
              </AntAvatar>
              <div>
                <Title level={4} style={{ marginBottom: 0 }}>
                  {user.family_name} {user.given_name}
                </Title>
                <Text type="secondary">{user.preferred_username}</Text>
              </div>
            </Space>

            <Button danger onClick={handleLogout}>
              Выйти
            </Button>
          </Space>

          <Upload
            customRequest={handleUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Загрузить новое фото</Button>
          </Upload>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              family_name: user.family_name,
              given_name: user.given_name,
              patronymic: "",
              personnel_number: "",
            }}
          >
            <Form.Item label="Фамилия" name="family_name">
              <Input disabled />
            </Form.Item>

            <Form.Item label="Имя" name="given_name">
              <Input disabled />
            </Form.Item>

            <Form.Item label="Отчество" name="patronymic">
              <Input placeholder="Введите отчество" />
            </Form.Item>

            <Form.Item label="Табельный номер" name="personnel_number">
              <Input placeholder="Введите табельный номер" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Сохранить
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};
