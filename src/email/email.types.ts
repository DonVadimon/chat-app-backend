export type ConfirmEmailPayload = {
    email: string;
};
export enum MailType {
    CONFIRM_EMAIL = 'CONFIRM_EMAIL',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}
