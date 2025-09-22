export interface FieldInterface {
    name: string;
    type: string;
    size?: number;
    precision?: number;
    is_null: string | boolean;
    is_unique: string | boolean;
    is_primary: string | boolean;
    is_identity?: string | boolean;
    default_value: string;
}