export declare function entity_load_msg(msg: {
    ent: {
        id?: string;
        ver_id?: string;
        ent_id?: string;
        base: string;
        name: string;
    };
}): Promise<{
    ok: boolean;
    item: null;
    entver: null;
}>;
