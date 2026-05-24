import React, { useEffect, useState } from "react";
import {
  Avatar as AntAvatar,
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  Typography,
  message,
  Spin,
} from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useDispatch } from "../../store/store";
import { selectUserSelector } from "../../store/features/user/selectors";
import { signIn } from "../../store/features/user/userSlice";
import { clearPermissions } from "../../store/features/permissions/permissionsSlice";
import { selectCanUpdateProfile } from "../../store/features/permissions/selectors";
import AuthService from "../../services/auth.service";
import { getMyProfile, updateMyProfile, ProfileResponse } from "../../api/profile/profile";

const { Title, Text } = Typography;

export const Profile = () => {
  const user = useSelector(selectUserSelector);
  const canUpdateProfile = useSelector(selectCanUpdateProfile);
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [keycloak, setKeycloak] = useState<ProfileResponse["keycloak"] | null>(null);
  const [profile, setProfile] = useState<ProfileResponse["profile"] | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getMyProfile();
        setKeycloak(data.keycloak);
        setProfile(data.profile);
        form.setFieldsValue({
          patronymic: data.profile?.patronymic ?? "",
          personnel_number: data.profile?.personnel_number ?? "",
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
    dispatch(clearPermissions());
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
    const authService = AuthService.getInstance();
    authService.logout();
  };

  const onFinish = async (values: { patronymic?: string; personnel_number?: string }) => {
    setLoading(true);
    try {
      const updated = await updateMyProfile({
        patronymic: values.patronymic || null,
        personnel_number: values.personnel_number || null,
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

  const fullName = [keycloak?.family_name, keycloak?.given_name, profile?.patronymic].filter(Boolean).join(" ") || user.name || "Пользователь";
  const avatarLetter = (keycloak?.preferred_username || keycloak?.given_name || user.preferred_username)?.[0]?.toUpperCase() || "?";

  if (loading && !profile && !keycloak) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 0" }}>
      <Card
        bordered={false}
        style={{
          boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 6px 16px rgba(0,0,0,0.08)",
          borderRadius: 12,
          overflow: "hidden",
        }}
        styles={{ body: { padding: "32px 40px" } }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <AntAvatar
              size={72}
              style={{
                backgroundColor: "#1a365d",
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              {avatarLetter}
            </AntAvatar>
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 600, color: "#1a202c" }}>
                {fullName}
              </Title>
              {(keycloak?.preferred_username || keycloak?.email) && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {keycloak.preferred_username}
                  {keycloak.email && keycloak.preferred_username !== keycloak.email ? ` · ${keycloak.email}` : ""}
                </Text>
              )}
            </div>
          </div>
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ fontWeight: 500 }}
          >
            Выйти
          </Button>
        </div>

        <Divider style={{ margin: "24px 0" }} />

        <Title level={5} style={{ marginBottom: 16, fontWeight: 600, color: "#2d3748" }}>
          Основные данные
        </Title>
        <Descriptions
          column={1}
          size="small"
          labelStyle={{ color: "#718096", fontWeight: 500, width: 140 }}
          contentStyle={{ color: "#2d3748" }}
          style={{ marginBottom: 28 }}
        >
          <Descriptions.Item label="Фамилия">{keycloak?.family_name ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Имя">{keycloak?.given_name ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Отчество">{profile?.patronymic ?? "—"}</Descriptions.Item>
          {keycloak?.email && (
            <Descriptions.Item label="Email">{keycloak.email}</Descriptions.Item>
          )}
          <Descriptions.Item label="Логин">{keycloak?.preferred_username ?? "—"}</Descriptions.Item>
        </Descriptions>

        <Title level={5} style={{ marginBottom: 16, fontWeight: 600, color: "#2d3748" }}>
          Дополнительные данные
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          style={{ maxWidth: 360 }}
        >
          <Form.Item name="patronymic" label="Отчество">
            <Input placeholder="Введите отчество" disabled={!canUpdateProfile} />
          </Form.Item>
          <Form.Item name="personnel_number" label="Табельный номер">
            <Input placeholder="Введите табельный номер" disabled={!canUpdateProfile} />
          </Form.Item>
          {canUpdateProfile && (
            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Button type="primary" htmlType="submit" loading={loading} size="middle">
                Сохранить изменения
              </Button>
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  );
};
