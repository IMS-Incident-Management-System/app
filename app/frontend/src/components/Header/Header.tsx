import React, { useEffect, useState, useMemo } from "react";
import { Avatar } from "./components/Avatar/Avatar";
import { Menu as MenuAntd, MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Icon from "@ant-design/icons/lib/components/Icon";
import Logo from "../../assets/svg/logo.svg";
import { selectUserSelector } from "../../store/features/user/selectors";
import { selectCan, selectCanReportGenerate, selectCanReportTable } from "../../store/features/permissions/selectors";
import { ERoutes } from "../../enums/routes";
import styles from "./Header.module.scss";
import { NotificationOutlined, BookOutlined, CalendarOutlined, HomeOutlined, FileTextOutlined, BarChartOutlined } from "@ant-design/icons";

export const Header = () => {
  const user = useSelector(selectUserSelector);
  const canIncidentList = useSelector(selectCan("incident", "list"));
  const canOAList = useSelector(selectCan("operational_activity", "list"));
  const canEventList = useSelector(selectCan("event", "list"));
  const canReportGenerate = useSelector(selectCanReportGenerate);
  const canReportTable = useSelector(selectCanReportTable);
  const canDeptList = useSelector(selectCan("department", "list"));
  const canEventTypeList = useSelector(selectCan("event_type", "list"));
  const canObjectTypeList = useSelector(selectCan("object_type", "list"));

  const menuItems = useMemo(() => {
    const items: MenuProps["items"] = [
      { label: "Главная", key: ERoutes.HOME, icon: <HomeOutlined /> },
    ];
    if (canIncidentList) {
      items.push({ label: "Инциденты", key: ERoutes.INCIDENTS_LIST, icon: <NotificationOutlined /> });
    }
    if (canOAList) {
      items.push({ label: "Операционная деятельность", key: ERoutes.OPERATIONAL_ACTIVITIES_LIST, icon: <CalendarOutlined /> });
    }
    if (canEventList) {
      items.push({ label: "События", key: ERoutes.EVENTS_LIST, icon: <FileTextOutlined /> });
    }
    if (canReportGenerate || canReportTable) {
      items.push({ label: "Отчетность", key: ERoutes.REPORTS, icon: <BarChartOutlined /> });
    }
    if (canDeptList || canEventTypeList || canObjectTypeList) {
      items.push({ label: "Справочники", key: ERoutes.REFERENCES, icon: <BookOutlined /> });
    }
    return items;
  }, [canIncidentList, canOAList, canEventList, canReportGenerate, canReportTable, canDeptList, canEventTypeList, canObjectTypeList]);

  const location = useLocation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");

  const onMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key as any);
    setCurrent(e.key);
  };

  const toHome = () => {
    navigate(ERoutes.HOME);
  };

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location]);

  return (
    <div className={styles.container}>
      <div className={styles.logo} onClick={toHome}>
        <Icon component={Logo} />
      </div>
      <div className={styles.menu}>
        <MenuAntd
          onClick={onMenuClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={menuItems}
        />
      </div>
      <div className={styles.controls}>
        <Avatar />
      </div>
    </div>
  );
};
