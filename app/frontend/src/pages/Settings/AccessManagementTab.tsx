import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Checkbox,
  message,
  Typography,
  Select,
  Tag,
  Collapse,
  Alert,
  Spin,
  Tabs,
} from "antd";
import { SearchOutlined, TeamOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import styles from "./AccessManagementTab.module.scss";
import type { ColumnsType } from "antd/es/table";
import {
  getRoles,
  getUsers,
  getPermissionCodes,
  createRole,
  updateRole,
  deleteRole,
  setUserRoles,
  type RoleDto,
  type UserWithRolesDto,
  type PermissionGroupsResponse,
} from "../../api/access/access";

const { Text } = Typography;

const ACTION_LABELS: Record<string, string> = {
  list: "Просмотр списка",
  create: "Создание",
  read: "Просмотр",
  update: "Редактирование",
  delete: "Удаление",
  attachments: "Вложения",
  sent_1db: "Отправлено 1ДБ",
  generate: "Формирование",
  table: "Таблица",
  export: "Экспорт",
  dashboard: "Дашборд",
  manage: "Управление",
};

/** Форматирует код права в "Сущность: Действие" по группам из API */
function formatPermissionLabel(
  permissionCode: string,
  groups?: Record<string, { label: string }> | null
): string {
  const parts = String(permissionCode).split(".");
  const entityKey = parts[0];
  const actionKey = parts[1] ?? "";
  const entityLabel = groups?.[entityKey]?.label ?? entityKey;
  const actionLabel = ACTION_LABELS[actionKey] ?? actionKey;
  return `${entityLabel}: ${actionLabel}`;
}

type PermissionGroupForModal = { key: string; label: string; permissions: { value: string; label: string }[] };

const PermissionCheckboxGroups: React.FC<{
  value?: string[];
  onChange?: (vals: string[]) => void;
  groups: PermissionGroupForModal[];
}> = ({ value = [], onChange, groups }) => (
  <Collapse
    defaultActiveKey={groups.map((g) => g.key)}
    style={{
      maxHeight: 360,
      overflow: "auto",
      border: "1px solid #f0f0f0",
      borderRadius: 8,
      background: "#fafafa",
    }}
    items={groups.map((gr) => {
      const groupValues = (gr.permissions || []).map((p) => p.value);
      const currentInGroup = (value || []).filter((p) => groupValues.includes(p));
      return {
        key: gr.key,
        label: <span style={{ fontWeight: 500 }}>{gr.label}</span>,
        children: (
          <Checkbox.Group
            options={gr.permissions || []}
            value={currentInGroup}
            onChange={(vals) => {
              const rest = (value || []).filter((p) => !groupValues.includes(p));
              onChange?.([...rest, ...(vals as string[])]);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          />
        ),
      };
    })}
  />
);

const TAB_ROLES = "roles";
const TAB_USERS = "users";

/** Нормализует ответ API прав в единый формат */
function normalizePermissionGroupsResponse(raw: unknown): PermissionGroupsResponse | null {
  let o: Record<string, unknown> | null = null;
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      o = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  } else if (typeof raw === "object") {
    o = raw as Record<string, unknown>;
  }
  if (!o) return null;
  let permissions: string[] = [];
  let groups: Record<string, { label: string; permissions: string[] }> = {};
  if (Array.isArray(o.permissions) && o.groups && typeof o.groups === "object" && !Array.isArray(o.groups)) {
    permissions = o.permissions as string[];
    groups = o.groups as Record<string, { label: string; permissions: string[] }>;
  } else if (o.data && typeof o.data === "object") {
    const d = o.data as Record<string, unknown>;
    if (Array.isArray(d.permissions) && d.groups && typeof d.groups === "object" && !Array.isArray(d.groups)) {
      permissions = d.permissions as string[];
      groups = d.groups as Record<string, { label: string; permissions: string[] }>;
    }
  }
  if (permissions.length === 0 && Object.keys(groups).length === 0) return null;
  if (Object.keys(groups).length === 0 && permissions.length > 0) {
    const byPrefix: Record<string, string[]> = {};
    for (const p of permissions) {
      const prefix = p.includes(".") ? p.split(".")[0] : "other";
      if (!byPrefix[prefix]) byPrefix[prefix] = [];
      byPrefix[prefix].push(p);
    }
    groups = Object.fromEntries(
      Object.entries(byPrefix).map(([key, perms]) => [key, { label: key, permissions: perms }])
    );
  }
  return { permissions, groups };
}

const ACCESS_QUERY_KEY = "access";

export const AccessManagementTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>(TAB_ROLES);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchDebounced, setUserSearchDebounced] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleEditing, setRoleEditing] = useState<RoleDto | null>(null);
  const [userRolesModalOpen, setUserRolesModalOpen] = useState(false);
  const [userForRoles, setUserForRoles] = useState<UserWithRolesDto | null>(null);
  const [roleForm] = Form.useForm();
  const [userRolesForm] = Form.useForm();

  useEffect(() => {
    const t = setTimeout(() => setUserSearchDebounced(userSearchQuery), 300);
    return () => clearTimeout(t);
  }, [userSearchQuery]);

  useEffect(() => {
    if (activeTab === TAB_USERS && userSearchQuery !== userSearchDebounced) setUserPage(1);
  }, [userSearchQuery, userSearchDebounced, activeTab]);

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: [ACCESS_QUERY_KEY, "roles"],
    queryFn: getRoles,
  });

  const { data: permRaw, isLoading: permLoading } = useQuery({
    queryKey: [ACCESS_QUERY_KEY, "permissions"],
    queryFn: getPermissionCodes,
  });
  const permissionGroups = normalizePermissionGroupsResponse(permRaw) ?? null;

  const {
    data: usersResponse,
    isLoading: usersLoading,
    isFetching: usersFetching,
  } = useQuery({
    queryKey: [ACCESS_QUERY_KEY, "users", userSearchDebounced, userPage, userPageSize],
    queryFn: () => getUsers({ search: userSearchDebounced, page: userPage, limit: userPageSize }),
    enabled: activeTab === TAB_USERS,
  });
  const users = usersResponse?.data ?? [];
  const userTotal = usersResponse?.total ?? 0;

  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries([ACCESS_QUERY_KEY, "roles"]);
      queryClient.invalidateQueries([ACCESS_QUERY_KEY, "users"]);
    },
  });
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateRole>[1] }) => updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries([ACCESS_QUERY_KEY, "roles"]);
      queryClient.invalidateQueries([ACCESS_QUERY_KEY, "users"]);
    },
  });
  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries([ACCESS_QUERY_KEY, "roles"]);
      queryClient.invalidateQueries([ACCESS_QUERY_KEY, "users"]);
    },
  });
  const setUserRolesMutation = useMutation({
    mutationFn: ({ externalId, roleIds }: { externalId: string; roleIds: number[] }) =>
      setUserRoles(externalId, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries([ACCESS_QUERY_KEY, "users"]);
    },
  });

  const loading = rolesLoading || permLoading || usersLoading || usersFetching;

  const handleUsersTableChange = (page: number, pageSize: number) => {
    setUserPage(page);
    setUserPageSize(pageSize);
  };

  const openCreateRole = () => {
    setRoleEditing(null);
    roleForm.setFieldsValue({ name: "", code: "", description: "", permissions: [] });
    setRoleModalOpen(true);
  };

  const openEditRole = (role: RoleDto) => {
    setRoleEditing(role);
    roleForm.setFieldsValue({
      name: role.name,
      code: role.code,
      description: role.description || "",
      permissions: role.permissions || [],
    });
    setRoleModalOpen(true);
  };

  const handleRoleSubmit = async () => {
    const values = await roleForm.validateFields();
    try {
      if (roleEditing) {
        await updateRoleMutation.mutateAsync({
          id: roleEditing.id,
          data: {
            name: values.name,
            code: values.code ?? roleEditing.code,
            description: values.description || null,
            permissions: values.permissions || [],
          },
        });
        message.success("Роль обновлена");
      } else {
        await createRoleMutation.mutateAsync({
          name: values.name,
          code: values.code,
          description: values.description || null,
          permissions: values.permissions || [],
        });
        message.success("Роль создана");
      }
      setRoleModalOpen(false);
    } catch (e) {
      message.error(roleEditing ? "Ошибка обновления роли" : "Ошибка создания роли");
    }
  };

  const handleDeleteRole = (role: RoleDto) => {
    Modal.confirm({
      title: "Удалить роль?",
      content: `Роль «${role.name}» будет удалена.`,
      okText: "Удалить",
      okType: "danger",
      cancelText: "Отмена",
      onOk: async () => {
        try {
          await deleteRoleMutation.mutateAsync(role.id);
          message.success("Роль удалена");
        } catch (e) {
          message.error("Ошибка удаления роли");
        }
      },
    });
  };

  const openUserRoles = (user: UserWithRolesDto) => {
    setUserForRoles(user);
    userRolesForm.setFieldsValue({
      role_ids: (user.roles || []).map((r) => r.id),
    });
    setUserRolesModalOpen(true);
  };

  const handleUserRolesSubmit = async () => {
    if (!userForRoles) return;
    const values = await userRolesForm.validateFields();
    try {
      await setUserRolesMutation.mutateAsync({
        externalId: userForRoles.external_id,
        roleIds: values.role_ids || [],
      });
      message.success("Роли пользователя обновлены");
      setUserRolesModalOpen(false);
    } catch (e) {
      message.error("Ошибка сохранения ролей");
    }
  };

  const roleColumns: ColumnsType<RoleDto> = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string) => <span className={styles.roleName}>{name}</span>,
    },
    {
      title: "Код",
      dataIndex: "code",
      key: "code",
      width: 160,
      render: (code: string) => <span className={styles.roleCode}>{code}</span>,
    },
    {
      title: "Права",
      key: "permissions",
      render: (_, r) => (
        <div className={styles.tags}>
          {(r.permissions || []).slice(0, 5).map((p) => (
            <Tag key={p} className={styles.tag}>
              {formatPermissionLabel(p, permissionGroups?.groups ?? undefined)}
            </Tag>
          ))}
          {(r.permissions?.length || 0) > 5 && (
            <Tag className={styles.moreTag}>+{(r.permissions?.length || 0) - 5}</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      width: 196,
      render: (_, record) => (
        <div className={styles.actions}>
          <Button size="small" onClick={() => openEditRole(record)}>
            Изменить
          </Button>
          <Button size="small" danger onClick={() => handleDeleteRole(record)}>
            Удалить
          </Button>
        </div>
      ),
    },
  ];

  const userColumns: ColumnsType<UserWithRolesDto> = [
    {
      title: "ФИО / Логин",
      key: "display",
      ellipsis: true,
      render: (_, u) => (
        <span className={styles.roleName}>
          {u.display_name || u.preferred_username || u.external_id}
        </span>
      ),
    },
    {
      title: "Роли",
      key: "roles",
      render: (_, u) => (
        <div className={styles.tags}>
          {u.roles?.map((r) => (
            <Tag key={r.id} className={styles.tag}>{r.name}</Tag>
          ))}
          {(!u.roles || u.roles.length === 0) && <span className={styles.emptyRoles}>Нет ролей</span>}
        </div>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <div className={styles.actions}>
          <Button size="small" onClick={() => openUserRoles(record)}>
            Назначить
          </Button>
        </div>
      ),
    },
  ];

  const permissionGroupsForModal: { key: string; label: string; permissions: { value: string; label: string }[] }[] =
    permissionGroups?.groups && typeof permissionGroups.groups === "object" && !Array.isArray(permissionGroups.groups)
      ? Object.entries(permissionGroups.groups).map(([key, group]) => ({
          key,
          label: (group && group.label) || key,
          permissions: (group && Array.isArray(group.permissions) ? group.permissions : []).map((p) => ({
            value: p,
            label: ACTION_LABELS[String(p).split(".").pop() || ""] || String(p).split(".").pop() || p,
          })),
        }))
      : [];

  const tabItems = [
    {
      key: TAB_ROLES,
      label: (
        <span>
          <SafetyCertificateOutlined /> Роли
        </span>
      ),
      children: (
        <>
          <div className={styles.toolbar}>
            <Button type="primary" onClick={openCreateRole}>
              Создать роль
            </Button>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            columns={roleColumns}
            dataSource={roles || []}
            pagination={{ pageSize: 30, showSizeChanger: false, showTotal: (t) => `Всего: ${t}` }}
            locale={{ emptyText: "Нет ролей. Создайте первую роль." }}
            tableLayout="fixed"
          />
        </>
      ),
    },
    {
      key: TAB_USERS,
      label: (
        <span>
          <TeamOutlined /> Пользователи
        </span>
      ),
      children: (
        <>
          <div className={styles.toolbar}>
            <Input
              className={styles.search}
              placeholder="Поиск по ФИО, логину, ролям..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              allowClear
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
            />
          </div>
          <Table
            rowKey="id"
            loading={loading}
            columns={userColumns}
            dataSource={users || []}
            pagination={{
              current: userPage,
              pageSize: userPageSize,
              total: userTotal,
              showSizeChanger: true,
              showTotal: (t) => `Всего: ${t}`,
              onChange: handleUsersTableChange,
            }}
            locale={{ emptyText: "Нет пользователей (появятся после входа в систему)." }}
            tableLayout="fixed"
          />
        </>
      ),
    },
  ];

  return (
    <div className={styles.panel}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabPosition="left"
        items={tabItems}
      />

      <Modal
        title={roleEditing ? "Редактировать роль" : "Создать роль"}
        open={roleModalOpen}
        onOk={handleRoleSubmit}
        onCancel={() => setRoleModalOpen(false)}
        width={640}
        destroyOnClose
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={createRoleMutation.isLoading || updateRoleMutation.isLoading}
        styles={{ body: { paddingTop: 20 } }}
      >
        <Form form={roleForm} layout="vertical" requiredMark={false}>
          <Form.Item name="name" label="Название" rules={[{ required: true, message: "Укажите название" }]}>
            <Input placeholder="Например: Оператор" />
          </Form.Item>
          <Form.Item name="code" label="Код" rules={[{ required: true, message: "Укажите код" }]}>
            <Input placeholder="Например: operator" disabled={!!roleEditing} />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={2} placeholder="Необязательно" />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="Права доступа"
            help="Раскройте блоки по сущностям и отметьте нужные права."
          >
            {permLoading ? (
              <div style={{ padding: "24px 0", textAlign: "center" }}>
                <Spin tip="Загрузка списка прав..." />
              </div>
            ) : (permissionGroupsForModal || []).length === 0 ? (
              <Alert
                type="warning"
                message="Список прав не загружен"
                description="Закройте окно и откройте снова или обновите страницу."
                showIcon
              />
            ) : (
              <PermissionCheckboxGroups groups={permissionGroupsForModal} />
            )}
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <span>
            Назначить роли:{" "}
            <Text strong>{userForRoles?.display_name || userForRoles?.preferred_username || userForRoles?.external_id}</Text>
          </span>
        }
        open={userRolesModalOpen}
        onOk={handleUserRolesSubmit}
        onCancel={() => setUserRolesModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
        styles={{ body: { paddingTop: 20 } }}
      >
        <Form form={userRolesForm} layout="vertical" requiredMark={false}>
          <Form.Item name="role_ids" label="Роли">
            <Select
              mode="multiple"
              placeholder="Выберите роли"
              options={(roles || []).map((r) => ({ label: r.name, value: r.id }))}
              optionFilterProp="label"
              allowClear
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
