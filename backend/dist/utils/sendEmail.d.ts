interface EmailOptions {
    email: string;
    subject: string;
    message: string;
}
/**
 * 发送电子邮件
 * @param {Object} options - 邮件选项
 */
declare const sendEmail: (options: EmailOptions) => Promise<any>;
export default sendEmail;
//# sourceMappingURL=sendEmail.d.ts.map