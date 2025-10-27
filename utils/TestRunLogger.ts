import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for test run record
 */
export interface TestRunRecord {
  runTime: string;
  environment: string;
  testSuite: string;
  baseUrl: string;
  headless: boolean;
  browser: string;
  workers?: number;
  command: string;
  timestamp: string;
  status?: 'passed' | 'failed' | 'running';
  exitCode?: number;
  duration?: number;
  totalTests?: number;
  passedTests?: number;
  failedTests?: number;
  skippedTests?: number;
  gitRef?: string;
  gitSha?: string;
  actor?: string;
}

/**
 * TestRunLogger - Utility to log and track test run information
 */
export class TestRunLogger {
  private static readonly LOG_DIR = 'test-results';
  private static readonly HISTORY_FILE = 'test-results/test-run-history.json';

  /**
   * Log a new test run
   */
  static logTestRun(record: TestRunRecord): void {
    try {
      // Ensure test-results directory exists
      if (!fs.existsSync(this.LOG_DIR)) {
        fs.mkdirSync(this.LOG_DIR, { recursive: true });
      }

      // Create run-specific directory
      const runDir = path.join(this.LOG_DIR, record.runTime);
      if (!fs.existsSync(runDir)) {
        fs.mkdirSync(runDir, { recursive: true });
      }

      // Write run info to specific run directory
      const runInfoPath = path.join(runDir, 'run-info.json');
      fs.writeFileSync(runInfoPath, JSON.stringify(record, null, 2), 'utf-8');

      // Update history file
      this.updateHistory(record);

      console.log(`✅ Test run logged: ${record.runTime}`);
    } catch (error) {
      console.error('❌ Failed to log test run:', error);
    }
  }

  /**
   * Update test run with results
   */
  static updateTestRun(
    runTime: string,
    updates: Partial<TestRunRecord>
  ): void {
    try {
      const runDir = path.join(this.LOG_DIR, runTime);
      const runInfoPath = path.join(runDir, 'run-info.json');

      if (!fs.existsSync(runInfoPath)) {
        console.warn(`⚠️  Run info not found for: ${runTime}`);
        return;
      }

      // Read existing record
      const existingRecord: TestRunRecord = JSON.parse(
        fs.readFileSync(runInfoPath, 'utf-8')
      );

      // Merge updates
      const updatedRecord: TestRunRecord = {
        ...existingRecord,
        ...updates,
      };

      // Write updated record
      fs.writeFileSync(
        runInfoPath,
        JSON.stringify(updatedRecord, null, 2),
        'utf-8'
      );

      // Update history
      this.updateHistory(updatedRecord);

      console.log(`✅ Test run updated: ${runTime}`);
    } catch (error) {
      console.error('❌ Failed to update test run:', error);
    }
  }

  /**
   * Get test run record
   */
  static getTestRun(runTime: string): TestRunRecord | null {
    try {
      const runInfoPath = path.join(this.LOG_DIR, runTime, 'run-info.json');
      
      if (!fs.existsSync(runInfoPath)) {
        return null;
      }

      return JSON.parse(fs.readFileSync(runInfoPath, 'utf-8'));
    } catch (error) {
      console.error('❌ Failed to get test run:', error);
      return null;
    }
  }

  /**
   * Get all test run history
   */
  static getHistory(): TestRunRecord[] {
    try {
      if (!fs.existsSync(this.HISTORY_FILE)) {
        return [];
      }

      return JSON.parse(fs.readFileSync(this.HISTORY_FILE, 'utf-8'));
    } catch (error) {
      console.error('❌ Failed to get test run history:', error);
      return [];
    }
  }

  /**
   * Update history file with new or updated record
   */
  private static updateHistory(record: TestRunRecord): void {
    try {
      let history: TestRunRecord[] = [];
      
      if (fs.existsSync(this.HISTORY_FILE)) {
        history = JSON.parse(fs.readFileSync(this.HISTORY_FILE, 'utf-8'));
      }

      // Check if record already exists
      const existingIndex = history.findIndex(r => r.runTime === record.runTime);
      
      if (existingIndex >= 0) {
        // Update existing record
        history[existingIndex] = record;
      } else {
        // Add new record
        history.push(record);
      }

      // Sort by timestamp (newest first)
      history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Keep only last 100 records
      if (history.length > 100) {
        history = history.slice(0, 100);
      }

      // Write updated history
      fs.writeFileSync(
        this.HISTORY_FILE,
        JSON.stringify(history, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('❌ Failed to update history:', error);
    }
  }

  /**
   * Generate summary report
   */
  static generateSummary(): void {
    try {
      const history = this.getHistory();
      
      if (history.length === 0) {
        console.log('No test run history found.');
        return;
      }

      console.log('\n📊 Test Run Summary\n');
      console.log('='.repeat(80));
      
      // Overall statistics
      const totalRuns = history.length;
      const passedRuns = history.filter(r => r.status === 'passed').length;
      const failedRuns = history.filter(r => r.status === 'failed').length;
      const passRate = ((passedRuns / totalRuns) * 100).toFixed(2);

      console.log(`\nTotal Runs: ${totalRuns}`);
      console.log(`Passed: ${passedRuns} (${passRate}%)`);
      console.log(`Failed: ${failedRuns}`);
      
      // Recent runs
      console.log('\n📋 Recent Test Runs:\n');
      const recentRuns = history.slice(0, 10);
      
      recentRuns.forEach((run, index) => {
        const status = run.status === 'passed' ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${run.runTime} - ${run.testSuite} (${run.environment})`);
      });

      console.log('\n' + '='.repeat(80) + '\n');
    } catch (error) {
      console.error('❌ Failed to generate summary:', error);
    }
  }

  /**
   * Clean up old test results
   */
  static cleanup(daysToKeep: number = 30): void {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const history = this.getHistory();
      const itemsToDelete: string[] = [];

      history.forEach(record => {
        const recordDate = new Date(record.timestamp);
        if (recordDate < cutoffDate) {
          itemsToDelete.push(record.runTime);
        }
      });

      // Delete old run directories
      itemsToDelete.forEach(runTime => {
        const runDir = path.join(this.LOG_DIR, runTime);
        if (fs.existsSync(runDir)) {
          fs.rmSync(runDir, { recursive: true, force: true });
          console.log(`🗑️  Deleted old test run: ${runTime}`);
        }
      });

      // Update history to remove deleted records
      const updatedHistory = history.filter(
        r => !itemsToDelete.includes(r.runTime)
      );
      fs.writeFileSync(
        this.HISTORY_FILE,
        JSON.stringify(updatedHistory, null, 2),
        'utf-8'
      );

      console.log(`✅ Cleaned up ${itemsToDelete.length} old test runs`);
    } catch (error) {
      console.error('❌ Failed to cleanup:', error);
    }
  }
}

// Export for use in tests
export default TestRunLogger;
