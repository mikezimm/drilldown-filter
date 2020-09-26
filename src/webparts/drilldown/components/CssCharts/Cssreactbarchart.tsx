import * as React from 'react';
import styles from './Cssreactbarchart.module.scss';
import { ICssreactbarchartProps, ICssreactbarchartState } from './ICssreactbarchartProps';

import { getRandomInt, getRandomFromArray, generateVals, generateTitles, randomDate, getRandomChance } from '../../../../services/randomServices';
import { sortKeysByOtherKey, convertNumberArrayToRelativePercents } from '../../../../services/arrayServices';

import { ICSSChartSeries, ICSSChartTypes, CSSChartTypes, ISeriesSort } from '../IReUsableInterfaces';

import stylesC from './cssChart.module.scss';

import { ColorsBlue, ColorsBrown, ColorsGray, ColorsGreen, ColorsRed } from '../../../../services/colorServices';

/***
 *    d888888b d8b   db d888888b d88888b d8888b. d88888b  .d8b.   .o88b. d88888b .d8888. 
 *      `88'   888o  88 `~~88~~' 88'     88  `8D 88'     d8' `8b d8P  Y8 88'     88'  YP 
 *       88    88V8o 88    88    88ooooo 88oobY' 88ooo   88ooo88 8P      88ooooo `8bo.   
 *       88    88 V8o88    88    88~~~~~ 88`8b   88~~~   88~~~88 8b      88~~~~~   `Y8b. 
 *      .88.   88  V888    88    88.     88 `88. 88      88   88 Y8b  d8 88.     db   8D 
 *    Y888888P VP   V8P    YP    Y88888P 88   YD YP      YP   YP  `Y88P' Y88888P `8888Y' 
 *                                                                                       
 *                                                                                       
 */

export interface ISimpleData {
  title: string;
  value: number;
  perc: number;
}


/***
 *    d88888b db    db d8b   db  .o88b. d888888b d888888b  .d88b.  d8b   db .d8888. 
 *    88'     88    88 888o  88 d8P  Y8 `~~88~~'   `88'   .8P  Y8. 888o  88 88'  YP 
 *    88ooo   88    88 88V8o 88 8P         88       88    88    88 88V8o 88 `8bo.   
 *    88~~~   88    88 88 V8o88 8b         88       88    88    88 88 V8o88   `Y8b. 
 *    88      88b  d88 88  V888 Y8b  d8    88      .88.   `8b  d8' 88  V888 db   8D 
 *    YP      ~Y8888P' VP   V8P  `Y88P'    YP    Y888888P  `Y88P'  VP   V8P `8888Y' 
 *                                                                                  
 *                                                                                  
 */
// makeChartData ,


export function makeChartData( qty: number, label: string, chartTypes : ICSSChartTypes[] = [] ) {

  let randomNums = generateVals( qty, 35, 90 );
  let randomTitles = generateTitles( label, qty );
  const arrSum = randomNums.reduce((a,b) => a + b, 0);
  let percents = randomNums.map( v => { return (v / arrSum * 100 ) ; });

  if ( chartTypes === [] ) { chartTypes = CSSChartTypes; }

  let chartData: ICSSChartSeries = {
    title: label,
    activeType: getRandomInt( 0,CSSChartTypes.length -1 ),
    chartTypes: chartTypes,
    labels: randomTitles,
    val1: randomNums,
    percents: percents,
    sum: arrSum,
  };

  return chartData;

}

/***
 *     .o88b. db       .d8b.  .d8888. .d8888. 
 *    d8P  Y8 88      d8' `8b 88'  YP 88'  YP 
 *    8P      88      88ooo88 `8bo.   `8bo.   
 *    8b      88      88~~~88   `Y8b.   `Y8b. 
 *    Y8b  d8 88booo. 88   88 db   8D db   8D 
 *     `Y88P' Y88888P YP   YP `8888Y' `8888Y' 
 *                                            
 *                                            
 */


const barValueAsPercentDef : boolean = false;
const heightDef: number | string = "50px"; //This would be horizonal bar height... one horizontal layer
const barValuesDef: 'val1' | 'sums' | 'avgs' | 'percents' = 'val1';
const titleLocationDef: 'top' | 'side' = 'top';
const randomPallets = [ColorsBlue, ColorsBrown, ColorsGray, ColorsGreen, ColorsRed];

export default class Cssreactbarchart extends React.Component<ICssreactbarchartProps, ICssreactbarchartState> {

  public constructor(props:ICssreactbarchartProps){
    super(props);

    let chartData : ICSSChartSeries[] = [] ;

    if ( this.props.chartData && this.props.chartData.length > 0 ) {
      this.props.chartData.map( cd => {
        chartData.push( JSON.parse( JSON.stringify( cd ) ) ) ;
      });
      //set activeType
      chartData.map( cd => { cd.activeType = 0; });

    } else { 
      chartData.push( makeChartData(getRandomInt(5 , 30), 'Category') ) ;
      chartData.push( makeChartData(getRandomInt(5 , 30), 'Item') ) ;
      chartData.push( makeChartData(getRandomInt(5 , 20), 'Product') ) ;
    }

    let useProps = this.props.chartData !== null && this.props.chartData !== undefined && this.props.chartData.length > 0 ? true : false;

    this.state = { 
      chartData: chartData,
      useProps: useProps,
    };

  }
  
  public componentDidMount() {
    this._updateStateOnPropsChange();
    console.log('Mounted!');
  }


  /***
 *         d8888b. d888888b d8888b.      db    db d8888b. d8888b.  .d8b.  d888888b d88888b 
 *         88  `8D   `88'   88  `8D      88    88 88  `8D 88  `8D d8' `8b `~~88~~' 88'     
 *         88   88    88    88   88      88    88 88oodD' 88   88 88ooo88    88    88ooooo 
 *         88   88    88    88   88      88    88 88~~~   88   88 88~~~88    88    88~~~~~ 
 *         88  .8D   .88.   88  .8D      88b  d88 88      88  .8D 88   88    88    88.     
 *         Y8888D' Y888888P Y8888D'      ~Y8888P' 88      Y8888D' YP   YP    YP    Y88888P 
 *                                                                                         
 *                                                                                         
 */

public componentDidUpdate(prevProps){

    let rebuildPart = false;
    console.log('DIDUPDATE setting chartData:', this.props.chartData);

    if ( JSON.stringify(prevProps.chartData) !== JSON.stringify(this.props.chartData )) {
        rebuildPart = true;
    }
    if (rebuildPart === true) {
      this._updateStateOnPropsChange();
    }
  }

  /***
   *    d8888b. db    db d8888b. db      d888888b  .o88b.      d8888b. d88888b d8b   db d8888b. d88888b d8888b. 
   *    88  `8D 88    88 88  `8D 88        `88'   d8P  Y8      88  `8D 88'     888o  88 88  `8D 88'     88  `8D 
   *    88oodD' 88    88 88oooY' 88         88    8P           88oobY' 88ooooo 88V8o 88 88   88 88ooooo 88oobY' 
   *    88~~~   88    88 88~~~b. 88         88    8b           88`8b   88~~~~~ 88 V8o88 88   88 88~~~~~ 88`8b   
   *    88      88b  d88 88   8D 88booo.   .88.   Y8b  d8      88 `88. 88.     88  V888 88  .8D 88.     88 `88. 
   *    88      ~Y8888P' Y8888P' Y88888P Y888888P  `Y88P'      88   YD Y88888P VP   V8P Y8888D' Y88888P 88   YD 
   *                                                                                                            
   *                                                                                                            
   */

  public render(): React.ReactElement<ICssreactbarchartProps> {

    /***
 *    .d8888.  .d8b.  .88b  d88. d8888b. db      d88888b      d8888b.  .d8b.  d888888b  .d8b.  
 *    88'  YP d8' `8b 88'YbdP`88 88  `8D 88      88'          88  `8D d8' `8b `~~88~~' d8' `8b 
 *    `8bo.   88ooo88 88  88  88 88oodD' 88      88ooooo      88   88 88ooo88    88    88ooo88 
 *      `Y8b. 88~~~88 88  88  88 88~~~   88      88~~~~~      88   88 88~~~88    88    88~~~88 
 *    db   8D 88   88 88  88  88 88      88booo. 88.          88  .8D 88   88    88    88   88 
 *    `8888Y' YP   YP YP  YP  YP 88      Y88888P Y88888P      Y8888D' YP   YP    YP    YP   YP 
 *                                                                                             
 *                                                                                             
 */

    // Styles & Chart code for chart compliments of:  https://codepen.io/richardramsay/pen/ZKmQJv?editors=1010

    let chartData: ICSSChartSeries[] = this.state.chartData;

    /***
     *    db       .d88b.   .d88b.  d8888b.       .o88b. db   db  .d8b.  d8888b. d888888b .d8888. 
     *    88      .8P  Y8. .8P  Y8. 88  `8D      d8P  Y8 88   88 d8' `8b 88  `8D `~~88~~' 88'  YP 
     *    88      88    88 88    88 88oodD'      8P      88ooo88 88ooo88 88oobY'    88    `8bo.   
     *    88      88    88 88    88 88~~~        8b      88~~~88 88~~~88 88`8b      88      `Y8b. 
     *    88booo. `8b  d8' `8b  d8' 88           Y8b  d8 88   88 88   88 88 `88.    88    db   8D 
     *    Y88888P  `Y88P'   `Y88P'  88            `Y88P' YP   YP YP   YP 88   YD    YP    `8888Y' 
     *                                                                                            
     *                                                                                            
     */

    let chartIdx = -1;
    let charts = chartData.map( cdO => {
      chartIdx ++ ;
      let selectedChartID = chartIdx.toString();

      //2020-09-24:  Added this because the value array was getting mysteriously overwritten to nulls all the time.
      cdO[cdO.barValues] = JSON.parse(JSON.stringify(cdO[cdO.barValues]));
      cdO.percents = convertNumberArrayToRelativePercents(cdO[cdO.barValues]);

      let sortOrder : ISeriesSort = 'asis';
      let stacked : boolean = null;
      let sortKey : ISeriesSort = null;
      let barValues : string = cdO.barValues;

      if ( this.state.useProps !== true ) {

      }
      
      let activeChartType = cdO.chartTypes[cdO.activeType] ;
      if ( activeChartType === 'pareto-asc' ) {
        sortOrder = 'asc' ;
        sortKey = barValues;
        stacked = false;

      } else if ( activeChartType === 'pareto-dec' ) {
        sortOrder = 'dec' ;
        sortKey = barValues;
        stacked = false;

      } else if ( activeChartType === 'pareto-labels' ) {
        sortOrder = 'asc' ;
        sortKey = 'labels';
        stacked = false;

      } else if ( activeChartType === 'stacked-column-asc' ) {
        sortOrder = 'asc' ;
        sortKey = barValues;
        stacked = true;

      } else if ( activeChartType === 'stacked-column-dec' ) {
        sortOrder = 'dec' ;
        sortKey = barValues;
        stacked = true;

      } else if ( activeChartType === 'stacked-column-labels' ) {
        sortOrder = 'asc' ;
        sortKey = 'labels';
        stacked = true;

      }


      /***
       *    .d8888. d888888b db    db db      d88888b      d888888b d8b   db d888888b d888888b d888888b  .d8b.  db      d888888b d88888D  .d8b.  d888888b d888888b  .d88b.  d8b   db 
       *    88'  YP `~~88~~' `8b  d8' 88      88'            `88'   888o  88   `88'   `~~88~~'   `88'   d8' `8b 88        `88'   YP  d8' d8' `8b `~~88~~'   `88'   .8P  Y8. 888o  88 
       *    `8bo.      88     `8bd8'  88      88ooooo         88    88V8o 88    88       88       88    88ooo88 88         88       d8'  88ooo88    88       88    88    88 88V8o 88 
       *      `Y8b.    88       88    88      88~~~~~         88    88 V8o88    88       88       88    88~~~88 88         88      d8'   88~~~88    88       88    88    88 88 V8o88 
       *    db   8D    88       88    88booo. 88.            .88.   88  V888   .88.      88      .88.   88   88 88booo.   .88.    d8' db 88   88    88      .88.   `8b  d8' 88  V888 
       *    `8888Y'    YP       YP    Y88888P Y88888P      Y888888P VP   V8P Y888888P    YP    Y888888P YP   YP Y88888P Y888888P d88888P YP   YP    YP    Y888888P  `Y88P'  VP   V8P 
       *                                                                                                                                                                             
       *                                                                                                                                                                             
       */

      
      let stylesChart = cdO.stylesChart ? cdO.stylesChart : null;
      let stylesRow = cdO.stylesRow ? cdO.stylesRow : null;
      let stylesTitle = cdO.stylesTitle ? cdO.stylesTitle : null;
      let stylesBlock = cdO.stylesBlock ? cdO.stylesBlock : null;
      let stylesLabel = cdO.stylesLabel ? cdO.stylesLabel : null;
      let stylesValue = cdO.stylesValue ? cdO.stylesValue : null;

      /**
       * Set chart defaults
       */

//      let sortOrder = this.state.useProps === true && cdO.sortOrder !== undefined ? cdO.sortOrder : getRandomFromArray([false,'asc','dec']);
      let barValueAsPercent = this.state.useProps === true && cdO.barValueAsPercent !== undefined ? cdO.barValueAsPercent : getRandomFromArray([true,false]);
      let height = this.state.useProps === true && cdO.height ? cdO.height : heightDef;
      let titleLocation = this.state.useProps === true && cdO.titleLocation ? cdO.titleLocation : titleLocationDef;
      let stateHeight = stacked === false ? "40px" : height;
      let randomPallet = getRandomFromArray(randomPallets);
      let randomizeColors = this.state.useProps === true && cdO.barColors ? false : true ;

      if ( stacked === false && cdO[barValues].length > 15 ) { stateHeight = '20px'; }
      else if ( stacked === false && cdO[barValues].length > 8 ) { stateHeight = '30px'; }
      else { stateHeight = '40px'; }

      let cd : ICSSChartSeries = null;

      if ( sortOrder !== 'asis' ) {
        let otherKeysToSort = ['labels', barValues];
        if ( cdO.percents !== undefined ) { otherKeysToSort.push('percents') ; }
        cd = sortKeysByOtherKey( cdO, sortKey, sortOrder, 'number', otherKeysToSort );
      } else {
        cd = cdO;
      }

      let chartValueArray = cd[barValues];

      let thisChart : any[] = [];
      let maxNumber: number = Math.max( ...chartValueArray );  //Need to use ... spread in math operators:  https://stackoverflow.com/a/1669222
      let minNumber: number = Math.min( ...chartValueArray );  //Need to use ... spread in math operators:  https://stackoverflow.com/a/1669222

      let chartRange = maxNumber - minNumber;
      let leftEdgeValue = Math.floor( minNumber - chartRange * .1 );
      if ( leftEdgeValue < 0 && minNumber >= 1 ) { leftEdgeValue = 0 ; } //Set to zero if it's close to 
      let rightEdgeValue = maxNumber;

      let scaleNote = 'Scale: '  + leftEdgeValue + ' to ' + rightEdgeValue;

      let scaleNoteEle = <div style= {{ paddingBottom: 10, paddingTop: 10, fontWeight: 600 , fontSize: 'smaller' }} title={ scaleNote} > { scaleNote }</div>;

//      console.log('chartData after: cd', cd );
//      console.log('chartData minNumber, maxNumber:', minNumber, maxNumber );
//     console.log('chartData range:', leftEdgeValue, rightEdgeValue, chartRange );
      /***
       *    .88b  d88.  .d8b.  db   dD d88888b      d8888b.  .d8b.  d8888b. .d8888. 
       *    88'YbdP`88 d8' `8b 88 ,8P' 88'          88  `8D d8' `8b 88  `8D 88'  YP 
       *    88  88  88 88ooo88 88,8P   88ooooo      88oooY' 88ooo88 88oobY' `8bo.   
       *    88  88  88 88~~~88 88`8b   88~~~~~      88~~~b. 88~~~88 88`8b     `Y8b. 
       *    88  88  88 88   88 88 `88. 88.          88   8D 88   88 88 `88. db   8D 
       *    YP  YP  YP YP   YP YP   YD Y88888P      Y8888P' YP   YP 88   YD `8888Y' 
       *                                                                            
       *                                                                            
       */

      let barCount = 0;
      for ( let i in chartValueArray ){
        barCount ++;
        let blockStyle : any = stylesBlock != null ? stylesBlock : {} ;
        blockStyle.height = stateHeight;
        blockStyle.width = ( cd.percents[i] ) + '%';
        
        if ( randomizeColors && stacked === true ) {
          blockStyle.backgroundColor = getRandomFromArray( randomPallet );
          blockStyle.color = 'black';

        } else {
          let cZ : any = ( parseInt(i, 10) ) % randomPallet.length;
          blockStyle.backgroundColor = randomPallet [ cZ ] ;
          blockStyle.color = 'black';

        }

        let valueStyle : any = stylesValue != null ? stylesValue : {} ;
        let barLabel = barValueAsPercent === true ? ( cd.percents[i].toFixed(1) ) + '%' : chartValueArray[i];

        if ( stacked === false ) { 

          if ( stateHeight === '30px' ) {
            valueStyle.top = '7px' ;
            valueStyle.fontSize = 'small';
          }

          if ( stateHeight === '20px' ) {
            valueStyle.top = '1px' ;
            valueStyle.fontSize = 'smaller';
          }

          //This is on scale of 0 to 100
          let barPercent = ( chartValueArray[i] / maxNumber ) * 100;
          //This is adjusting the left side of chart for better perato look
          let scaledBarPercent = 100 * ( chartValueArray[i] - leftEdgeValue ) / ( rightEdgeValue - leftEdgeValue ) ;
          barPercent = scaledBarPercent;

          blockStyle.float = 'none' ;
          blockStyle.width = barPercent + '%';
          barLabel += ' - ' + cd.labels[i];
          blockStyle.whiteSpace = 'nowrap';

          if ( barPercent < 50 ) {
            console.log('chartData barPercent < 50' );
            blockStyle.overflow = 'visible';

            let leftValue = barPercent < 1 ? '7%' : ( 1 + ( 1.2 * barPercent / 100 ) * 100 ) + '%'; 
            valueStyle.left = '20px';
            valueStyle.transform = 'translateX(100%)';
            valueStyle.position = 'relative';
            blockStyle.color = 'black';

          }

        } else { //This is stacked bar loop

            valueStyle.top = '.75em' ;
            valueStyle.fontSize = 'smaller';

        }

//        console.log('chartData valueStyle:', valueStyle );

        thisChart.push(
          <span id= { selectedChartID } onClick={ this.onClick.bind(this) }className={ [stylesC.block, stylesC.innerShadow].join(' ') } style={ blockStyle } title={ cd.labels[i] } >
              <span className={ stylesC.value } style={ valueStyle } >{ barLabel }</span>
          </span>
        ) ;
      }

      if ( stacked === false ) {  thisChart.push( scaleNoteEle ) ; }

      let thisTitleStyle : any = stylesTitle != null ? stylesTitle : {} ;
      thisTitleStyle.lineHeight = '40px';
      thisTitleStyle.fontSize = 18;
      thisTitleStyle.fontWeight = '600';

      let thisRowStyle : any = stylesRow != null ? stylesRow : {} ;
      thisRowStyle.lineHeight = stateHeight;
      thisRowStyle.fontSize = 18;
      thisRowStyle.fontWeight = '600';

      if ( stacked === false ) { 
        thisRowStyle.maxWidth = '450px';
        thisRowStyle.marginBottom = null;
      }
      
      let titleEle = titleLocation === 'side' ?
        <h6 style={ thisTitleStyle }>{ cd.title }</h6> :
        <div style={ thisTitleStyle }>{ cd.title }<span style={{paddingLeft: '15px', fontSize: 'smaller'}}>( { barCount} ) </span></div>;

      return <div className={ stylesC.row } style={ thisRowStyle }>
          { titleEle }
          <div className={ stylesC.chart } style= { stylesChart } >
            { thisChart }
          </div>
        </div>;
    });

    /***
     *    d8888b. d88888b d888888b db    db d8888b. d8b   db 
     *    88  `8D 88'     `~~88~~' 88    88 88  `8D 888o  88 
     *    88oobY' 88ooooo    88    88    88 88oobY' 88V8o 88 
     *    88`8b   88~~~~~    88    88    88 88`8b   88 V8o88 
     *    88 `88. 88.        88    88b  d88 88 `88. 88  V888 
     *    88   YD Y88888P    YP    ~Y8888P' 88   YD VP   V8P 
     *                                                       
     *                                                       
     */
/**
 *          Adding this would add left y-axis title
 *          <div className={ stylesC.yAxis } >
              <h3>Chart Title</h3>
            </div>
 */

    return (
      <div className={ styles.cssreactbarchart } style = {{  }}>
          <figure className={ stylesC.cssChart }>
            <div className={ stylesC.graphic } >
              { charts }
            </div>
          </figure>
      </div>
    );
  }


  private onClick(item) {

        //This sends back the correct pivot category which matches the category on the tile.
        let e: any = event;
        let value = 'TBD';
        let chartIdx = null;
        if ( e.target.innerText != '' ) {
          value = e.target.innerText;   
          chartIdx = e.target.id;
          if ( chartIdx === '' && item.currentTarget ) { chartIdx = item.currentTarget.id; }

        } else if ( item.currentTarget.innerText != '' ){
          value = item.currentTarget.innerText;
          chartIdx = item.currentTarget.id;
          if ( chartIdx === '' && item.target ) { chartIdx = item.target.id; }

        }
    
        console.log('clicked:  ' , chartIdx, value );

        if ( this.state.useProps === true && chartIdx !== null ) {

          let chartData = this.state.chartData;

          console.log('Prev chart type:', chartData[chartIdx].chartTypes[ chartData[chartIdx].activeType ] );

          let chartTypesCount = chartData[chartIdx].chartTypes.length;
          let activeType = chartData[chartIdx].activeType;
          let nextType =  chartTypesCount - 1 === activeType ? 0 : activeType + 1;
          chartData[chartIdx].activeType = nextType;

          console.log('Prev chart type:', chartData[chartIdx].chartTypes[ chartData[chartIdx].activeType ] );
          
          this.setState({
            chartData: chartData,
          });

        }

  }
  /**   This is the legend code:
   *        <div className={ stylesC.xAxis } >
              <h3>X-Axis Title</h3>
              <ul className={ stylesC.legend } >
                <li>Category A</li>
                <li>Category B</li>
                <li>Category C</li>
                <li>Category D</li>
                <li>Category E</li>
                <li>Category F</li>
              </ul>
            </div>
   */

    private _updateStateOnPropsChange(): void {

    }

}


/**
 * 
 *              <div className={ stylesC.row } >
                <h6>Bar Two</h6>
                <div className={ stylesC.chart } >
                  <span className={ stylesC.block} title={ "Category A" } >
                      <span className={ stylesC.value } >29%</span>
                  </span>
                  <span className={ stylesC.block} title={ "Category B" } >
                      <span className={ stylesC.value } >21%</span>
                  </span>
                  <span className={ stylesC.block} title={ "Category C" } >
                      <span className={ stylesC.value } >19%</span>
                  </span>
                  <span className={ stylesC.block} title={ "Category D" } >
                      <span className={ stylesC.value } >6%</span>
                  </span>
                  <span className={ stylesC.block} title={ "Category E" } >
                      <span className={ stylesC.value } >19%</span>
                  </span>
                  <span className={ stylesC.block} title={ "Category F" } >
                      <span className={ stylesC.value } >6%</span>
                  </span>
                </div>
              </div>


 */