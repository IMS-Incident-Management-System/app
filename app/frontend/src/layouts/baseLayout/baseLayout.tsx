import { Outlet } from "react-router-dom";
import { Footer } from "../../components/Footer/Footer";
import styles from "./baseLayout.module.scss";
import { Header } from "../../components/Header/Header";

export const BaseLayout = () => {
  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
