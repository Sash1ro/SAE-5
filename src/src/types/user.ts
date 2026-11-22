export type Credentials = {
  email: string;
  password: string;
};

export type UserPublic = {
  id: string;
  email: string;
};

export type AuthResp = {
  user: UserPublic;
  token: string;
};
