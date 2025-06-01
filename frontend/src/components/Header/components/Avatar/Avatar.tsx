import { Avatar as AvatarAntd} from "antd";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Avatar.module.scss";
import cn from "classnames";
import { selectUserSelector } from "../../../../store/features/user/selectors";
import { ERoutes } from "../../../../enums/routes";

export const Avatar = () => {
  const user = useSelector(selectUserSelector);
  const navigate = useNavigate();
  const location = useLocation();

  const isProfile = location.pathname === ERoutes.PROFILE;

  return (
    <>
      <AvatarAntd
        onClick={() => {
          navigate(ERoutes.PROFILE);
        }}
        className={cn(styles.avatar, isProfile && styles.avatarActive)}
      >
        {user.preferred_username?.[0]?.toUpperCase()}
      </AvatarAntd>
    </>
  );
};