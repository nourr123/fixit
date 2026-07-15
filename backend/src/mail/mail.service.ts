import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    const gmailUser = this.config.get<string>('GMAIL_USER');
    const gmailAppPassword = this.config.get<string>('GMAIL_APP_PASSWORD');

    this.fromAddress = gmailUser ?? '';
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });
  }

  async sendTicketStatusUpdate(params: {
    to: string;
    tenantName: string;
    ticketId: number;
    description: string;
    newStatus: string;
  }) {
    const { to, tenantName, ticketId, description, newStatus } = params;

    const statusColor =
      newStatus === 'Resolved' ? '#4C7A5B' : newStatus === 'In Progress' ? '#C68A1F' : '#2C4A7C';

    try {
      const info = await this.transporter.sendMail({
        from: `FixIt <${this.fromAddress}>`,
        to,
        subject: `Your ticket #${ticketId} is now "${newStatus}"`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #23282E;">Hi ${tenantName},</h2>
            <p style="color: #2F4858; font-size: 14px; line-height: 1.6;">
              The status of your reported issue has just been updated.
            </p>
            <div style="border: 1px solid #D8D2C4; border-radius: 4px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; color: #8A8478; font-size: 12px;">Ticket #${ticketId}</p>
              <p style="margin: 0 0 12px 0; color: #23282E; font-size: 14px;">${description}</p>
              <span style="display: inline-block; background: ${statusColor}; color: #fff; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 12px;">
                ${newStatus}
              </span>
            </div>
            <p style="color: #8A8478; font-size: 12px;">— The FixIt team</p>
          </div>
        `,
      });

      this.logger.log(`Email sent to ${to} for ticket #${ticketId} (messageId: ${info.messageId})`);
      return info;
    } catch (error) {
      // Never let an email failure break the status update itself
      this.logger.error(`Failed to send status email to ${to} for ticket #${ticketId}`, error);
      return null;
    }
  }
}