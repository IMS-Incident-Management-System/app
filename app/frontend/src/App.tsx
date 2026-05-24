import { router } from "./routes/router";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { baseTheme } from "./theme/baseTheme";
import { App as AntdApp } from "antd";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { AuthProvider } from "./components/AuthProvider/authProvider";
import { QueryClientProvider } from "react-query";
import { queryClient } from "./plugins/query";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import "./styles/index.scss";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={baseTheme} locale={ruRU}>
        <AntdApp>
          <Provider store={store}>
          <AuthProvider>
            <ErrorBoundary>
              <RouterProvider router={router} />
            </ErrorBoundary>
          </AuthProvider>
          </Provider>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
