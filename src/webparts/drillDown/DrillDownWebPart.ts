import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'DrilldownWebPartStrings';
import DrillDown from './components/Drill/drillComponent';
import { IDrillDownProps } from './components/Drill/drillComponent';

import { PageContext } from '@microsoft/sp-page-context';

import { makeTheTimeObject } from '../../services/dateServices';
import { saveTheTime, getTheCurrentTime, saveAnalytics } from '../../services/createAnalytics';

import { doesObjectExistInArray } from '../../services/arrayServices';

import { getHelpfullError, } from '../../services/ErrorHandler';

import { sp } from '@pnp/sp';

import { propertyPaneBuilder } from '../../services/propPane/PropPaneBuilder';
import { getAllItems } from '../../services/propPane/PropPaneFunctions';


import { IMyProgress, ICustViewDef } from './components/IReUsableInterfaces';

// 2020-09-08:  Add for dynamic data refiners.
import { IDynamicDataCallables, IDynamicDataPropertyDefinition } from '@microsoft/sp-dynamic-data';

import { RefineRuleValues } from './components/IReUsableInterfaces';

import { IGrouping, IViewField } from "@pnp/spfx-controls-react/lib/ListView";


export interface IDrilldownWebPartProps {

  description: string;

  // 0 - Context
  pageContext: PageContext;

  // 1 - Analytics options
  useListAnalytics: boolean;
  analyticsWeb?: string;
  analyticsList?: string;
  stressMultiplier?: number;

  // 2 - Source and destination list information
  createVerifyLists: boolean;
  parentListTitle: string;
  parentListWeb: string;

  refiner0: string;
  refiner1: string;
  refiner2: string;

  rules0def: string;
  rules1def: string;
  rules2def: string;

  rules0: string[];
  rules1: string[];
  rules2: string[];

  showCatCounts: boolean;
  showSummary: boolean;

  stats: string;

  newMap?: any[];

  showDisabled?: boolean;
  updateRefinersOnTextSearch?: boolean;

  parentListFieldTitles: string;

  onlyActiveParents: boolean;

  // 3 - General how accurate do you want this to be

  // 4 - Info Options

  // 5 - UI Defaults

  viewWidth1: number;
  viewWidth2: number;
  viewWidth3: number;

  viewJSON1: string;
  viewJSON2: string;
  viewJSON3: string;

  includeDetails: boolean;

  groupByFields: string;

  // 6 - User Feedback:
  progress: IMyProgress;

  // 7 - TBD

  // 9 - Other web part options
  webPartScenario: string; //DEV, TEAM, CORP
  listDefinition: any; //Picked list defintion :  Title

  advancedPivotStyles: boolean;
  pivotSize: string;
  pivotFormat: string;
  pivotOptions: string;
  pivotTab: string;
}

export default class DrilldownWebPart extends BaseClientSideWebPart<IDrilldownWebPartProps> {


/**
 * 2020-09-08:  Add for dynamic data refiners.
 */
private _selectedRefiner0Name: string;
private _selectedRefiner0Value: string;
private _filterBy: any;



/***
*          .d88b.  d8b   db d888888b d8b   db d888888b d888888b 
*         .8P  Y8. 888o  88   `88'   888o  88   `88'   `~~88~~' 
*         88    88 88V8o 88    88    88V8o 88    88       88    
*         88    88 88 V8o88    88    88 V8o88    88       88    
*         `8b  d8' 88  V888   .88.   88  V888   .88.      88    
*          `Y88P'  VP   V8P Y888888P VP   V8P Y888888P    YP    
*                                                               
*                                                               
*/

  //Added for Get List Data:  https://www.youtube.com/watch?v=b9Ymnicb1kc
  public onInit():Promise<void> {
    return super.onInit().then(_ => {
      
      //2020-09-08:  Add for dynamic data refiners.
      this.context.dynamicDataSourceManager.initializeSource(this);


      // other init code may be present

      let mess = 'onInit - ONINIT: ' + new Date().toLocaleTimeString();

      console.log(mess);

      //https://stackoverflow.com/questions/52010321/sharepoint-online-full-width-page
      if ( window.location.href &&  
        window.location.href.toLowerCase().indexOf("layouts/15/workbench.aspx") > 0 ) {
          
        if (document.getElementById("workbenchPageContent")) {
          document.getElementById("workbenchPageContent").style.maxWidth = "none";
        }
      } 

      this._getListDefintions(true, true);
      //console.log('window.location',window.location);
      sp.setup({
        spfxContext: this.context
      });
    });
  }


  /**
   * 2020-09-08:  Add for dynamic data refiners.   public getPropertyDefinitions():
   * 
   */
  public getPropertyDefinitions(): ReadonlyArray<IDynamicDataPropertyDefinition>{
    return [
      {
        id: 'refiner0Name',
        title: 'Field you are filtering on',
      },
      {
        id: 'refiner0Value',
        title: 'Value you are filtering on',
      },
      {
        id: 'filterBy',
        title: 'Filter by refiner component',
      }
    ];
  }

  /**
   * 2020-09-08:  Add for dynamic data refiners.   public getPropertyValue:
   * @param propertyId 
   */
  public getPropertyValue(propertyId: string): string {
    switch(propertyId) {
      case 'refiner0Name': 
        return this._selectedRefiner0Name;
      case 'refiner0Value':
        return this._selectedRefiner0Value;
      case 'filterBy':
        return this._filterBy;
    }
    throw new Error('Bad property ID');

  }


  public getUrlVars(): {} {
    var vars = {};
    vars = location.search
    .slice(1)
    .split('&')
    .map(p => p.split('='))
    .reduce((obj, pair) => {
      const [key, value] = pair.map(decodeURIComponent);
      return ({ ...obj, [key]: value }) ;
    }, {});
    return vars;
  }

  /**
   * This will just add the same Group By fields to all the views.
   * @param message 
   * @param str 
   * @param grp 
   */
  public getViewFieldsObject(message: string, str: string, grp: string ) {

    let result : IViewField[] = undefined;
    
    if ( str === null || str === undefined ) { return result; }
    try {
      str = str.replace(/\\\"/g,'"').replace(/\\'"/g,"'"); //Replace any cases where I copied the hashed characters from JSON file directly.
      result = JSON.parse(str);

    } catch(e) {
      console.log(message + ' is not a valid JSON object.  Please fix it and re-run');

    }
    
    return result;
  }

  public getViewGroupFields( grp: string ){
      let result: IGrouping[] = [];
      let propsGroups: string[];

      if ( grp ) {
        propsGroups = grp.indexOf(';') > -1 ? grp.split(';') : [grp];
        result = propsGroups.map ( g => {
          return { name: g, order: 1, };
        });
        
      }
      
      return result;
  }

  public render(): void {

    //Be sure to always pass down an actual URL if the webpart prop is empty at this point.
    //If it's undefined, null or '', get current page context value
    let parentWeb = this.properties.parentListWeb && this.properties.parentListWeb != '' ? this.properties.parentListWeb : this.context.pageContext.web.absoluteUrl;

    let refiners: string[] = [];

    if ( this.properties.refiner0 && this.properties.refiner0.length > 0 ) { refiners.push( this.properties.refiner0 ) ;}
    if ( this.properties.refiner1 && this.properties.refiner1.length > 0 ) { refiners.push( this.properties.refiner1 ) ;}
    if ( this.properties.refiner2 && this.properties.refiner2.length > 0 ) { refiners.push( this.properties.refiner2 ) ;}

    let rules1: RefineRuleValues[] = ['parseBySemiColons'];
    let rules2: RefineRuleValues[] = ['parseBySemiColons'];
    let rules3: RefineRuleValues[] = ['groupByMonthsMMM'];

    this.properties.rules0 = [this.properties.rules0def];
    this.properties.rules1 = [this.properties.rules1def];
    this.properties.rules2 = [this.properties.rules2def];

    let rules = [];
    if ( this.properties.rules0 && this.properties.rules0.length > 0 ) { rules.push ( this.properties.rules0 ) ; } else { rules.push( ['']) ; }
    if ( this.properties.rules1 && this.properties.rules1.length > 0 ) { rules.push ( this.properties.rules1) ; } else { rules.push( ['']) ; }
    if ( this.properties.rules2 && this.properties.rules2.length > 0 ) { rules.push ( this.properties.rules2) ; } else { rules.push( ['']) ; }

    let viewDefs : ICustViewDef[] = [];
    let viewFields1 : IViewField[] = this.getViewFieldsObject('Full Size view', this.properties.viewJSON1, this.properties.groupByFields );
    let viewFields2 : IViewField[] = this.getViewFieldsObject('Med Size view', this.properties.viewJSON2, this.properties.groupByFields );
    let viewFields3 : IViewField[] = this.getViewFieldsObject('Small Size view', this.properties.viewJSON3, this.properties.groupByFields );

    let groupByFields: IGrouping[] = this.getViewGroupFields( this.properties.groupByFields);
    if (viewFields1 !== undefined ) { viewDefs.push( { minWidth: this.properties.viewWidth1, viewFields: viewFields1, groupByFields: groupByFields, includeDetails: this.properties.includeDetails }); }
    if (viewFields2 !== undefined ) { viewDefs.push( { minWidth: this.properties.viewWidth2, viewFields: viewFields2, groupByFields: groupByFields, includeDetails: this.properties.includeDetails }); }
    if (viewFields3 !== undefined ) { viewDefs.push( { minWidth: this.properties.viewWidth3, viewFields: viewFields3, groupByFields: groupByFields, includeDetails: this.properties.includeDetails }); }

    console.log('Here are view Defs:', viewDefs );

    let stringRules: string = JSON.stringify( rules );

    //Just for test purposes
    //stringRules = JSON.stringify( [rules1,rules2,rules3] );

    const element: React.ReactElement<IDrillDownProps> = React.createElement(
      DrillDown,
      {
        description: 'this.properties.description',
        
        // 0 - Context
        pageContext: this.context.pageContext,
        wpContext: this.context,
        tenant: this.context.pageContext.web.absoluteUrl.replace(this.context.pageContext.web.serverRelativeUrl,""),
        urlVars: this.getUrlVars(),
        today: makeTheTimeObject(''),
        parentListFieldTitles: this.properties.parentListFieldTitles,

        //Size courtesy of https://www.netwoven.com/2018/11/13/resizing-of-spfx-react-web-parts-in-different-scenarios/
        WebpartElement: this.domElement,

        // 1 - Analytics options
        useListAnalytics: this.properties.useListAnalytics,
        analyticsWeb: strings.analyticsWeb,
        analyticsList: strings.analyticsList,
      
        // 2 - Source and destination list information
        listName: this.properties.parentListTitle,
        webURL: parentWeb,

        refiners: refiners,
        showDisabled: this.properties.showDisabled,
        updateRefinersOnTextSearch: this.properties.updateRefinersOnTextSearch ? this.properties.updateRefinersOnTextSearch : false,

        rules: stringRules,
        stats: this.properties.stats,

        allLoaded: true,

        style: 'commandBar',
        viewDefs: viewDefs,

        // 3 - General how accurate do you want this to be

        // 4 - Info Options

        // 5 - UI Defaults

        // 6 - User Feedback:
        /*
        progress: {
          label: '',
          description: '',
          percentComplete: 0,
          progressHidden: true,
        },
        */
        progress: null,
        // 7 - TBD

        // 9 - Other web part options
        WebpartHeight: this.domElement.getBoundingClientRect().height ,
        WebpartWidth:  this.domElement.getBoundingClientRect().width - 50 ,
  
        pivotSize: this.properties.pivotSize,
        pivotFormat: this.properties.pivotFormat,
        pivotOptions: this.properties.pivotOptions,
        pivotTab: 'Projects', //this.properties.pivotTab (was setTab in pivot-tiles)
        
        onRefiner0Selected: this._handleRefiner0Selected,
      }
    );

    ReactDom.render(element, this.domElement);
  }


  /**
   * 2020-09-08:  Add for dynamic data refiners.   private handleFieldSelected:
   * @param field 
   */
  private _handleRefiner0Selected = ( field: string, value: any ) : void => {
    console.log( '_handleRefiner0Selected:', field, value );
    this._selectedRefiner0Name = field;
    this._selectedRefiner0Value = value;
    this._filterBy = {
      field: field,
      value: value,
    };

    console.log('Main Webpart: Refiners updated: ', field, value);
    this.context.dynamicDataSourceManager.notifyPropertyChanged('refiner0Name');
    this.context.dynamicDataSourceManager.notifyPropertyChanged('refiner0Value');
    this.context.dynamicDataSourceManager.notifyPropertyChanged('filterBy');

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }


  private async UpdateTitles(): Promise<boolean> {

    let listName = this.properties.parentListTitle ? this.properties.parentListTitle : 'ParentListTitle';
    const list = sp.web.lists.getByTitle(listName);
    const r = await list.fields();

    //2020-05-13:  Remove Active since it's replaced with StatusTMT which is not applicable here
    let defFields = ["Title","Author","Editor","Created","Modified"];
    let filterFields=[]; //["SSChoice1","SSChoiceA","MSChoice2","MSChoiceB"];
    if ( this.properties.refiner0 != '' ) { filterFields.push( this.properties.refiner0 ); }
    if ( this.properties.refiner1 != '' ) { filterFields.push( this.properties.refiner1 ); }
    if ( this.properties.refiner2 != '' ) { filterFields.push( this.properties.refiner2 ); }

    let allFields = defFields.concat(filterFields);

    let fieldTitles = r.filter(f => f.Hidden !== true && allFields.indexOf(f.StaticName) > -1).map( 
      f => {return [f.StaticName,f.Title,f.Description,f.Required,f.FieldTypeKind];});
    
    //Update properties here:
    this.properties.parentListFieldTitles = JSON.stringify(fieldTitles);

    console.log('list fields: ', r);
    console.log('fieldTitles: ', fieldTitles);
    
    return true;

  } 


  /***
  *         d8888b. d8888b.  .d88b.  d8888b.      d8888b.  .d8b.  d8b   db d88888b 
  *         88  `8D 88  `8D .8P  Y8. 88  `8D      88  `8D d8' `8b 888o  88 88'     
  *         88oodD' 88oobY' 88    88 88oodD'      88oodD' 88ooo88 88V8o 88 88ooooo 
  *         88~~~   88`8b   88    88 88~~~        88~~~   88~~~88 88 V8o88 88~~~~~ 
  *         88      88 `88. `8b  d8' 88           88      88   88 88  V888 88.     
  *         88      88   YD  `Y88P'  88           88      YP   YP VP   V8P Y88888P 
  *                                                                                
  *                                                                                
  */


  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return propertyPaneBuilder.getPropertyPaneConfiguration(
      this.properties,
      this.UpdateTitles.bind(this),
      this._getListDefintions.bind(this),
      );
  }

  //Promise<IDrillItemInfo[]>
  //was originally:  
  //protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {

  //runAsync is an idea that is not currently being used.
  protected async _getListDefintions(forceUpdate: boolean, runAsync: boolean) {
    /**
     * This section is for Templated properties
     */
    let newMap = [];
    if ( !this.properties.newMap || forceUpdate === true ) { 
      console.log('GETTING LIST DEFINITIONS');
      let configWebURL = this.context.pageContext.site.absoluteUrl;
      configWebURL = configWebURL.substring( 0, configWebURL.indexOf('/sites/') );
      configWebURL += '/sites/PreConfigProps/';

      let thisProps: string[] = Object.keys( this.properties );

      //Must remove 'newMap' from props because it's one can't be mapped.
      //let newMapIdx = thisProps.indexOf('newMap');
      //if (newMapIdx > -1) { thisProps.splice(newMapIdx, 1); }

      //if ( runAsync === true ) {
        newMap = await getAllItems(configWebURL, 'DrilldownPreConfigProps', thisProps, runAsync );
      //} else {
      //  newMap = getAllItems(configWebURL, 'DrilldownPreConfigProps', thisProps, runAsync );
      //}

      this.properties.newMap = newMap;
      console.log('this.properties.newMap:',  this.properties.newMap );

    } else {
      console.log('NOT GETTING LIST DEFINITIONS, already fetched:', this.properties.newMap);
      newMap = this.properties.newMap;

    }
    
    return newMap;
  }

  protected async onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any) {

//    console.log('PropFieldChange:', propertyPath, oldValue, newValue);
    if (propertyPath === 'listDefinition' && newValue !== oldValue) {
      //alert("Hey! " +propertyPath +" new value is " + newValue);
      //this.properties.listTitle = "TitleChanged!";
      //this.properties.colTitleText = "TitleTextChanged!";

      if (this.properties.webPartScenario === 'DEV' ) {
        //newMap = getAllItems(configWebURL, 'DrilldownPreConfigProps', thisProps );

      } else if (this.properties.webPartScenario === 'TEAM') {
        //newMap = getAllItems(configWebURL, 'DrilldownPreConfigProps', thisProps );

      } else if (this.properties.webPartScenario === 'CORP') {
        //newMap = getAllItems(configWebURL, 'DrilldownPreConfigProps', thisProps );

      }

      let thisProps: string[] = Object.keys( this.properties );
      const hasValues = Object.keys(this.properties.newMap).length;
//      console.log('listDefinition Old & New: ', oldValue, newValue );
//      console.log('PropFieldChange keys: ', hasValues );

      if (hasValues !== 0) {
        let defIndex : any = doesObjectExistInArray(this.properties.newMap,'Title',newValue);
        if ( defIndex !== false ) {
          thisProps.map( thisWebPartProp => {

            if ( thisWebPartProp !== 'listDefinition') {  

              if ( Object.keys(this.properties.newMap[defIndex]).indexOf(thisWebPartProp) < 0 ) {
                console.log('This thisWebPartProp is not to be mapped or updated:', thisWebPartProp );
              } else {

                let potentialValue = this.properties.newMap[defIndex][thisWebPartProp] ? this.properties.newMap[defIndex][thisWebPartProp] : undefined;

                if ( potentialValue ) { //If value exists, continue

                  potentialValue = potentialValue.replace('\"','"'); //Replace any cases where I copied the hashed characters from JSON file directly.

                  if ( typeof this.properties[thisWebPartProp] === 'boolean') {
                    if ( potentialValue === "true" ) { potentialValue = true; }
                    else if ( potentialValue === "false" ) { potentialValue = false; }
                  }

                  if ( this.properties[thisWebPartProp] !== potentialValue ) { //If values are different, then update
                    if ( potentialValue === '') { //If value is intentionally empty string, do the update
                      this.properties[thisWebPartProp] = potentialValue;
                    } else {
                      this.properties[thisWebPartProp] = potentialValue;
                    }
                  }
                } else { 
                  if ( ['rules0','rules1','rules2'].indexOf(thisWebPartProp) > -1 ) { //These should be arrays of strings
                    if ( thisWebPartProp === 'newMap' ) { alert('Hey!  Why are we trying to set newMap????') ; }
                    this.properties[thisWebPartProp] = [''];
                  } else {
                    this.properties[thisWebPartProp] = '';
                  }
  
                }
              }


            } else { 
              console.log('thisWebPartProp === listDefinition:', defIndex, thisWebPartProp);
              this.properties[thisWebPartProp] = newValue;  }
          });

        } else {
          if ( newValue.toLowerCase() !== 'na') {
            alert('I think there is an error in onPropertyPaneFieldChanged:  \ndefIndex is false.\nCan\'t find listDefintion of ' + newValue);
          } else {
            console.log('I think there is an error in onPropertyPaneFieldChanged:  \ndefIndex is false.\nCan\'t find listDefintion of ' + newValue);
          }

        }

        //this.properties.listTitle = newMap.listDisplay;
        //this.properties.colTitleText = newMap.listMapping.colTitleText;
        //this.properties.colHoverText = newMap.listMapping.colHoverText;

      } else {
        console.log('Did NOT List Defintion... updating column name props');

      }


      this.context.propertyPane.refresh();
    }

    /**
     * This section is used to determine when to refresh the pane options
     */
    let updateOnThese = [
      'setSize','setTab','otherTab','setTab','otherTab','setTab','otherTab','setTab','otherTab',
      'parentListFieldTitles','progress','UpdateTitles','parentListTitle','childListTitle','parentListWeb','childListWeb', 'stats'
    ];
    //alert('props updated');
    console.log('onPropertyPaneFieldChanged:', propertyPath, oldValue, newValue);
    if (updateOnThese.indexOf(propertyPath) > -1 ) {
      this.properties[propertyPath] = newValue;   
      this.context.propertyPane.refresh();

    } else { //This can be removed if it works

    }
    this.render();
  }
}
