// Type definitions for FTfixer

declare module '@aaronxyliu/ftfixer' {
    export function before_cmd(driver: object): null
    export function before_cmd_cy(driver: object): null
    export function after_cmd(driver: object, filename: string, start_line: number, start_col: number, sentence: string): null
    export function after_cmd_cy(driver: object, filename: string, start_line: number, start_col: number, sentence: string): null
}