export interface UserReadModel {
  id: string;
  username: string;
  email: string;
  active: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  active: boolean;
  roles: string[];
}

export interface UserReadPort {
  findById(id: string): Promise<UserReadModel | null>;
  findByEmail(email: string): Promise<UserReadModel | null>;
  list(): Promise<UserListItem[]>;
}
