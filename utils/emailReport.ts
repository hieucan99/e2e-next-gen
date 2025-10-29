// utils/emailReport.ts
// Utility to generate Playwright test result email subject and body

import fs from 'fs';
import glob from 'glob';

/**
 * Summary of Playwright test execution for email reporting.
 */
export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  executionDate: Date;
  reportUrl: string;
  testCases?: Array<{
    name: string;
    suite: string;
    status: string;
  }>;
}

/**
 * Builds the email subject line for test results.
 * @param executionDate Date of test execution
 */
export function buildEmailSubject(executionDate: Date): string {
  if (!executionDate || isNaN(executionDate.getTime())) {
    return 'Playwright Test Results - [Invalid Date]';
  }
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = executionDate.getFullYear();
  const mm = pad(executionDate.getMonth() + 1);
  const dd = pad(executionDate.getDate());
  const hh = pad(executionDate.getHours());
  const min = pad(executionDate.getMinutes());
  return `Playwright Test Results - ${yyyy}-${mm}-${dd}:${hh}:${min}`;
}

/**
 * Builds the HTML body for the test result email.
 * @param summary Test summary object
 */
export function buildEmailBody(summary: TestSummary): string {
  // Inline style constants for maintainability
  const cellStyle = 'padding:6px 12px; border:1px solid #eee;';
  const passColor = 'green';
  const failColor = 'red';
  const skipColor = '#888';
  const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 1000) / 10 : 0;
  const failRate = summary.total > 0 ? Math.round((summary.failed / summary.total) * 1000) / 10 : 0;
  const skipRate = summary.total > 0 ? Math.round((summary.skipped / summary.total) * 1000) / 10 : 0;
  const inProgress = 0; // Placeholder
  const retest = 0; // Placeholder
  // Horizontal bar chart for execution results
  const barChartUrl =
    'https://quickchart.io/chart?c=' +
    encodeURIComponent(JSON.stringify({
      type: 'bar',
      data: {
        labels: ['Passed', 'Failed', 'Skipped', 'In Progress', 'Retest'],
        datasets: [
          {
            label: 'Executions',
            data: [summary.passed, summary.failed, summary.skipped, inProgress, retest],
            backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#2196f3', '#ffc107'],
          },
        ],
      },
      options: {
        legend: { display: false },
        scales: {
          xAxes: [{ stacked: true, display: false }],
          yAxes: [{ stacked: true }],
        },
        plugins: {
          datalabels: {
            display: true,
            color: '#222',
            anchor: 'end',
            align: 'end',
          },
        },
      },
    }));

  // Aggregate all test cases from all results.json files (for matrix runs)
  let allTestCases: Array<{ title: string; ok: boolean }> = [];
  try {
    const resultsFiles = glob.sync('test-results-all/**/results.json');
    resultsFiles.forEach(file => {
      const results = JSON.parse(fs.readFileSync(file, 'utf-8'));
      // Playwright JSON reporter structure
      if (results.suites) {
        results.suites.forEach((suite: any) => {
          suite.suites.forEach((subSuite: any) => {
            subSuite.specs.forEach((spec: any) => {
              allTestCases.push({ title: spec.title, ok: spec.ok });
            });
          });
        });
      }
      // Custom structure fallback
      if (results.testCases) {
        results.testCases.forEach((tc: any) => {
          allTestCases.push({ title: tc.name, ok: tc.status === 'Passed' });
        });
      }
    });
  } catch (err) {
    // Ignore errors, fallback to summary.testCases
    if (summary.testCases && summary.testCases.length > 0) {
      allTestCases = summary.testCases.map(tc => ({ title: tc.name, ok: tc.status === 'Passed' }));
    }
  }

  let resultsSummary = '';
  if (allTestCases.length > 0) {
    resultsSummary = `<h3 style='margin:24px 0 8px 0; font-size:18px;'>Results Summary</h3><pre style='background:#222; color:#fff; padding:12px; border-radius:6px;'><code>`;
    allTestCases.forEach(tc => {
      resultsSummary += JSON.stringify(tc, null, 2) + '\n';
    });
    resultsSummary += '</code></pre>';
  } else {
    resultsSummary = '<p>No test results found.</p>';
  }
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff; max-width:700px; margin:auto; font-family:Arial,sans-serif; border-radius:8px; box-shadow:0 2px 8px #eee;">
      <tr>
        <td style="padding:32px 24px 16px 24px; text-align:left;">
          <h2 style="color:#222; margin:0 0 16px 0; font-size:22px;">Test Execution Report</h2>
          <table style="width:100%; margin-bottom:24px; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 16px; font-weight:bold; color:#222;">Tests with executions</td>
              <td style="padding:8px 16px; font-weight:bold; color:#222;">${summary.total}</td>
              <td style="padding:8px 16px; font-weight:bold; color:#4caf50;">Pass</td>
              <td style="padding:8px 16px; font-weight:bold; color:#4caf50;">${summary.passed}</td>
              <td style="padding:8px 16px; font-weight:bold; color:#f44336;">Fail</td>
              <td style="padding:8px 16px; font-weight:bold; color:#f44336;">${summary.failed}</td>
              <td style="padding:8px 16px; font-weight:bold; color:#2196f3;">In Progress</td>
              <td style="padding:8px 16px; font-weight:bold; color:#2196f3;">0</td>
              <td style="padding:8px 16px; font-weight:bold; color:#ffc107;">Retest</td>
              <td style="padding:8px 16px; font-weight:bold; color:#ffc107;">0</td>
              <td style="padding:8px 16px; font-weight:bold; color:#ff9800;">Skipped</td>
              <td style="padding:8px 16px; font-weight:bold; color:#ff9800;">${summary.skipped}</td>
            </tr>
          </table>
          <img src="${barChartUrl}" alt="Test Execution Results" style="width:100%; max-width:600px; margin-bottom:24px;" />
          ${resultsSummary}
          <p style="margin-top:24px; font-size:16px;">Detailed report: <a href="${summary.reportUrl}" style="color:#1a0dab;">View on GitHub Pages</a></p>
        </td>
      </tr>
    </table>
  `;
}
