// scripts/send-test-report-email.ts
// Script to send Playwright test results email after CI run

import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { buildEmailSubject, buildEmailBody, TestSummary } from '../utils/emailReport';

/**
 * Reads test run info and results, and builds a summary for email reporting.
 * @param runInfoPath Path to run-info.json
 * @param resultsPath Path to results.json
 */
function getTestSummary(runInfoPath: string, resultsPath: string): TestSummary {
  const runInfo = JSON.parse(fs.readFileSync(runInfoPath, 'utf-8'));
  let total = 0, passed = 0, failed = 0, skipped = 0;
  let testCases = [];
  if (fs.existsSync(resultsPath)) {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    total = results.stats?.totalTests || 0;
    passed = results.stats?.passed || 0;
    failed = results.stats?.failed || 0;
    skipped = results.stats?.skipped || 0;
    testCases = results.testCases || [];
  } else if (runInfo.status === 'skipped') {
    skipped = 1;
    total = 0;
  }
  // Parse runTime in format 'YYYY-MM-DDTHH-MM-SS' or 'YYYY-MM-DD HH:MM:SS'
  let executionDate: Date;
  if (runInfo.runTime) {
    // Try ISO format first
    executionDate = new Date(runInfo.runTime.replace('T', ' ').replace(/-/g, '/'));
    if (isNaN(executionDate.getTime())) {
      // Try fallback
      executionDate = new Date(runInfo.timestamp);
    }
  } else {
    executionDate = new Date();
  }
  return {
    total,
    passed,
    failed,
    skipped,
    executionDate,
    reportUrl: process.env.REPORT_URL || '',
    testCases
  };
}


/**
 * Sends the test summary email to the provided recipients.
 * @param summary Test summary object
 * @param recipients Array of email addresses
 */
async function sendEmail(summary: TestSummary, recipients: string[]) {
  const subject = buildEmailSubject(summary.executionDate);
  const body = buildEmailBody(summary);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  // Basic email validation
  const validRecipients = recipients.filter(email => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));
  if (validRecipients.length === 0) throw new Error('No valid email recipients found.');
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: validRecipients.join(','),
    subject,
    html: body
  });
}


/**
 * Main entry point for the email report script.
 * Reads environment variables, validates input, and sends the report email.
 */
function main() {
  const runInfoPath = process.env.RUN_INFO_PATH || '';
  const resultsPath = process.env.RESULTS_PATH || '';
  // Support multiple emails separated by ';' for EMAIL_RECIPIENTS
  const recipientsRaw = process.env.EMAIL_RECIPIENTS || process.env.EMAILS_RECEIVED_NOTIFICATION || '';
  const recipients = recipientsRaw.split(';').map(r => r.trim()).filter(Boolean);
  if (!runInfoPath || !fs.existsSync(runInfoPath)) throw new Error('run-info.json not found');
  if (recipients.length === 0) throw new Error('No email recipients specified in EMAIL_RECIPIENTS');
  let summary: TestSummary;
  try {
    summary = getTestSummary(runInfoPath, resultsPath);
  } catch (err) {
    console.error('Error parsing test summary:', err);
    process.exit(1);
  }
  sendEmail(summary, recipients).then(() => {
    console.log('Test report email sent successfully');
  }).catch(err => {
    console.error('Failed to send test report email:', err);
    process.exit(1);
  });
}

if (require.main === module) {
  main();
}
