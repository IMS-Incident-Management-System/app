import React, { useEffect, useState, useMemo, ReactNode } from "react";
import { Avatar } from "./components/Avatar/Avatar";
import { Menu as MenuAntd, MenuProps } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Icon from "@ant-design/icons/lib/components/Icon";
import Logo from "../../assets/svg/logo.svg";
import { selectCan, selectCanReferencesList, selectCanReportGenerate, selectCanReportTable } from "../../store/features/permissions/selectors";
import { ERoutes } from "../../enums/routes";
import styles from "./Header.module.scss";
import { NotificationOutlined, BookOutlined, CalendarOutlined, HomeOutlined, FileTextOutlined, BarChartOutlined } from "@ant-design/icons";

function menuItem(to: string, label: string, icon: ReactNode) {
  return {
    key: to,
    label: (
      <Link to={to} className={styles.menuLink}>
        <span className={styles.menuLinkIcon}>{icon}</span>
        {label}
      </Link>
    ),
  };
}

export const Header = () => {
  const canIncidentList = useSelector(selectCan("incident", "list"));
  const canOAList = useSelector(selectCan("operational_activity", "list"));
  const canEventList = useSelector(selectCan("event", "list"));
  const canReportGenerate = useSelector(selectCanReportGenerate);
  const canReportTable = useSelector(selectCanReportTable);
  const canReferencesList = useSelector(selectCanReferencesList);

  const menuItems = useMemo(() => {
    const items: MenuProps["items"] = [
      menuItem(ERoutes.HOME, "Главная", <HomeOutlined />),
    ];
    if (canIncidentList) {
      items.push(menuItem(ERoutes.INCIDENTS_LIST, "Инциденты", <NotificationOutlined />));
    }
    if (canOAList) {
      items.push(
        menuItem(ERoutes.OPERATIONAL_ACTIVITIES_LIST, "Операционная деятельность", <CalendarOutlined />)
      );
    }
    if (canEventList) {
      items.push(menuItem(ERoutes.EVENTS_LIST, "События", <FileTextOutlined />));
    }
    if (canReportGenerate || canReportTable) {
      items.push(menuItem(ERoutes.REPORTS, "Отчетность", <BarChartOutlined />));
    }
    if (canReferencesList) {
      items.push(menuItem(ERoutes.REFERENCES, "Справочники", <BookOutlined />));
    }
    return items;
  }, [canIncidentList, canOAList, canEventList, canReportGenerate, canReportTable, canReferencesList]);

  const location = useLocation();
  const [current, setCurrent] = useState("");

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location]);

  return (
    <div className={styles.container}>
      <Link to={ERoutes.HOME} className={styles.logo} aria-label="На главную">
        <Icon component={Logo} />
      </Link>
      <div className={styles.menu}>
        <MenuAntd selectedKeys={[current]} mode="horizontal" items={menuItems} />
      </div>
      <div className={styles.controls}>
        <Avatar />
      </div>
    </div>
  );
};
