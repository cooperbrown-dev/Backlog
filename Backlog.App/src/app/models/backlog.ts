import { BacklogStatus } from "../enums/backlog-status";
import { Category } from "../enums/category";

export interface BacklogItem
{ 
    id: string;
    title: string;
    category: Category;
    status: BacklogStatus;
    createdAt: string;
    rating: number | null;
    note: string | null;
}