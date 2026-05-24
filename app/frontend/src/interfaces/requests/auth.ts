export interface UserResponse {
  given_name: string;
  family_name: string;
  email: string;
  email_verified: boolean;
  groups: string[];
  locale: string;
  name: string;
  preferred_username: string;
  roles: string[];
  sub: string;
  error: any;
}
