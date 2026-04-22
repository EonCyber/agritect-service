export interface CropListItem {
  id: string;
  name: string;
}

export interface CropReadPort {
  list(): Promise<CropListItem[]>;
}
