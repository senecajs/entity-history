export declare function entity_history_msg(msg: {
    ent: {
        id: string;
        base: string;
        name: string;
        canon$: any;
    };
    size: number;
    diff: {
        ver_id: string;
        ents: boolean;
    };
}): Promise<{
    ok: boolean;
    items: never[];
    changed: any[];
}>;
