import { Category } from "../enums/category";

export interface CreateBacklogItemRequest
{
    title: string;
    category: Category;
}