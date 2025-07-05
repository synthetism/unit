/**
 * Timer Unit - Simple, Pure, Composable Timing Operations
 * 
 * A minimal timer unit that demonstrates the Unit pattern
 * with performance measurement and scheduling capabilities.
 */

export interface TimerResult {
  duration: number;
  laps: number[];
  startTime: number;
  endTime?: number;
}

export class Timer {
  private startTime: number | null = null;
  private endTime: number | null = null;
  private laps: number[] = [];
  private label: string;

  constructor(label = 'Timer') {
    this.label = label;
  }

  /**
   * Create a new Timer unit
   */
  static create(label = 'Timer'): Timer {
    return new Timer(label);
  }

  /**
   * Start the timer
   */
  start(): Timer {
    this.startTime = performance.now();
    this.endTime = null;
    this.laps = [];
    return this;
  }

  /**
   * Record a lap time
   */
  lap(lapLabel?: string): number {
    if (!this.startTime) {
      throw new Error('Timer not started');
    }
    
    const lapTime = performance.now() - this.startTime;
    this.laps.push(lapTime);
    
    if (lapLabel) {
      console.log(`⏱️ ${this.label} - ${lapLabel}: ${lapTime.toFixed(2)}ms`);
    }
    
    return lapTime;
  }

  /**
   * Stop the timer and get final time
   */
  stop(): number {
    if (!this.startTime) {
      throw new Error('Timer not started');
    }
    
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;
    
    console.log(`🏁 ${this.label} finished: ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Get current elapsed time (without stopping)
   */
  elapsed(): number {
    if (!this.startTime) {
      return 0;
    }
    
    return performance.now() - this.startTime;
  }

  /**
   * Reset the timer
   */
  reset(): Timer {
    this.startTime = null;
    this.endTime = null;
    this.laps = [];
    return this;
  }

  /**
   * Time a function execution
   */
  async time<T>(fn: () => Promise<T> | T, fnLabel?: string): Promise<{ result: T; duration: number }> {
    const label = fnLabel || 'function';
    this.start();
    
    try {
      const result = await fn();
      const duration = this.stop();
      
      console.log(`⚡ ${this.label} - ${label}: ${duration.toFixed(2)}ms`);
      
      return { result, duration };
    } catch (error) {
      this.stop();
      throw error;
    }
  }

  /**
   * Create a delay (async sleep)
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Measure function performance multiple times
   */
  async benchmark<T>(
    fn: () => Promise<T> | T, 
    iterations = 10, 
    warmup = 3
  ): Promise<{ 
    average: number; 
    min: number; 
    max: number; 
    results: number[] 
  }> {
    const results: number[] = [];
    
    // Warmup runs
    console.log(`🔥 Warming up (${warmup} runs)...`);
    for (let i = 0; i < warmup; i++) {
      await fn();
    }
    
    // Actual benchmark runs
    console.log(`📊 Benchmarking (${iterations} runs)...`);
    for (let i = 0; i < iterations; i++) {
      const { duration } = await this.time(fn, `Run ${i + 1}`);
      results.push(duration);
    }
    
    const average = results.reduce((sum, time) => sum + time, 0) / results.length;
    const min = Math.min(...results);
    const max = Math.max(...results);
    
    console.log('📈 Benchmark results:');
    console.log(`   Average: ${average.toFixed(2)}ms`);
    console.log(`   Min: ${min.toFixed(2)}ms`);
    console.log(`   Max: ${max.toFixed(2)}ms`);
    
    return { average, min, max, results };
  }

  /**
   * Consume another timer (merge results)
   */
  consume(other: Timer): Timer {
    this.laps.push(...other.laps);
    return this;
  }

  /**
   * Get timer results
   */
  getResults(): TimerResult {
    if (!this.startTime) {
      throw new Error('Timer not started');
    }
    
    return {
      duration: this.endTime ? this.endTime - this.startTime : this.elapsed(),
      laps: [...this.laps],
      startTime: this.startTime,
      endTime: this.endTime || undefined
    };
  }

  /**
   * Get current capabilities
   */
  get capabilities(): string[] {
    const caps = ['start', 'stop', 'lap', 'elapsed', 'time', 'benchmark', 'reset', 'consume'];
    caps.push(`label: ${this.label}`);
    if (this.startTime) {
      caps.push('running');
    }
    caps.push(`laps: ${this.laps.length}`);
    return caps;
  }

  /**
   * Export to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      type: 'Timer',
      version: '1.0.0',
      label: this.label,
      startTime: this.startTime,
      endTime: this.endTime,
      laps: this.laps
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: Record<string, unknown>): Timer {
    const timer = new Timer(json.label as string);
    timer.startTime = json.startTime as number;
    timer.endTime = json.endTime as number;
    timer.laps = json.laps as number[];
    return timer;
  }

  /**
   * Show help information
   */
  help(): void {
    console.log('\n=== Timer Unit v1.0.0 ===');
    console.log('I can measure time, performance, and create delays.\n');
    
    console.log('🛠️ Available Methods:');
    console.log('  start()                     // Start timer');
    console.log('  stop()                      // Stop and get duration');
    console.log('  lap(label?)                 // Record lap time');
    console.log('  elapsed()                   // Get current elapsed time');
    console.log('  time(fn, label?)            // Time function execution');
    console.log('  benchmark(fn, iterations)   // Benchmark function');
    console.log('  reset()                     // Reset timer');
    console.log('  consume(timer)              // Merge with another timer');
    
    console.log('\n⏰ Static Methods:');
    console.log('  Timer.sleep(ms)             // Async delay');
    
    console.log('\n📊 Current State:');
    console.log(`  Label: ${this.label}`);
    console.log(`  Running: ${!!this.startTime}`);
    console.log(`  Laps: ${this.laps.length}`);
    if (this.startTime) {
      console.log(`  Elapsed: ${this.elapsed().toFixed(2)}ms`);
    }
    console.log(`  Capabilities: ${this.capabilities.join(', ')}`);
    
    console.log('\n📖 Usage Examples:');
    console.log('  const t = Timer.create("My Timer");');
    console.log('  t.start().lap("checkpoint").stop();');
    console.log('  const { result, duration } = await t.time(myFunction);');
    console.log('  await Timer.sleep(1000); // 1 second delay');
    
    console.log('\n💡 Unit Features:');
    console.log('  • High-precision timing');
    console.log('  • Function performance measurement');
    console.log('  • Benchmarking capabilities');
    console.log('  • Composable with other units');
    console.log();
  }

  /**
   * Static help
   */
  static help(): void {
    console.log('\n=== Timer Unit v1.0.0 ===');
    console.log('I can measure time, performance, and create delays.\n');
    
    console.log('🏗️ Creation:');
    console.log('  Timer.create()              // Default timer');
    console.log('  Timer.create("My Timer")    // Named timer');
    
    console.log('\n🛠️ Core Methods:');
    console.log('  start() → lap() → stop()    // Basic timing');
    console.log('  time(function)              // Time function');
    console.log('  benchmark(function)         // Performance test');
    console.log('  Timer.sleep(ms)             // Async delay');
    
    console.log('\n💡 Unit Pattern:');
    console.log('  • High-precision timing');
    console.log('  • Chainable operations');
    console.log('  • Performance measurement');
    console.log();
  }
}

// Pure function exports
export async function sleep(ms: number): Promise<void> {
  return Timer.sleep(ms);
}

export async function timeFunction<T>(fn: () => Promise<T> | T, label?: string): Promise<{ result: T; duration: number }> {
  return Timer.create().time(fn, label);
}

export function measure<T>(fn: () => T): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
}
