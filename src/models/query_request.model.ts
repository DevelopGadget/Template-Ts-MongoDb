export default interface QueryRequest {
    req: any, 
    query?: any;
    subReq?: any;
    callback: (validation: any) => boolean; 
    opt?: any;
    optionalParamaters?: string;
}