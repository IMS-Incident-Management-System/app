import React, { useEffect, useState } from "react";
import { Avatar } from "./components/Avatar/Avatar";
import { Menu as MenuAntd, MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Icon from "@ant-design/icons/lib/components/Icon";
import Logo from "../../assets/svg/logo.svg";
import { selectUserSelector } from "../../store/features/user/selectors";
import { UserResponse } from "../../interfaces/requests/auth";
import { ERoutes } from "../../enums/routes";
import styles from "./Header.module.scss";
import { NotificationOutlined, BookOutlined } from "@ant-design/icons";

const items = (user: UserResponse) => {
  const menu = [];

  menu.push(
    {
      label: "Инциденты",
      key: ERoutes.HOME,
      icon: <NotificationOutlined />,
    },
    {
      label: "Справочники",
      key: ERoutes.REFERENCES,
      icon: <BookOutlined />,
    },
  );

  return menu;
};

export const Header = () => {
  const user = useSelector(selectUserSelector);
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
          items={items(user)}
        />
      </div>
      <div className={styles.controls}>
        <Avatar />
      </div>
    </div>
  );
};
