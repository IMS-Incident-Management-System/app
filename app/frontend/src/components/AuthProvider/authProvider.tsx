import React, { PropsWithChildren, useEffect, useState } from "react";
import AuthService from "../../services/auth.service";
import { useDispatch } from "../../store/store";
import { signIn } from "../../store/features/user/userSlice";
import styles from "./styles.module.scss";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const authService = AuthService.getInstance();
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const authenticated = await authService.init();
      if (authenticated) {
        // После успешной инициализации, получаем информацию о пользователе
        const userInfo = await authService.getUserInfo();

        dispatch(signIn(userInfo));
      }
      setIsAuth(authenticated);
      setLoading(false);
    };

    initializeAuth();
  }, []);

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.loader} />
      </div>
    ); // Пока идет инициализация, показываем загрузку
  }

  if (!isAuth) {
    return <div>Not authenticated. Redirecting...</div>; // Если не аутентифицирован, показываем сообщение
  }

  return <>{children}</>; // Если аутентифицирован, рендерим детей
};
