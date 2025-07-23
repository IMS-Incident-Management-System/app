import styles from "./Footer.module.scss";

export const Footer = () => {
  return (
    <div className={styles.container}>
      ©{new Date().getFullYear()} Все права защищены.
    </div>
  );
};
