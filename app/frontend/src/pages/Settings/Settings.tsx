import React, { useState } from "react";
import { Card, Tabs, Typography } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectCanManageAccess } from "../../store/features/permissions/selectors";
import { AccessManagementTab } from "./AccessManagementTab";

const { Title } = Typography;
const TAB_ACCESS = "access";

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(TAB_ACCESS);
  const canManageAccess = useSelector(selectCanManageAccess);

  const tabItems = [
    {
      key: TAB_ACCESS,
      label: (
        <span>
          <SafetyCertificateOutlined /> Управление доступом
        </span>
      ),
      children: canManageAccess ? (
        <AccessManagementTab />
      ) : (
        <Typography.Text type="secondary">Нет доступа к разделу.</Typography.Text>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px 24px 48px", maxWidth: 1200, margin: "0 auto" }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        Настройки
      </Title>
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} size="middle" />
      </Card>
    </div>
  );
};
