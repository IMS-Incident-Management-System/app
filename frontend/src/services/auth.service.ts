import Keycloak, {
  KeycloakInitOptions,
  KeycloakConfig,
  KeycloakInstance,
  //@ts-ignore
} from "keycloak-js";

class AuthService {
  private static instance: AuthService;
  private keycloakConfig: KeycloakConfig;
  private initOptions: KeycloakInitOptions;
  private keycloak: KeycloakInstance | null = null;
  private _isAuthenticated: boolean = false;
  private token: string | null = null;

  private constructor() {
    this.keycloakConfig = {
      url: process.env.baseURLKeycloakFE || "http://localhost:8087",
      realm: "ims",
      clientId: "ims_client",
    };

    this.initOptions = {
      onLoad: "login-required",
      checkLoginIframe: false,
    };
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async init(): Promise<boolean> {
    if (!this.keycloak) {
      this.keycloak = new Keycloak(this.keycloakConfig);

      try {
        const authenticated = await this.keycloak.init(this.initOptions);
        if (authenticated) {
          this._isAuthenticated = true;
          this.token = this.keycloak.token;
        } else {
          this._isAuthenticated = false;
        }
        return authenticated;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  public getToken(): string | null {
    if (
      this.keycloak &&
      this.keycloak.token &&
      !this.keycloak.isTokenExpired(5)
    ) {
      return this.keycloak.token;
    }
    return null;
  }

  public async refreshTokenIfNeeded(minValidity = 5): Promise<string | null> {
    if (this.keycloak) {
      try {
        const refreshed = await this.keycloak.updateToken(minValidity);
        if (refreshed) {
          console.log("Token was refreshed");
          this.token = this.keycloak.token;
        }
        return this.keycloak.token || null;
      } catch (error) {
        console.error("Failed to refresh token:", error);
        this.logout();
        return null;
      }
    }
    return null;
  }

  private scheduleTokenRefresh(): void {
    if (this.keycloak) {
      setInterval(async () => {
        try {
          await this.refreshTokenIfNeeded(10); // Обновляем токен, если до истечения срока осталось меньше 10 секунд
        } catch (error) {
          console.error("Error refreshing token:", error);
        }
      }, 60000); // Проверяем раз в минуту (настраивается по необходимости)
    }
  }

  public async getUserInfo(): Promise<any | null> {
    if (this.keycloak) {
      try {
        const userInfo = await this.keycloak.loadUserInfo();
        return userInfo;
      } catch (error) {
        console.error("Failed to get user info:", error);
        return null;
      }
    }
    return null;
  }

  public isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  public logout(): void {
    if (this.keycloak) {
      this.keycloak.logout();
      this._isAuthenticated = false;
      this.token = null;
      console.log("Logged out successfully");
    }
  }

  public getKeycloakInstance(): KeycloakInstance | null {
    return this.keycloak;
  }
}

export default AuthService;
