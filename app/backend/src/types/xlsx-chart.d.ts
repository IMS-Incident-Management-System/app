declare module 'xlsx-chart' {
  interface ChartOpts {
    chart?: string;
    titles?: string[];
    fields?: string[];
    data?: Record<string, Record<string, number>>;
    chartTitle?: string;
  }

  interface GenerateOpts {
    charts?: ChartOpts[];
    type?: string;
  }

  interface XLSXChartInstance {
    generate(opts: GenerateOpts, cb: (err: Error | null, data: Buffer) => void): void;
  }

  const XLSXChart: new () => XLSXChartInstance;
  export = XLSXChart;
}
