import { ICSSChartSeries, ICSSChartTypes } from '../IReUsableInterfaces';

export interface ICssreactbarchartProps {
  chartData?: ICSSChartSeries[];

}

export interface ICssreactbarchartState {
  chartData?: ICSSChartSeries[];
  useProps: boolean;
  chartKeys: string;
}
