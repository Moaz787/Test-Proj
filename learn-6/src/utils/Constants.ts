export const CURRENT_TIMESTAMP = 'CURRENT_TIMESTAMP(6)';
export const URL = `http://${process.env.NODE_ENV === 'production' ? 'python-mailer:8000' : '127.0.0.1:8000'}/send-email`;
