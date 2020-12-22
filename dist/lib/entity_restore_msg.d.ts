export declare function entity_restore_msg(msg: {
    ent: {
        id?: string;
        ent_id?: string;
        ver_id: string;
        base: string;
        name: string;
    };
}): Promise<{
    ok: boolean;
    item: {};
}>;
