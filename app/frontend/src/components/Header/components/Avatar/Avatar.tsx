import { useEffect, useState } from "react";
import { Avatar as AvatarAntd, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Avatar.module.scss";
import cn from "classnames";
import { selectUserSelector } from "../../../../store/features/user/selectors";
import { ERoutes } from "../../../../enums/routes";
import { getMyProfile } from "../../../../api/profile/profile";

function getDisplayName(
  user: { family_name?: string; given_name?: string; preferred_username?: string; name?: string },
  patronymic?: string | null
): string {
  if (user.family_name?.trim()) {
    const i = user.given_name?.trim()?.[0]?.toUpperCase();
    const o = patronymic?.trim()?.[0]?.toUpperCase();
    const parts = [i, o].filter(Boolean).map((x) => x + ".");
    return parts.length ? `${user.family_name.trim()} ${parts.join("")}` : user.family_name.trim();
  }
  return user.preferred_username?.trim() || user.name?.trim() || "Пользователь";
}

export const Avatar = () => {
  const user = useSelector(selectUserSelector);
  const navigate = useNavigate();
  const location = useLocation();
  const [patronymic, setPatronymic] = useState<string | null>(null);

  useEffect(() => {
    getMyProfile()
      .then((data) => setPatronymic(data.profile?.patronymic ?? null))
      .catch(() => {});
  }, []);

  const isProfile = location.pathname === ERoutes.PROFILE;
  const isSettings = location.pathname === ERoutes.SETTINGS;
  const displayName = getDisplayName(user, patronymic);

  const menuItems: MenuProps["items"] = [
    {
      key: "settings",
      label: "Настройки",
      icon: <SettingOutlined />,
      onClick: () => navigate(ERoutes.SETTINGS),
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["hover"]}
      placement="bottomRight"
    >
      <div
        className={cn(styles.wrapper, (isProfile || isSettings) && styles.avatarActive)}
        onClick={() => navigate(ERoutes.PROFILE)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && navigate(ERoutes.PROFILE)}
      >
        <AvatarAntd className={styles.avatar}>
          {user.preferred_username?.[0]?.toUpperCase() || user.given_name?.[0]?.toUpperCase() || "?"}
        </AvatarAntd>
        <span className={styles.name}>{displayName}</span>
      </div>
    </Dropdown>
  );
};