export declare function make_cmd_save_history_msg(options: any): (msg: {
    ent: {
        id: null | string;
        entity$: string;
        load$: any;
        custom$: any;
        history$: {
            wait: boolean;
        };
    };
}, meta: any) => Promise<any>;
