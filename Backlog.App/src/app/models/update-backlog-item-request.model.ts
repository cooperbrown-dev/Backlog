import { BacklogStatus } from "../enums/backlog-status";

export interface UpdateBacklogItemRequest
{
    status: BacklogStatus;
    rating: number | null;
    note: string | null;
}