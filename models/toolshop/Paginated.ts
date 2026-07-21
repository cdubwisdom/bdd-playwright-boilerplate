export interface Paginated<T> {
    current_page: number;
    data: T[];
    total: number;
}