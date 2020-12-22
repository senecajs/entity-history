declare const intern: {
    entver_fields: string[];
    canon(msg: any): string;
    history(histspec: any): Promise<void>;
};
export default intern;
